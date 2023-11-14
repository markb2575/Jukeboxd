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

router.get('/getArtist/:artistID&:username', async (req, res) => {
  let params = req.params;
  try {
    const artist = await db.pool.query(`SELECT artists.name AS artistName FROM artists WHERE artists.spotify_artist_ID = '${params.artistID}';`);
    const albums = await db.pool.query(`SELECT albums.name AS albumName, albums.spotify_album_ID AS albumID, albums.image_URL FROM albums, album_artists, artists WHERE albums.album_ID = album_artists.album_ID AND album_artists.artist_ID = artists.artist_ID AND artists.spotify_artist_ID = '${params.artistID}';`);
    const tracks = await db.pool.query(`SELECT tracks.name AS trackName, tracks.spotify_track_ID AS trackID, albums.image_URL FROM tracks LEFT JOIN albums ON tracks.album_ID = albums.album_ID LEFT JOIN track_artists ON track_artists.track_ID = tracks.track_ID LEFT JOIN artists ON artists.artist_ID = track_artists.artist_ID WHERE artists.spotify_artist_ID = '${params.artistID}';`);
    console.log(artist, albums, tracks)
    
    // const track = await db.pool.query(`SELECT tracks.name AS trackName, tracks.disc_number, tracks.duration, tracks.explicit, tracks.track_number FROM tracks WHERE tracks.spotify_track_ID = '${params.trackID}';`);
    // const artist = await db.pool.query(`SELECT artists.name, artists.spotify_artist_ID AS artistID FROM artists,album_artists,tracks WHERE tracks.spotify_track_ID = '${params.trackID}' AND tracks.album_ID = album_artists.album_ID AND album_artists.artist_ID = artists.artist_ID;`);
    // const album = await db.pool.query(`SELECT albums.name, albums.spotify_album_ID AS albumID, albums.image_URL FROM albums, tracks WHERE tracks.spotify_track_ID = '${params.trackID}' AND tracks.album_ID = albums.album_ID;;`);

    // const track_ID = await db.pool.query(`SELECT tracks.track_ID FROM tracks WHERE tracks.spotify_track_ID = '${params.trackID}';`) // Not returned to keep track_ID private
    // const user_ID = await db.pool.query(`SELECT user_ID FROM Users WHERE username = '${params.username}';`) // Not returned to keep user_ID private

    // const reviews = await db.pool.query(`SELECT review, datetime, (SELECT username FROM Users WHERE user_ID = ReviewedTrack.user_ID) AS username FROM ReviewedTrack WHERE track_ID = '${track_ID[0].track_ID}';`)
    // const review = await db.pool.query(`SELECT review, datetime FROM ReviewedTrack WHERE user_ID = '${user_ID[0].user_ID}' AND track_ID = '${track_ID[0].track_ID}';`)
    // const listened = await db.pool.query(`SELECT rating, datetime FROM ListenedTrack WHERE user_ID = '${user_ID[0].user_ID}' AND track_ID = '${track_ID[0].track_ID}';`)
    // const watchlist = await db.pool.query(`SELECT datetime FROM WatchTrack WHERE user_ID = '${user_ID[0].user_ID}' AND track_ID = '${track_ID[0].track_ID}';`)


    // console.log(track, artist, album)
    //console.log('User_ID: ', user_ID, 'Review: ', review, 'Listened: ', listened, 'Watchlist: ', watchlist, "Reviews: ", reviews)
    if (artist.length == 0) return res.status(404).send()
    return res.status(200).json({ "artistName": artist[0].artistName, "albums": albums, "tracks": tracks })
    // return res.status(200).json({ "track": track, "artist": artist, "album": album, "review": review, "listened": listened, "watchlist": watchlist, "reviews": reviews })
  } catch (err) {
    throw err;
  }
});




module.exports = router;