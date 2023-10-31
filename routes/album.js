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

router.get('/getAlbum/:albumID', async (req, res) => {
    let params = req.params;
    try {
        console.log("params", params)
        const album = await db.pool.query(`SELECT albums.name AS albumName, image_URL, release_date, artists.name AS artistName, artists.spotify_artist_ID as artistID FROM albums JOIN album_artists ON albums.album_ID = album_artists.album_ID JOIN artists ON album_artists.artist_ID = artists.artist_ID WHERE albums.spotify_album_ID = '${params.albumID}';`);
        //TODO: select songs by albumID
        //   const songs = await db.pool.query(`SELECT albums.name AS albumName, image_URL, release_date, artists.name AS artistName, artists.spotify_artist_ID as artistID FROM albums JOIN album_artists ON albums.album_ID = album_artists.album_ID JOIN artists ON album_artists.artist_ID = artists.artist_ID WHERE albums.spotify_album_ID = '${params.albumID}';`);

        console.log(album)
        if (album.length == 0) return res.status(404).send()
        return res.status(200).json({ "album": album/* , "songs": songs */ })
    } catch (err) {
        throw err;
    }
});


module.exports = router;