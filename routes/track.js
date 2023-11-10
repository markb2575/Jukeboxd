const express = require('express')
const db = require('../db')
const auth = require('./middleware')
const router = express.Router();

router.get('/', auth, async (req, res) => {
    try {
      const user = await req.user;
      return res.json({"username": user});
    } catch (err) {
      console.error(err.message);
      res.status(500);
    }
});

router.get('/getTrack/:trackID', async (req, res) => {
  let params = req.params;
  try {
      console.log("params", params)

      const track = await db.pool.query(`SELECT tracks.name AS trackName, tracks.disc_number, tracks.duration, tracks.explicit, tracks.track_number FROM tracks WHERE tracks.spotify_track_ID = '${params.trackID}';`);
      const artist = await db.pool.query(`SELECT artists.name, artists.spotify_artist_ID AS artistID FROM artists,album_artists,tracks WHERE tracks.spotify_track_ID = '${params.trackID}' AND tracks.album_ID = album_artists.album_ID AND album_artists.artist_ID = artists.artist_ID;`);
      const album = await db.pool.query(`SELECT albums.name, albums.spotify_album_ID AS albumID, albums.image_URL FROM albums, tracks WHERE tracks.spotify_track_ID = '${params.trackID}' AND tracks.album_ID = albums.album_ID;;`);


      console.log(track, artist, album)
      if (album.length == 0 || artist.length == 0 || album.length == 0) return res.status(404).send()
      return res.status(200).json({ "track": track, "artist": artist, "album": album })
  } catch (err) {
      throw err;
  }
});

module.exports = router;