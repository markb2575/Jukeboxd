const express = require('express')
const db = require('../db')
const auth = require('./middleware')
const router = express.Router();

/**
 * Gets then returns the album_ID for the album with the associated spotify_album_ID
 *
 * @param {*} spotifyAlbumID the spotify_album_ID for the album
 * @returns the album_ID for the album with the associated spotify_album_ID
 */
async function getAlbumID(spotifyAlbumID) {
  try {
    const album_ID = await db.pool.query(`SELECT Albums.album_ID FROM Albums WHERE Albums.spotify_album_ID = ?;`, [spotifyAlbumID])
    return album_ID;
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
 * Gets the album information (including the artists), and the songs on the album for a given spotify_album_ID. Gets the album_ID from the spotify_album_ID, and the user_ID from the given
 * username, then finds all the reviews if there are any for the album, as well as the user's review if they have reviewed the album. Gets the listened (including rating), and watchlist
 * information for the given user for the album
 */
router.get('/getAlbum/:albumID&:username', async (req, res) => {
  let params = req.params;
  try {
    // Gets the album information for the given spotify_album_ID
    const album = await db.pool.query(`SELECT Albums.name AS albumName, image_URL, release_date, Artists.name AS artistName, Artists.spotify_artist_ID as artistID FROM Albums JOIN Album_Artists ON Albums.album_ID = Album_Artists.album_ID JOIN Artists ON Album_Artists.artist_ID = Artists.artist_ID WHERE Albums.spotify_album_ID = ?;`, [params.albumID]);
    // Gets the songs that are on the album for the given spotify_album_ID
    const songs = await db.pool.query(`SELECT Tracks.name AS trackName, Tracks.spotify_track_ID FROM Tracks, Albums WHERE Tracks.album_ID = Albums.album_ID AND Albums.spotify_album_ID = ?;`, [params.albumID]);

    // Calls getAlbumID to get the album_ID of the album with the given spotify_album_ID
    const album_ID = await getAlbumID(params.albumID)
    // Calls getUserID to get the user_ID for the user with the given username (or an empty array if there is no user with the given username in the database... could happen if their account was deleted)
    const user_ID = await getUserID(params.username)

    // Check if the user and album exist in the database... if either of them dont then it returns a status of 404
    if (user_ID.length === 0 || album_ID.length === 0) return res.status(404).send()

    // Gets the reviews for the given album (or an empty array if there are no reviews for the album yet)
    const reviews = await db.pool.query(`SELECT review, datetime, (SELECT username FROM Users WHERE user_ID = ReviewedAlbum.user_ID) AS username FROM ReviewedAlbum WHERE album_ID = '${album_ID[0].album_ID}' ORDER BY datetime DESC;`)
    // Gets the user's review for the given album (or an empty array if they haven't reviewed it)
    const review = await db.pool.query(`SELECT review, datetime FROM ReviewedAlbum WHERE user_ID = '${user_ID[0].user_ID}' AND album_ID = '${album_ID[0].album_ID}';`)
    // Gets the user's rating for the album, and the datetime that they marked the album as listened (or an empty array if the user hasn't marked it as listened... If they haven't rated it then the rating is null)
    const listened = await db.pool.query(`SELECT rating, datetime FROM ListenedAlbum WHERE user_ID = '${user_ID[0].user_ID}' AND album_ID = '${album_ID[0].album_ID}';`)
    // Gets the datetime that the user added the album to their watchlist (if they haven't added it to their watchlist then it returns an empty array)
    const watchlist = await db.pool.query(`SELECT datetime FROM WatchAlbum WHERE user_ID = '${user_ID[0].user_ID}' AND album_ID = '${album_ID[0].album_ID}';`)

    // If the album or the songs are empty arrays, then return status of 404
    if (album.length === 0 || songs.length === 0) return res.status(404).send()
    // return all the information gathered
    return res.status(200).json({ "album": album, "songs": songs, "reviews": reviews, "review": review, "listened": listened, "watchlist": watchlist })
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
    // Remove any potential issues from the review text -- beacuse the queries are parameterized this isn't strictly necessary anymore
    /*
    params.reviewText = params.reviewText.replace("\\", "\\\\")
    params.reviewText = params.reviewText.replace(";", "\\;")
    params.reviewText = params.reviewText.replace("'", "\\'")
    params.reviewText = params.reviewText.replace("`", "\\`")
    */

    // Calls getAlbumID to get the album_ID of the album with the given spotify_album_ID
    const album_ID = await getAlbumID(params.spotifyAlbumID)
    // Calls getUserID to get the user_ID for the user with the given username (or an empty array if there is no user with the given username in the database... could happen if their account was deleted)
    const user_ID = await getUserID(params.username)

    // Check if the user and album exist in the database
    if (user_ID.length === 0 || album_ID.length === 0) { // If the user doesn't exist in the database, return status 500
      return res.status(500).send()
    }

    // Gets the user's current review for the given album, or an empty array if they haven't reviewed it yet
    const currReview = await db.pool.query(`SELECT review, datetime FROM ReviewedAlbum WHERE user_ID = '${user_ID[0].user_ID}' AND album_ID = '${album_ID[0].album_ID}';`)

    try {
      if (currReview.length === 1) { // Check if the user has a review already
        if (currReview[0].review === params.reviewText) { // check if the review is the same
          //console.log("review is the same") // Review is the same, so do nothing
        } else { // the review is not the same, so update it
          await db.pool.query(`UPDATE ReviewedAlbum SET review = ? WHERE user_ID = ? AND album_ID = ?;`, [params.reviewText, user_ID[0].user_ID, album_ID[0].album_ID])
          //console.log("review updated")
        }
      } else { // the user did not have a review yet, so insert their review into the table
        await db.pool.query(`INSERT INTO ReviewedAlbum (user_ID, album_ID, review) VALUES (?, ?, ?);`, [user_ID[0].user_ID, album_ID[0].album_ID, params.reviewText])
      }
      // Get the updated reviews for the album, then return them with status 200
      const reviews = await db.pool.query(`SELECT review, datetime, (SELECT username FROM Users WHERE user_ID = ReviewedAlbum.user_ID) AS username FROM ReviewedAlbum WHERE album_ID = '${album_ID[0].album_ID}' ORDER BY datetime DESC;`)
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
 * Deletes the user's review for the given album
 */
router.delete('/deleteReview', async (req, res) => {
  let params = req.body;

  try {
    // Calls getAlbumID to get the album_ID of the album with the given spotify_album_ID
    const album_ID = await getAlbumID(params.spotifyAlbumID)
    // Calls getUserID to get the user_ID for the user with the given username (or an empty array if there is no user with the given username in the database... could happen if their account was deleted)
    const user_ID = await getUserID(params.username)

    // Check if the user and album exist in the database
    if (user_ID.length === 0 || album_ID.length === 0) { // If the user doesn't exist in the database, return status 500
      return res.status(500).send()
    }

    // Delete the review
    await db.pool.query(
      'DELETE FROM ReviewedAlbum WHERE user_ID = ? AND album_ID = ?',
      [user_ID[0].user_ID, album_ID[0].album_ID]
    );

    // Get the new reviews for the album (i.e. all the reviews that existed before except the one that was just deleted), then return them
    const reviews = await db.pool.query(`SELECT review, datetime, (SELECT username FROM Users WHERE user_ID = ReviewedAlbum.user_ID) AS username FROM ReviewedAlbum WHERE album_ID = '${album_ID[0].album_ID}' ORDER BY datetime DESC;`)
    return res.status(200).json({ "reviews": reviews })

  } catch (err) {
    console.log(err)
    throw err;
  }

});

/**
 * Get the user's review on a given album, or an empty array if they haven't reviewed the album
 */
router.get('/getReview/username=:username&spotifyAlbumID=:albumID', async (req, res) => {
  const username = req.params.username;
  const spotifyAlbumID = req.params.albumID;

  try {
    // Calls getAlbumID to get the album_ID of the album with the given spotify_album_ID
    const album_ID = await getAlbumID(spotifyAlbumID)
    // Calls getUserID to get the user_ID for the user with the given username (or an empty array if there is no user with the given username in the database... could happen if their account was deleted)
    const user_ID = await getUserID(username)

    // Check if the user and album exist in the database
    if (user_ID.length === 0 || album_ID.length === 0) return res.status(404).send()

    // Get the user's review on the given album, or an empty array if they haven't reviewed the album, then return their review (or the empty array) with status 200
    const review = await db.pool.query(`SELECT review, datetime FROM ReviewedAlbum WHERE user_ID = '${user_ID[0].user_ID}' AND album_ID = '${album_ID[0].album_ID}';`)
    return res.status(200).json({ "review": review })

  } catch (err) {
    console.log(err)
    throw err;
  }

});

/**
 * Update the user's rating for a given album, or add a rating if they haven't rated it yet (this also marks it as listened)
 */
router.post('/setRating', async (req, res) => {
  let params = req.body;

  try {
    // Calls getAlbumID to get the album_ID of the album with the given spotify_album_ID
    const album_ID = await getAlbumID(params.spotifyAlbumID)
    // Calls getUserID to get the user_ID for the user with the given username (or an empty array if there is no user with the given username in the database... could happen if their account was deleted)
    const user_ID = await getUserID(params.username)

    // Check if the user and album exist in the database
    if (user_ID.length === 0 || album_ID.length === 0) { // If the user doesn't exist in the database, return status 500
      return res.status(500).send()
    }

    // Get the user's current rating for the given album, or an empty array if they haven't listened to it
    const currRating = await db.pool.query(`SELECT rating, datetime FROM ListenedAlbum WHERE user_ID = '${user_ID[0].user_ID}' AND album_ID = '${album_ID[0].album_ID}';`)

    try {
      if (currRating.length === 1) { // Check if they have listened to the album yet
        if (currRating[0].rating === params.rating) { // check if the rating is the same
          //console.log("rating is the same") // rating is the same, so do nothing... In theory the frontend prevents this from being called if the rating is the same
        } else { // Their rating is not the same (this includes the case where they marked it as listened but never rated it, and now they are rating it)
          await db.pool.query(`UPDATE ListenedAlbum SET rating = ? WHERE user_ID = ? AND album_ID = ?;`, [params.rating, user_ID[0].user_ID, album_ID[0].album_ID]) // update their rating
          //console.log("rating updated")
        }
      } else { // If they haven't marked the album as listened yet, then they also couldn't have rated it, so mark it as listened and add their rating
        await db.pool.query(`INSERT INTO ListenedAlbum (user_ID, album_ID, rating) VALUES (?, ?, ?);`, [user_ID[0].user_ID, album_ID[0].album_ID, params.rating])
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

router.post('/add-listened-album/:username/:s_album_id', auth, async (req, res) => {
  try {
    const { username, s_album_id } = req.params;


    const album_ID = await db.pool.query(`SELECT Albums.album_ID FROM Albums WHERE Albums.spotify_album_ID = '${s_album_id}';`)
    const user_ID = await db.pool.query(`SELECT user_ID FROM Users WHERE username = '${username}';`)

    // Add the album to the listened Albums
    await db.pool.query(
      'INSERT INTO ListenedAlbum (user_ID, album_ID, rating) VALUES (?, ?, 0)',
      [user_ID[0].user_ID, album_ID[0].album_ID]
    );

    res.status(200).json({ message: 'Album added to listened Albums' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/add-watch-album/:username/:s_album_id', auth, async (req, res) => {
  try {
    const { username, s_album_id } = req.params;


    const album_ID = await db.pool.query(`SELECT Albums.album_ID FROM Albums WHERE Albums.spotify_album_ID = '${s_album_id}';`)
    const user_ID = await db.pool.query(`SELECT user_ID FROM Users WHERE username = '${username}';`) // Not returned to keep user_ID private

    // Add the album to the watch list
    await db.pool.query(
      'INSERT INTO WatchAlbum (user_ID, album_ID) VALUES (?, ?)',
      [user_ID[0].user_ID, album_ID[0].album_ID]
    );

    res.status(200).json({ message: 'Album added to watch list' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.delete('/delete-listened-album/:username/:s_album_id', auth, async (req, res) => {
  try {
    const { username, s_album_id } = req.params;


    const album_ID = await db.pool.query(`SELECT Albums.album_ID FROM Albums WHERE Albums.spotify_album_ID = '${s_album_id}';`)
    const user_ID = await db.pool.query(`SELECT user_ID FROM Users WHERE username = '${username}';`) // Not returned to keep user_ID private

    // Delete the album from the listened Albums
    await db.pool.query(
      'DELETE FROM ListenedAlbum WHERE user_ID = ? AND album_ID = ?',
      [user_ID[0].user_ID, album_ID[0].album_ID]
    );

    res.status(200).json({ message: 'Album deleted from listened Albums' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.delete('/delete-watch-album/:username/:s_album_id', auth, async (req, res) => {
  try {
    const { username, s_album_id } = req.params;


    const album_ID = await db.pool.query(`SELECT Albums.album_ID FROM Albums WHERE Albums.spotify_album_ID = '${s_album_id}';`)
    const user_ID = await db.pool.query(`SELECT user_ID FROM Users WHERE username = '${username}';`) // Not returned to keep user_ID private

    // Remove the album from the watch list
    await db.pool.query(
      'DELETE FROM WatchAlbum WHERE user_ID = ? AND album_ID = ?',
      [user_ID[0].user_ID, album_ID[0].album_ID]
    );


    res.status(200).json({ message: 'album deleted from watchlist' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;