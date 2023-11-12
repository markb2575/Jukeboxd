const express = require('express')
const db = require('../db')
const auth = require('./middleware')
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const user = await req.user;
    return res.json({ "username": user });
  } catch (err) {
    console.error(err.message);
    res.status(500);
  }
});

router.get('/getTrack/:trackID&:username', async (req, res) => {
  let params = req.params;
  try {
    //console.log("params", params)

    const track = await db.pool.query(`SELECT tracks.name AS trackName, tracks.disc_number, tracks.duration, tracks.explicit, tracks.track_number FROM tracks WHERE tracks.spotify_track_ID = '${params.trackID}';`);
    const artist = await db.pool.query(`SELECT artists.name, artists.spotify_artist_ID AS artistID FROM artists,album_artists,tracks WHERE tracks.spotify_track_ID = '${params.trackID}' AND tracks.album_ID = album_artists.album_ID AND album_artists.artist_ID = artists.artist_ID;`);
    const album = await db.pool.query(`SELECT albums.name, albums.spotify_album_ID AS albumID, albums.image_URL FROM albums, tracks WHERE tracks.spotify_track_ID = '${params.trackID}' AND tracks.album_ID = albums.album_ID;;`);

    const track_ID = await db.pool.query(`SELECT tracks.track_ID FROM tracks WHERE tracks.spotify_track_ID = '${params.trackID}';`) // Not returned to keep track_ID private
    const user_ID = await db.pool.query(`SELECT user_ID FROM Users WHERE username = '${params.username}';`) // Not returned to keep user_ID private

    const reviews = await db.pool.query(`SELECT review, datetime, (SELECT username FROM Users WHERE user_ID = ReviewedTrack.user_ID) AS username FROM ReviewedTrack WHERE track_ID = '${track_ID[0].track_ID}';`)
    const review = await db.pool.query(`SELECT review, datetime FROM ReviewedTrack WHERE user_ID = '${user_ID[0].user_ID}' AND track_ID = '${track_ID[0].track_ID}';`)
    const listened = await db.pool.query(`SELECT rating, datetime FROM ListenedTrack WHERE user_ID = '${user_ID[0].user_ID}' AND track_ID = '${track_ID[0].track_ID}';`)
    const watchlist = await db.pool.query(`SELECT datetime FROM WatchTrack WHERE user_ID = '${user_ID[0].user_ID}' AND track_ID = '${track_ID[0].track_ID}';`)


    // console.log(track, artist, album)
    //console.log('User_ID: ', user_ID, 'Review: ', review, 'Listened: ', listened, 'Watchlist: ', watchlist, "Reviews: ", reviews)
    if (album.length == 0 || artist.length == 0 || album.length == 0) return res.status(404).send()
    // return res.status(200).json({ "track": track, "artist": artist, "album": album })
    return res.status(200).json({ "track": track, "artist": artist, "album": album, "review": review, "listened": listened, "watchlist": watchlist, "reviews": reviews })
  } catch (err) {
    throw err;
  }
});

router.post('/setReview', async (req, res) => {
  let params = req.body;

  try {
    // console.log("params setReview", params)

    params.reviewText = params.reviewText.replace("\\", "\\\\")
    params.reviewText = params.reviewText.replace(";", "\\;")
    params.reviewText = params.reviewText.replace("'", "\\'")
    params.reviewText = params.reviewText.replace("`", "\\`")

    // console.log('Review text updated: ', params.reviewText)


    const track_ID = await db.pool.query(`SELECT tracks.track_ID FROM tracks WHERE tracks.spotify_track_ID = '${params.spotifyTrackID}';`) // Not returned to keep track_ID private
    const user_ID = await db.pool.query(`SELECT user_ID FROM Users WHERE username = '${params.username}';`) // Not returned to keep user_ID private

    const currReview = await db.pool.query(`SELECT review, datetime FROM ReviewedTrack WHERE user_ID = '${user_ID[0].user_ID}' AND track_ID = '${track_ID[0].track_ID}';`)

    console.log(currReview)

    try {
      if (currReview.length === 1) {
        if (currReview[0].review === params.reviewText) { // check if the review is the same, if it is do nothing, if not then update it
          console.log("review is the same")
          return res.status(200).send()
        } else {
          await db.pool.query(`UPDATE ReviewedTrack SET review = '${params.reviewText}' WHERE user_ID = '${user_ID[0].user_ID}' AND track_ID = '${track_ID[0].track_ID}';`)
          console.log("review updated")
          return res.status(200).send()
        }
      }

      await db.pool.query(`INSERT INTO ReviewedTrack (user_ID, track_ID, review) VALUES ('${user_ID[0].user_ID}', '${track_ID[0].track_ID}', '${params.reviewText}');`)

      return res.status(200).send()

    } catch (err) {
      console.log(err)
      throw err
    }

  } catch (err) {
    console.log(err)
    throw err;
  }

});

router.post('/setRating', async (req, res) => {
  let params = req.body;

  try {

    const track_ID = await db.pool.query(`SELECT tracks.track_ID FROM tracks WHERE tracks.spotify_track_ID = '${params.spotifyTrackID}';`) // Not returned to keep track_ID private
    const user_ID = await db.pool.query(`SELECT user_ID FROM Users WHERE username = '${params.username}';`) // Not returned to keep user_ID private

    const currRating = await db.pool.query(`SELECT rating, datetime FROM ListenedTrack WHERE user_ID = '${user_ID[0].user_ID}' AND track_ID = '${track_ID[0].track_ID}';`)

    try {
      if (currRating.length === 1) {
        if (currRating[0].rating === params.rating) { // check if the rating is the same, if it is do nothing, if not then update it
          console.log("rating is the same")
          return res.status(200).send()
        } else {
          await db.pool.query(`UPDATE ListenedTrack SET rating = '${params.rating}' WHERE user_ID = '${user_ID[0].user_ID}' AND track_ID = '${track_ID[0].track_ID}';`)
          console.log("rating updated", params.rating)
          return res.status(200).send()
        }
      }

      await db.pool.query(`INSERT INTO ListenedTrack (user_ID, track_ID, rating) VALUES ('${user_ID[0].user_ID}', '${track_ID[0].track_ID}', '${params.rating}');`)

      return res.status(200).send()

    } catch (err) {
      console.log(err)
      throw err
    }

  } catch (err) {
    console.log(err)
    throw err;
  }

});

module.exports = router;