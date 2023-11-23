const express = require('express')
const db = require('../db')
const auth = require('./middleware')
const router = express.Router();

router.get('/', auth, async (req, res) => {
    try {
        const user = await req.user;
        const role = await db.pool.query(`select role from Users where binary username = '${user}';`)
        //console.log("username: ", user, "role: ", role)
        return res.json({ "username": user, "role": role });
    } catch (err) {
        console.error(err.message);
        res.status(500);
    }
});

router.get('/getData', async (req, res) => {
    try {
        const users = await db.pool.query(`SELECT user_ID, username, artist_ID FROM Users;`)
        //console.log("users", users)

        const artists = await db.pool.query(`SELECT * FROM Artists;`)
        //console.log("artists", artists)

        const reviews = await db.pool.query(`(
            SELECT U.user_ID, A.album_ID AS item_ID, U.username, A.name, A.spotify_album_ID AS spotify_item_ID, RA.review, RA.datetime, 'album' AS item_type
            FROM ReviewedAlbum RA
            JOIN Users U ON RA.user_ID = U.user_ID
            JOIN Albums A ON RA.album_ID = A.album_ID
        )
        UNION
        (
            SELECT U.user_ID, T.track_ID AS item_ID, U.username, T.name, T.spotify_track_ID AS spotify_item_ID, RT.review, RT.datetime, 'track' AS item_type
            FROM ReviewedTrack RT
            JOIN Users U ON RT.user_ID = U.user_ID
            JOIN Tracks T ON RT.track_ID = T.track_ID
        )
        ORDER BY datetime DESC;
        `)

        return res.status(200).json({ "users": users, "artists": artists, "reviews": reviews});
    } catch (err) {
        console.error(err.message);
        res.status(500);
    }
});




module.exports = router;