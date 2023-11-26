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

router.get('/getData', auth, async (req, res) => {
    try {
        const role = await req.role
        if (role !== 0) {
            return res.sendStatus(401)
        }

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
        //console.log("get admin data called")
        return res.status(200).json({ "users": users, "artists": artists, "reviews": reviews });
    } catch (err) {
        console.error(err.message);
        res.status(500);
    }
});

router.put('/changeArtistIDLink', auth, async (req, res) => {
    let params = req.body;

    if (params.user_ID === 1) {
        return res.sendStatus(401)
    }

    var outputConsole = false

    if (outputConsole) { console.log("params: ", params) }
    if (outputConsole) { console.log("user_ID: ", params.user_ID, "artist_ID: ", params.artist_ID) }
    if (outputConsole) { console.log("user_ID.toString(): ", params.user_ID.toString(), "artist_ID.toString(): ", params.artist_ID.toString()) }

    try {
        const role = await req.role
        if (role !== 0) {
            return res.sendStatus(401)
        }

        const user = await db.pool.query(`SELECT * FROM Users WHERE user_ID = '${params.user_ID}';`)

        if (outputConsole) { console.log("user: ", user, "artist_ID: ", user[0].artist_ID) }

        if (user.length === 1) {
            if (params.artist_ID === "") {
                // Remove the link from the user_ID
                if (user[0].artist_ID === null) {
                    // The user isn't linked to an artist, so do nothing
                    if (outputConsole) { console.log("user was not linked to an artist, did nothing") }
                } else {
                    // The user is linked to an artist, so unlink them
                    await db.pool.query(`UPDATE Users SET artist_ID = NULL WHERE user_ID = '${params.user_ID}';`)
                    if (outputConsole) { console.log("user was linked to an artist, unlinked them") }
                }

            } else {
                // Add a link to the user_ID
                if (outputConsole) { console.log("user[0].artist_ID: ", user[0].artist_ID) }
                if (user[0].artist_ID === null) {
                    const artist = await db.pool.query(`SELECT * FROM Artists WHERE artist_ID = '${params.artist_ID}';`)
                    if (artist.length === 1) {
                        // The artist is valid, so link the user with this artist
                        await db.pool.query(`UPDATE Users SET artist_ID = '${params.artist_ID}' WHERE user_ID = '${params.user_ID}';`)
                        if (outputConsole) { console.log("user was not linked to this artist, linked them") }
                    } else {
                        // The artist ID isn't valid (can occur if the artist_ID is greater than the min and less than the max and the artist with this artist_ID was deleted)
                        // Do nothing
                        if (outputConsole) { console.log("artist_ID is invalid, did nothing") }
                    }

                } else {
                    if (user[0].artist_ID.toString() === params.artist_ID.toString()) {
                        // The user is already linked to this this artist ID, so do nothing
                        if (outputConsole) { console.log("user was already linked to this artist, did nothing") }
                    } else {
                        // Make sure the artist_ID is valid
                        const artist = await db.pool.query(`SELECT * FROM Artists WHERE artist_ID = '${params.artist_ID}';`)
                        if (artist.length === 1) {
                            // The artist is valid, so link the user with this artist
                            await db.pool.query(`UPDATE Users SET artist_ID = '${params.artist_ID}' WHERE user_ID = '${params.user_ID}';`)
                            if (outputConsole) { console.log("user was not linked to this artist, linked them") }
                        } else {
                            // The artist ID isn't valid (can occur if the artist_ID is greater than the min and less than the max and the artist with this artist_ID was deleted)
                            // Do nothing
                            if (outputConsole) { console.log("artist_ID is invalid, did nothing") }
                        }
                    }
                }
            }
        } else {
            // The user_ID doesn't correspond to a user (if it is greater than the minimum but the user with that user_ID was deleted, this can occur)
            // Do nothing
            if (outputConsole) { console.log("user_ID is invalid, did nothing") }
        }

        const users = await db.pool.query(`SELECT user_ID, username, artist_ID FROM Users;`)

        if (outputConsole) { console.log("users after changes: ", users) }
        return res.status(200).json({ "users": users });
    } catch (err) {
        console.error(err.message);
        res.status(500);
    }
});

router.delete('/deleteUser', auth, async (req, res) => {
    let params = req.body;

    if (params.user_ID === 1) {
        return res.sendStatus(401)
    }

    var outputConsole = false

    try {
        const role = await req.role
        if (role !== 0) {
            return res.sendStatus(401)
        }

        const user = await db.pool.query(`SELECT * FROM Users WHERE user_ID = '${params.user_ID}';`)

        if (user.length === 1) {
            await db.pool.query(`DELETE FROM Users WHERE user_ID = '${params.user_ID}';`)
        } else {
            // there is no user with that user_ID, so do nothing
        }

        const users = await db.pool.query(`SELECT user_ID, username, artist_ID FROM Users;`)

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

        if (outputConsole) { console.log("users after user deleted: ", users, "reviews after user deleted: ", reviews) }
        return res.status(200).json({ "users": users, "reviews": reviews });
    } catch (err) {
        console.error(err.message);
        res.status(500);
    }
});

router.delete('/deleteReview', auth, async (req, res) => {
    let params = req.body;

    var outputConsole = false

    try {
        const role = await req.role
        if (role !== 0) {
            return res.sendStatus(401)
        }

        if (params.item_type === 'album') {
            const review = await db.pool.query(`SELECT * FROM ReviewedAlbum WHERE user_ID = '${params.user_ID}' AND album_ID = '${params.item_ID}';`)
            if (review.length === 1) {
                await db.pool.query(
                    'DELETE FROM ReviewedAlbum WHERE user_ID = ? AND album_ID = ?',
                    [params.user_ID, params.item_ID]
                );
            } else {
                // there is no review with that user_ID and album_ID, so do nothing
            }
        } else {
            const review = await db.pool.query(`SELECT * FROM ReviewedTrack WHERE user_ID = '${params.user_ID}' AND track_ID = '${params.item_ID}';`)
            if (review.length === 1) {
                await db.pool.query(
                    'DELETE FROM ReviewedTrack WHERE user_ID = ? AND track_ID = ?',
                    [params.user_ID, params.item_ID]
                );
            } else {
                // there is no review with that user_ID and track_ID, so do nothing
            }
        }

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

        if (outputConsole) { console.log("reviews after review deleted: ", reviews) }
        return res.status(200).json({ "reviews": reviews });
    } catch (err) {
        console.error(err.message);
        res.status(500);
    }
});




module.exports = router;