const express = require('express')
const db = require('../db')
const auth = require('./middleware')
const router = express.Router();

/**
 * Makes sure the user is authorized to be on the page
 */
router.get('/', auth, async (req, res) => {
    try {
        const username = await req.user; // gets the username from the auth middleware
        const role = await db.pool.query(`select role from Users where binary username = ?;`, [username])
        //console.log("username: ", user, "role: ", role)
        return res.json({ "username": user, "role": role });
    } catch (err) {
        console.error(err.message);
        res.status(500);
    }
});

/**
 * Get the user data, artist data, and review data to be displayed on the admin page. Ensures the user making the request is an admin by checking their role.
 */
router.get('/getData', auth, async (req, res) => {
    try {
        const role = await req.role// gets the role of the user making the request from the auth middleware
        if (role !== 0) { // Check that the user making the request is an admin
            // If the user does not have the proper role, or if they don't have any role (i.e. role is null or undefined) return status 401
            return res.sendStatus(401)
        }

        // Get the users data
        const users = await db.pool.query(`SELECT user_ID, username, artist_ID FROM Users;`)

        // Get the artists data
        const artists = await db.pool.query(`SELECT * FROM Artists;`)

        // Get the reviews data
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

        // Return the users, artists, and reviews data along with status 200
        return res.status(200).json({ "users": users, "artists": artists, "reviews": reviews });

    } catch (err) {
        console.error(err.message);
        res.status(500);
    }
});

/**
 * Method to link or unlink a user with an artist, by taking their user_ID and a specified artist_ID. If they are already linked to the artist then it unlinks them, otherwise it links them
 */
router.put('/changeArtistIDLink', auth, async (req, res) => {
    var outputConsole = false // Variable to output to console for debugging, set to false since everything is working

    let params = req.body;

    // The admin always has user_ID of 1, so we prevent any altering of their account. This is prevented on the frontend as well, but if somehow someone got through the frontend checks, this will prevent it on the backend
    if (params.user_ID === 1) {
        return res.sendStatus(401)
    }

    if (outputConsole) { console.log("params: ", params) }
    if (outputConsole) { console.log("user_ID: ", params.user_ID, "artist_ID: ", params.artist_ID) }
    if (outputConsole) { console.log("user_ID.toString(): ", params.user_ID.toString(), "artist_ID.toString(): ", params.artist_ID.toString()) }

    try {
        const role = await req.role// gets the role of the user making the request from the auth middleware
        if (role !== 0) { // Check that the user making the request is an admin
            // If the user does not have the proper role, or if they don't have any role (i.e. role is null or undefined) return status 401
            return res.sendStatus(401)
        }

        // Get the user's current artist_ID from the database (or an empty array if the user is not in the database)
        const user = await db.pool.query(`SELECT artist_ID FROM Users WHERE user_ID = ?;`, [params.user_ID])

        if (outputConsole) { console.log("user: ", user, "artist_ID: ", user[0].artist_ID) }

        if (user.length === 1) {
            if (params.artist_ID === "") {
                // Remove the link from the user_ID
                if (user[0].artist_ID === null) {
                    // The user isn't linked to an artist, so do nothing
                    if (outputConsole) { console.log("user was not linked to an artist, did nothing") }
                } else {
                    // The user is linked to an artist, so unlink them
                    await db.pool.query(`UPDATE Users SET artist_ID = NULL WHERE user_ID = ?;`, [params.user_ID])
                    if (outputConsole) { console.log("user was linked to an artist, unlinked them") }
                }

            } else {
                // Add a link to the user_ID
                if (outputConsole) { console.log("user[0].artist_ID: ", user[0].artist_ID) }
                if (user[0].artist_ID === null) {
                    const artist = await db.pool.query(`SELECT name FROM Artists WHERE artist_ID = ?;`, [params.artist_ID])
                    if (artist.length === 1) {
                        // The artist is valid, so link the user with this artist
                        await db.pool.query(`UPDATE Users SET artist_ID = ? WHERE user_ID = ?;`, [params.artist_ID, params.user_ID])
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
                        const artist = await db.pool.query(`SELECT name FROM Artists WHERE artist_ID = ?;`, [params.artist_ID])
                        if (artist.length === 1) {
                            // The artist is valid, so link the user with this artist
                            await db.pool.query(`UPDATE Users SET artist_ID = ? WHERE user_ID = ?;`, [params.artist_ID, params.user_ID])
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

        // Get the updated users data, then return it with status 200
        const users = await db.pool.query(`SELECT user_ID, username, artist_ID FROM Users;`)

        if (outputConsole) { console.log("users after changes: ", users) }
        return res.status(200).json({ "users": users });
    } catch (err) {
        console.error(err.message);
        res.status(500);
    }
});

/**
 * Delete the user with the given user_ID. First ensure the user is not the admin, then make sure the user making the request is an admin
 */
router.delete('/deleteUser', auth, async (req, res) => {
    var outputConsole = false // Variable to output to console for debugging, set to false since everything is working

    let params = req.body;

    // The admin always has user_ID of 1, so we prevent any altering of their account. This is prevented on the frontend as well, but if somehow someone got through the frontend checks, this will prevent it on the backend
    if (params.user_ID === 1) {
        return res.sendStatus(401)
    }

    try {
        const role = await req.role// gets the role of the user making the request from the auth middleware
        if (role !== 0) { // Check that the user making the request is an admin
            // If the user does not have the proper role, or if they don't have any role (i.e. role is null or undefined) return status 401
            return res.sendStatus(401)
        }

        // Get the user's current username from the database (or an empty array if the user is not in the database)... this is solely to make sure the user is in the database
        const user = await db.pool.query(`SELECT username FROM Users WHERE user_ID = ?;`, [params.user_ID])

        if (user.length === 1) { // If they're in the database, then delete them
            await db.pool.query(`DELETE FROM Users WHERE user_ID = ?;`, [params.user_ID])
        }

        // Get the updated users data
        const users = await db.pool.query(`SELECT user_ID, username, artist_ID FROM Users;`)

        // Get the updated review data (if the deleted user had a review then this will have changed)
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
        // Return the updated users data and the updated reviews data along with status 200
        return res.status(200).json({ "users": users, "reviews": reviews });
    } catch (err) {
        console.error(err.message);
        res.status(500);
    }
});

/**
 * Deletes a review, whether it be an album or track review
 */
router.delete('/deleteReview', auth, async (req, res) => {
    var outputConsole = false // Variable to output to console for debugging, set to false since everything is working

    let params = req.body;

    try {
        const role = await req.role// gets the role of the user making the request from the auth middleware
        if (role !== 0) { // Check that the user making the request is an admin
            // If the user does not have the proper role, or if they don't have any role (i.e. role is null or undefined) return status 401
            return res.sendStatus(401)
        }

        if (params.item_type === 'album') { // Checks if the review is from an album or a track, then makes sure a review with the given parameters exists
            const review = await db.pool.query(`SELECT * FROM ReviewedAlbum WHERE user_ID = ? AND album_ID = ?;`, [params.user_ID, params.item_ID])
            if (review.length === 1) { // If the review exists, delete it
                await db.pool.query(
                    'DELETE FROM ReviewedAlbum WHERE user_ID = ? AND album_ID = ?',
                    [params.user_ID, params.item_ID]
                );
            }
        } else {
            const review = await db.pool.query(`SELECT * FROM ReviewedTrack WHERE user_ID = ? AND track_ID = ?;`, [params.user_ID, params.item_ID])
            if (review.length === 1) { // If the review exists, delete it
                await db.pool.query(
                    'DELETE FROM ReviewedTrack WHERE user_ID = ? AND track_ID = ?',
                    [params.user_ID, params.item_ID]
                );
            }
        }

        // Get the updated reviews (i.e. without the review that was just deleted)
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
        // Return the updated reviews along with the status 200
        return res.status(200).json({ "reviews": reviews });
    } catch (err) {
        console.error(err.message);
        res.status(500);
    }
});

module.exports = router;