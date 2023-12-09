const express = require('express')
const db = require('../db')
const auth = require('./middleware')
const router = express.Router();

/**
 * Gets then returns the track_ID for the track with the associated spotify_track_ID
 *
 * @param {*} spotifyTrackID the spotify_track_ID for the track
 * @returns the track_ID for the track with the associated spotify_track_ID
 */
async function getTrackID(spotifyTrackID) {
  try {
    const track_ID = await db.pool.query(`SELECT Tracks.track_ID FROM Tracks WHERE Tracks.spotify_track_ID = ?;`, [spotifyTrackID])
    return track_ID;
  } catch (err) {
    throw err;
  }
}

/**
 * Gets then returns the user_ID for the user with the associated username
 *
 * @param {*} username the user's username
 * @returns the user_ID for the user with the associated username
 */
async function getUserID(username) {
  try {
    const user_ID = await db.pool.query(`SELECT user_ID FROM Users WHERE binary username = ?;`, [username])
    return user_ID;
  } catch (err) {
    throw err;
  }
}

router.get('/', auth, async (req, res) => {
  try {
    const user = await req.user;
    return res.json({ "username": user });
  } catch (err) {
    console.error(err.message);
    res.status(500);
  }
});

/**
 * Gets the track information, artist information, album information, reviews, and track_ID for the track with the given spotify_track_ID
 * Also gets the user_ID of the user viewing the track, and their review if they wrote one, as well as their rating and the datetime they marked the track as listened, and
 * the datetime they added the track to their watchlist if applicable. Utilizes the getTrackID and getUserID functions to get the information. Returns all the information as
 * a json object, or if it encounters an error (the username or spotify_track_ID are invalid), then it returns a status of 500. If the album, track, or artist queries are empty,
 * then it returns a status of 404.
 */
router.get('/getTrack/:trackID&:username', async (req, res) => {
  let params = req.params;
  try {
    // Gets the track information for the given spotify_track_ID
    const track = await db.pool.query(`SELECT Tracks.name AS trackName, Tracks.disc_number, Tracks.duration, Tracks.explicit, Tracks.track_number FROM Tracks WHERE Tracks.spotify_track_ID = ?;`, [params.trackID])
    // Gets the artist information for the artist on the given given spotify_track_ID
    const artist = await db.pool.query(`SELECT Artists.name, Artists.spotify_artist_ID AS artistID FROM Artists, Track_Artists, Tracks WHERE Tracks.spotify_track_ID = ? AND Tracks.track_ID = Track_Artists.track_ID AND Track_Artists.artist_ID = Artists.artist_ID;`, [params.trackID]);
    // Gets the album information for album that the given spotify_track_ID is a part of
    const album = await db.pool.query(`SELECT Albums.name, Albums.spotify_album_ID AS albumID, Albums.image_URL FROM Albums, Tracks WHERE Tracks.spotify_track_ID = ? AND Tracks.album_ID = Albums.album_ID;`, [params.trackID]);
    // Calls getTrackID to get the track_ID of the track with the given spotify_track_ID
    const track_ID = await getTrackID(params.trackID)
    // Calls getUserID to get the user_ID for the user with the given username (or an empty array if there is no user with the given username in the database... could happen if their account was deleted)
    const user_ID = await getUserID(params.username)

    // Check if the user and track exist in the database
    if (user_ID.length === 0 || track_ID.length === 0) { // If the user doesn't exist in the database, return status 404
      return res.status(404).send()
    }

    // Gets the reviews for the given track (or an empty array if there are no reviews for the track yet)
    const reviews = await db.pool.query(`SELECT review, datetime, (SELECT username FROM Users WHERE user_ID = ReviewedTrack.user_ID) AS username FROM ReviewedTrack WHERE track_ID = '${track_ID[0].track_ID}' ORDER BY datetime DESC;`)
    // Gets the user's review for the given track (or an empty array if they haven't reviewed it)
    const review = await db.pool.query(`SELECT review, datetime FROM ReviewedTrack WHERE user_ID = '${user_ID[0].user_ID}' AND track_ID = '${track_ID[0].track_ID}';`)
    // Gets the user's rating for the track, and the datetime that they marked the track as listened (or an empty array if the user hasn't marked it as listened... If they haven't rated it then the rating is null)
    const listened = await db.pool.query(`SELECT rating, datetime FROM ListenedTrack WHERE user_ID = '${user_ID[0].user_ID}' AND track_ID = '${track_ID[0].track_ID}';`)
    // Gets the datetime that the user added the track to their watchlist (if they haven't added it to their watchlist then it returns an empty array)
    const watchlist = await db.pool.query(`SELECT datetime FROM WatchTrack WHERE user_ID = '${user_ID[0].user_ID}' AND track_ID = '${track_ID[0].track_ID}';`)

    // If the album, track, or artist queries are empty, then it returns a status of 404
    if (album.length === 0 || artist.length === 0 || track.length === 0) return res.status(404).send()

    // return all the information gathered
    return res.status(200).json({ "track": track, "artist": artist, "album": album, "review": review, "listened": listened, "watchlist": watchlist, "reviews": reviews })
  } catch (err) {
    throw err;
  }
});

/**
 * Adds or updates the user's review depending on if they have a review, and if their review is the same as their current review
 */
router.post('/setReview', async (req, res) => {
  let params = req.body;

  try {
    // Remove any potential issues from the review text -- beacuse the queries are paramaterized this isn't strictly necessary anymore
    /*
    params.reviewText = params.reviewText.replace("\\", "\\\\")
    params.reviewText = params.reviewText.replace(";", "\\;")
    params.reviewText = params.reviewText.replace("'", "\\'")
    params.reviewText = params.reviewText.replace("`", "\\`")
    */

    // Calls getTrackID to get the track_ID of the track with the given spotify_track_ID
    const track_ID = await getTrackID(params.spotifyTrackID)
    // Calls getUserID to get the user_ID for the user with the given username (or an empty array if there is no user with the given username in the database... could happen if their account was deleted)
    const user_ID = await getUserID(params.username)

    // Check if the user and track exist in the database
    if (user_ID.length === 0 || track_ID.length === 0) { // If the user doesn't exist in the database, return status 500
      return res.status(500).send()
    }

    // Gets the user's current review for the given track, or an empty array if they haven't reviewed it yet
    const currReview = await db.pool.query(`SELECT review, datetime FROM ReviewedTrack WHERE user_ID = '${user_ID[0].user_ID}' AND track_ID = '${track_ID[0].track_ID}';`)

    try {
      if (currReview.length === 1) { // check if the user has a review already
        if (currReview[0].review === params.reviewText) { // check if the review is the same
          //console.log("review is the same") // review is the same so do nothing
        } else { // the review is not the same, so update it
          await db.pool.query(`UPDATE ReviewedTrack SET review = ? WHERE user_ID = ? AND track_ID = ?;`, [params.reviewText, user_ID[0].user_ID, track_ID[0].track_ID])
          //console.log("review updated")
        }
      } else { // the user did not have a review yet, so insert their review into the table
        await db.pool.query(`INSERT INTO ReviewedTrack (user_ID, track_ID, review) VALUES (?, ?, ?);`, [user_ID[0].user_ID, track_ID[0].track_ID, params.reviewText])
      }
      // Get the updated reviews for the track, then return them with status 200
      const reviews = await db.pool.query(`SELECT review, datetime, (SELECT username FROM Users WHERE user_ID = ReviewedTrack.user_ID) AS username FROM ReviewedTrack WHERE track_ID = '${track_ID[0].track_ID}' ORDER BY datetime DESC;`)
      return res.status(200).json({ "reviews": reviews })

    } catch (err) {
      console.log(err)
      throw err
    }

  } catch (err) {
    console.log(err)
    throw err;
  }

});

/**
 * Deletes the user's review for the given track
 */
router.delete('/deleteReview', async (req, res) => {
  let params = req.body;

  try {

    // Calls getTrackID to get the track_ID of the track with the given spotify_track_ID
    const track_ID = await getTrackID(params.spotifyTrackID)

    // Calls getUserID to get the user_ID for the user with the given username (or an empty array if there is no user with the given username in the database... could happen if their account was deleted)
    const user_ID = await getUserID(params.username)

    // Check if the user and track exist in the database
    if (user_ID.length === 0 || track_ID.length === 0) { // If the user doesn't exist in the database, return status 500
      return res.status(500).send()
    }

    // Delete the review
    await db.pool.query(
      'DELETE FROM ReviewedTrack WHERE user_ID = ? AND track_ID = ?;',
      [user_ID[0].user_ID, track_ID[0].track_ID]
    );
    //console.log("review deleted")

    // Get the new reviews for the track (i.e. all the reviews that existed before except the one that was just deleted), then return them
    const reviews = await db.pool.query(`SELECT review, datetime, (SELECT username FROM Users WHERE user_ID = ReviewedTrack.user_ID) AS username FROM ReviewedTrack WHERE track_ID = '${track_ID[0].track_ID}' ORDER BY datetime DESC;`)
    return res.status(200).json({ "reviews": reviews })

  } catch (err) {
    console.log(err)
    throw err;
  }

});

/**
 * Get the user's review on a given track, or an empty array if they haven't reviewed the track
 */
router.get('/getReview/username=:username&spotifyTrackID=:trackID', async (req, res) => {
  const username = req.params.username;
  const spotifyTrackID = req.params.trackID;

  try {
    // Calls getTrackID to get the track_ID of the track with the given spotify_track_ID
    const track_ID = await getTrackID(spotifyTrackID)

    // Calls getUserID to get the user_ID for the user with the given username (or an empty array if there is no user with the given username in the database... could happen if their account was deleted)
    const user_ID = await getUserID(username)

    // Check if the user and track exist in the database
    if (user_ID.length === 0 || track_ID.length === 0) { // If the user doesn't exist in the database, return status 500
      return res.status(500).send()
    }

    // Get the user's review on a given track, or an empty array if they haven't reviewed the track, then return their review (or the empty array) with status 200
    const review = await db.pool.query(`SELECT review, datetime FROM ReviewedTrack WHERE user_ID = '${user_ID[0].user_ID}' AND track_ID = '${track_ID[0].track_ID}';`)
    return res.status(200).json({ "review": review })

  } catch (err) {
    console.log(err)
    throw err;
  }

});

/**
 * Update the user's rating for a given track, or add a rating if they haven't rated it yet (this also marks it as listened)
 */
router.post('/setRating', async (req, res) => {
  let params = req.body;

  try {
    // Calls getTrackID to get the track_ID of the track with the given spotify_track_ID
    const track_ID = await getTrackID(params.spotifyTrackID)
    // Calls getUserID to get the user_ID for the user with the given username (or an empty array if there is no user with the given username in the database... could happen if their account was deleted)
    const user_ID = await getUserID(params.username)

    // Check if the user and track exist in the database
    if (user_ID.length === 0 || track_ID.length === 0) { // If the user doesn't exist in the database, return status 500
      return res.status(500).send()
    }

    // Get the user's current rating for the given track, or an empty array if they haven't listened to it
    const currRating = await db.pool.query(`SELECT rating, datetime FROM ListenedTrack WHERE user_ID = '${user_ID[0].user_ID}' AND track_ID = '${track_ID[0].track_ID}';`)

    try {
      if (currRating.length === 1) { // Check if they have listened to the track yet
        if (currRating[0].rating === params.rating) { // check if the rating is the same
          //console.log("rating is the same") // rating is the same, so do nothing... In theory the frontend prevents this from being called if the rating is the same
        } else { // Their rating is not the same (this includes the case where they marked it as listened but never rated it, and now they are rating it)
          await db.pool.query(`UPDATE ListenedTrack SET rating = ? WHERE user_ID = ? AND track_ID = ?;`, [params.rating, user_ID[0].user_ID, track_ID[0].track_ID]) // update their rating
          //console.log("rating updated", params.rating)
        }
      } else { // If they haven't marked the track as listened yet, then they also couldn't have rated it, so mark it as listened and add their rating
        await db.pool.query(`INSERT INTO ListenedTrack (user_ID, track_ID, rating) VALUES (?, ?, ?);`, [user_ID[0].user_ID, track_ID[0].track_ID, params.rating])
        //console.log("rated")
      }
      return res.status(200).send() // Return a status of 200 to let the frontend know it has been rated

    } catch (err) {
      console.log(err)
      throw err
    }

  } catch (err) {
    console.log(err)
    throw err;
  }

});

router.post('/add-listened-track/:username/:s_track_id', auth, async (req, res) => {
  try {
    const { username, s_track_id } = req.params;


    const track_ID = await db.pool.query(`SELECT Tracks.track_ID FROM Tracks WHERE Tracks.spotify_track_ID = '${s_track_id}';`) // Not returned to keep track_ID private
    const user_ID = await db.pool.query(`SELECT user_ID FROM Users WHERE username = '${username}';`) // Not returned to keep user_ID private

    // Add the track to the listened Tracks
    await db.pool.query(
      'INSERT INTO ListenedTrack (user_ID, track_ID, rating) VALUES (?, ?, 0)',
      [user_ID[0].user_ID, track_ID[0].track_ID]
    );

    res.status(200).json({ message: 'Track added to listened Tracks' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/add-watch-track/:username/:s_track_id', auth, async (req, res) => {
  try {
    const { username, s_track_id } = req.params;


    const track_ID = await db.pool.query(`SELECT Tracks.track_ID FROM Tracks WHERE Tracks.spotify_track_ID = '${s_track_id}';`) // Not returned to keep track_ID private
    const user_ID = await db.pool.query(`SELECT user_ID FROM Users WHERE username = '${username}';`) // Not returned to keep user_ID private

    // Add the track to the watchlist
    await db.pool.query(
      'INSERT INTO WatchTrack (user_ID, track_ID) VALUES (?, ?)',
      [user_ID[0].user_ID, track_ID[0].track_ID]
    );

    res.status(200).json({ message: 'Track added to watchlist' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.delete('/delete-listened-track/:username/:s_track_id', auth, async (req, res) => {
  try {
    const { username, s_track_id } = req.params;


    const track_ID = await db.pool.query(`SELECT Tracks.track_ID FROM Tracks WHERE Tracks.spotify_track_ID = '${s_track_id}';`) // Not returned to keep track_ID private
    const user_ID = await db.pool.query(`SELECT user_ID FROM Users WHERE username = '${username}';`) // Not returned to keep user_ID private

    // Delete the track from the listened Tracks
    await db.pool.query(
      'DELETE FROM ListenedTrack WHERE user_ID = ? AND track_ID = ?',
      [user_ID[0].user_ID, track_ID[0].track_ID]
    );

    res.status(200).json({ message: 'Track deleted from listened Tracks' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.delete('/delete-watch-track/:username/:s_track_id', auth, async (req, res) => {
  try {
    const { username, s_track_id } = req.params;


    const track_ID = await db.pool.query(`SELECT Tracks.track_ID FROM Tracks WHERE Tracks.spotify_track_ID = '${s_track_id}';`) // Not returned to keep track_ID private
    const user_ID = await db.pool.query(`SELECT user_ID FROM Users WHERE username = '${username}';`) // Not returned to keep user_ID private

    // Remove the track from the watch list
    await db.pool.query(
      'DELETE FROM WatchTrack WHERE user_ID = ? AND track_ID = ?',
      [user_ID[0].user_ID, track_ID[0].track_ID]
    );


    res.status(200).json({ message: 'Track deleted from watchlist' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;