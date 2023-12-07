const express = require('express')
const db = require('../db')
const auth = require('./middleware')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();


router.get('/', auth, async (req, res) => {
    //console.log("/ called")
    try {
        const username = await req.user;
        const user = await db.pool.query(`SELECT username, role, artist_ID FROM Users WHERE binary username = ?;`, [username])
        if (user.length === 1) {
            var spotify_artist_ID = ""
            if (user[0].artist_ID !== null) {
                const spotifyID = await db.pool.query(`SELECT spotify_artist_ID FROM Artists WHERE artist_ID = '${user[0].artist_ID}';`)
                spotify_artist_ID = spotifyID[0].spotify_artist_ID
            }
            //console.log("spotify_artist_ID: ", spotify_artist_ID)
            return res.status(200).json({ "username": user[0].username, "role": user[0].role, "spotify_artist_ID": spotify_artist_ID });
        } else {
            res.status(500);
        }
        //console.log("username: ", user, "role: ", role)
    } catch (err) {
        console.error(err.message);
        res.status(500);
        //return res.status(500);
    }
});

// Method to get the user information when the navbar calls (this is identical to the above code, but it lets us know when the navbar is calling this method versus when the navigation component is calling this method)
router.get('/getNavBar', auth, async (req, res) => {
    //console.log("getNavBar called")
    try {
        const username = await req.user;
        const user = await db.pool.query(`SELECT username, role, artist_ID FROM Users WHERE binary username = ?;`, [username])
        if (user.length === 1) { // Makes sure the user is in the database
            var spotify_artist_ID = ""
            if (user[0].artist_ID !== null) {
                const spotifyID = await db.pool.query(`SELECT spotify_artist_ID FROM Artists WHERE artist_ID = '${user[0].artist_ID}';`)
                spotify_artist_ID = spotifyID[0].spotify_artist_ID
            }
            //console.log("spotify_artist_ID: ", spotify_artist_ID)
            return res.status(200).json({ "username": user[0].username, "role": user[0].role, "spotify_artist_ID": spotify_artist_ID });
        } else { // If the user is not in the database (their account was deleted), then return status 500
            return res.status(500);
        }
        //console.log("username: ", user, "role: ", role)
    } catch (err) {
        console.error(err.message);
        res.status(500);
        //return res.status(500);
    }
});

/**
 * Takes users login credentials and validate the user
 */
router.post('/login', async (req, res) => {
    let credentials = req.body;

    // Remove any potential issues from the username text
    credentials.username = credentials.username.replace("\\", "\\\\")
    credentials.username = credentials.username.replace(";", "\\;")
    credentials.username = credentials.username.replace("'", "\\'")
    credentials.username = credentials.username.replace("`", "\\`")

    try {
        const hashed_password = await db.pool.query(`SELECT password FROM Users WHERE binary username = ?;`, [credentials.username]);
        // userID could not be found
        if (hashed_password.length === 0) return res.status(401).send()
        if (await bcrypt.compare(credentials.password, hashed_password[0].password)) {
            var token = jwt.sign({ username: credentials.username }, process.env.JWT_SECRET, { expiresIn: '7d' })
            return res.json({ "token": token, "redirect": true, "username": credentials.username });
        }
        // password does not match hash in database
        res.status(401).send()
    } catch (err) {
        throw err;
    }
});

/**
 * Takes users credentials at signup and inserts username and encrypted password into the database
 */
router.post('/signup', async (req, res) => {
    let credentials = req.body;

    // Remove any potential issues from the username text
    credentials.username = credentials.username.replace("\\", "\\\\")
    credentials.username = credentials.username.replace(";", "\\;")
    credentials.username = credentials.username.replace("'", "\\'")
    credentials.username = credentials.username.replace("`", "\\`")

    try {
        // check if the username exists in the database already
        const exists = await db.pool.query(`SELECT * FROM Users WHERE binary username = ?;`, [credentials.username])
        // console.log(exists)
        // if the username already exists return 400 error
        if (exists.length === 1) return res.status(400).send({ "exists": true })
        // hash the password using bcrypt
        const hashed_password = await bcrypt.hash(credentials.password, await bcrypt.genSalt())
        // insert the username and encrypted password into the database
        await db.pool.query("insert into Users(username, password) values (?,?);", [credentials.username, hashed_password]);
        // send back a response with status 200
        return res.status(200).send({ "bcrypt": hashed_password })
    } catch (err) {
        throw err;
    }
});

/**
 * Checks if a username exists in database
 */
router.get('/findUser/:username', async (req, res) => {
    let params = req.params;
    try {
        // check if the username exists in the database already
        const user = await db.pool.query(`SELECT * FROM Users WHERE binary username = ?;`, [params.username]);
        // if username could not be found return 404 error
        // console.log(user)
        if (user.length === 0) return res.status(404).send()
        // if username is found return 200
        return res.status(200).send()
    } catch (err) {
        throw err;
    }
});
/**
 * Follows a user
 */
router.post('/followUser', async (req, res) => {
    let usernames = req.body;
    try {
        // Attempt to get the user_ID of the follower and the followee
        const followerID = await db.pool.query(`SELECT user_ID FROM Users WHERE binary username = ?;`, [usernames.followerUsername])
        const followeeID = await db.pool.query(`SELECT user_ID FROM Users WHERE binary username = ?;`, [usernames.followeeUsername])
        // If either of the users don't exists return 400 error
        if (followeeID.length === 0 || followerID.length === 0) return res.status(400).send()
        // check if follower already follows followee
        const exists = await db.pool.query(`SELECT * FROM Followers WHERE follower = '${followerID[0].user_ID}' AND followee = '${followeeID[0].user_ID}';`)
        if (exists.length != 0) return res.status(403).send()
        // insert a row into Followers indicating a follower follows followee
        await db.pool.query("INSERT INTO Followers(follower, followee) values (?,?);", [followerID[0].user_ID, followeeID[0].user_ID])
        return res.status(200).send()
    } catch (err) {
        throw err;
    }
});
/**
 * Unfollows a user
 */
router.post('/unfollowUser', async (req, res) => {
    let usernames = req.body;
    try {
        // Attempt to get the user_ID of the follower and the followee
        const followerID = await db.pool.query(`SELECT user_ID FROM Users WHERE binary username = ?;`, [usernames.followerUsername])
        const followeeID = await db.pool.query(`SELECT user_ID FROM Users WHERE binary username = ?;`, [usernames.followeeUsername])
        // If either of the users don't exists return 400 error
        if (followeeID.length === 0 || followerID.length === 0) return res.status(400).send()
        // // check if follower already follows followee
        const exists = await db.pool.query(`SELECT * FROM Followers WHERE follower = '${followerID[0].user_ID}' AND followee = '${followeeID[0].user_ID}';`)
        if (exists.length === 0) return res.status(403).send()
        // Remove from this row from Followers table
        await db.pool.query(`DELETE FROM Followers WHERE follower = '${followerID[0].user_ID}' AND followee = '${followeeID[0].user_ID}';`)
        return res.status(200).send()
    } catch (err) {
        throw err;
    }
});
/**
 * Checks whether a user follows another user
 */
router.get('/follower=:followerUsername&followee=:followeeUsername', async (req, res) => {
    //console.log("inside check status")
    //console.log("params",req.params)
    const followerUsername = req.params.followerUsername;
    const followeeUsername = req.params.followeeUsername;
    try {
        //console.log(followerUsername,followeeUsername)
        // Attempt to get the user_ID of the follower and the followee
        const followerID = await db.pool.query(`SELECT user_ID FROM Users WHERE binary username = ?;`, [followerUsername])
        const followeeID = await db.pool.query(`SELECT user_ID FROM Users WHERE binary username = ?;`, [followeeUsername])
        if (followeeID.length === 0 || followerID.length === 0) return res.status(400).send()
        // // check if follower already follows followee
        const exists = await db.pool.query(`SELECT * FROM Followers WHERE follower = '${followerID[0].user_ID}' AND followee = '${followeeID[0].user_ID}';`)
        if (exists.length === 0) {
            // console.log("not following")
            // Return that the user is following
            return res.status(200).json({ 'isFollowing': false })
        } else if (exists.length === 1) {
            // console.log("already following")
            // Return that the user is not following
            return res.status(200).json({ 'isFollowing': true })
        }
        return res.status(400).send()
        // await db.pool.query("insert into Followers(follower, followee) values (?,?)", [followerID[0].user_ID, followeeID[0].user_ID])
        // return res.status(200).send()
    } catch (err) {
        throw err;
    }
});

/**
 * Returns the followers, following, listened to tracks/albums, and saved for later tracks/albums of the specified user
 */
router.get('/profile/:username', async (req, res) => {

    const username = req.params.username;
    try {
        //get user_ID from username
        const tmp = await db.pool.query(`SELECT user_ID FROM Users WHERE binary username = ?;`, [username])
        var userID = null;
        if (tmp.length > 0) {
            userID = tmp[0].user_ID
        } else {
            return res.status(400).send()
        }
        //get followers
        const followersList = await db.pool.query(`SELECT U.username FROM Users U join Followers F on U.user_ID = F.follower WHERE F.followee = '${userID}'`)
        //get following
        const followingList = await db.pool.query(`SELECT U.username FROM Users U join Followers F on U.user_ID = F.followee WHERE F.follower = '${userID}'`)

        //get listened to tracks
        const lTracks = await db.pool.query(
            `SELECT
                LT.rating,
                LT.datetime,
                T.name AS track_name,
                T.spotify_track_ID,
                GROUP_CONCAT(A.name SEPARATOR '|') AS artist_names,
                GROUP_CONCAT(A.spotify_artist_ID SEPARATOR '|') AS artist_ids,
                AL.name AS album_name,
                AL.spotify_album_ID,
                AL.image_URL
            FROM
                ListenedTrack LT
            JOIN
                Tracks T ON LT.track_ID = T.track_ID
            JOIN
                Track_Artists TA ON T.track_ID = TA.track_ID
            JOIN
                Artists A ON TA.artist_ID = A.artist_ID
            JOIN
                Albums AL ON T.album_ID = AL.album_ID
            WHERE
                LT.user_ID = ${userID}
            GROUP BY T.spotify_track_ID, AL.album_ID
            ORDER BY LT.datetime DESC;
`)
        //get listened to albums
        const lAlbums = await db.pool.query(`
            SELECT
                LA.rating,
                LA.datetime,
                AL.name AS album_name,
                AL.spotify_album_ID,
                GROUP_CONCAT(A.name SEPARATOR '|') AS artist_names,
                GROUP_CONCAT(A.spotify_artist_ID SEPARATOR '|') AS artist_ids,
                AL.image_URL
            FROM
                ListenedAlbum LA
            JOIN
                Albums AL ON LA.album_ID = AL.album_ID
            JOIN
                Album_Artists AA ON AL.album_ID = AA.album_ID
            JOIN
                Artists A ON AA.artist_ID = A.artist_ID
            WHERE
                LA.user_ID = ${userID}
            GROUP BY AL.spotify_album_ID
            ORDER BY LA.datetime DESC;

        `)
        //get watchlist tracks
        const wTracks = await db.pool.query(
            `SELECT
                WT.datetime,
                T.name AS track_name,
                T.spotify_track_ID,
                GROUP_CONCAT(A.name SEPARATOR '|') AS artist_names,
                GROUP_CONCAT(A.spotify_artist_ID SEPARATOR '|') AS artist_ids,
                AL.name AS album_name,
                AL.spotify_album_ID,
                AL.image_URL
            FROM
                WatchTrack WT
            JOIN
                Tracks T ON WT.track_ID = T.track_ID
            JOIN
                Track_Artists TA ON T.track_ID = TA.track_ID
            JOIN
                Artists A ON TA.artist_ID = A.artist_ID
            JOIN
                Albums AL ON T.album_ID = AL.album_ID
            WHERE
                WT.user_ID = ${userID}
            GROUP BY T.spotify_track_ID, AL.album_ID
            ORDER BY WT.datetime DESC;
`)
        //get watchlist albums
        const wAlbums = await db.pool.query(`
            SELECT
                WA.datetime,
                AL.name AS album_name,
                AL.spotify_album_ID,
                GROUP_CONCAT(A.name SEPARATOR '|') AS artist_names,
                GROUP_CONCAT(A.spotify_artist_ID SEPARATOR '|') AS artist_ids,
                AL.image_URL
            FROM
                WatchAlbum WA
            JOIN
                Albums AL ON WA.album_ID = AL.album_ID
            JOIN
                Album_Artists AA ON AL.album_ID = AA.album_ID
            JOIN
                Artists A ON AA.artist_ID = A.artist_ID
            WHERE
                WA.user_ID = ${userID}
            GROUP BY AL.spotify_album_ID
            ORDER BY WA.datetime DESC;

        `)


        //combine into JSON object & return

        return res.status(200).json({
            followers: followersList,
            following: followingList,
            lTracks: lTracks,
            lAlbums: lAlbums,
            wTracks: wTracks,
            wAlbums: wAlbums

        })



    } catch (err) {
        throw err;
    }
});

/**
 * Gets the information to display on the homepage for a given user (verifies and determines the user by their token by calling the auth middleware)
 */
router.get('/getHome', auth, async (req, res) => {
    try {
        const username = await req.user; // gets username from the auth middlewear
        const user_ID = await db.pool.query(`SELECT user_ID FROM Users WHERE binary username = ?;`, [username]) // gets the user_ID of the user with the given username
        if (user_ID.length == 1) { // Ensures the user with the username is still in the database (i.e. they haven't had their account deleted)

            // Get up to 5 of the most recent albums or tracks that a user's friends have marked as listened
            const ratingsFromFriends = await db.pool.query(`(
                SELECT U.username, A.name, A.spotify_album_ID AS spotify_item_ID, A.image_URL, LA.rating, LA.datetime, 'album' AS item_type
                FROM ListenedAlbum LA
                JOIN Users U ON LA.user_ID = U.user_ID
                JOIN Albums A ON LA.album_ID = A.album_ID
                WHERE LA.user_ID IN (
                    SELECT followee
                    FROM Followers
                    WHERE follower = '${user_ID[0].user_ID}'
                )
            )
            UNION
            (
                SELECT U.username, T.name, T.spotify_track_ID AS spotify_item_ID, A.image_URL, LT.rating, LT.datetime, 'track' AS item_type
                FROM ListenedTrack LT
                JOIN Users U ON LT.user_ID = U.user_ID
                JOIN Tracks T ON LT.track_ID = T.track_ID
                JOIN Albums A ON T.album_ID = A.album_ID
                WHERE LT.user_ID IN (
                    SELECT followee
                    FROM Followers
                    WHERE follower = '${user_ID[0].user_ID}'
                )
            )
            ORDER BY datetime DESC
            LIMIT 5;
            `)

            // Get up to 6 of the most recent albums or tracks that a user's friends have reviewed
            const reviewsFromFriends = await db.pool.query(`(
                SELECT U.username, A.name, A.spotify_album_ID AS spotify_item_ID, A.image_URL, RA.review, RA.datetime, 'album' AS item_type
                FROM ReviewedAlbum RA
                JOIN Users U ON RA.user_ID = U.user_ID
                JOIN Albums A ON RA.album_ID = A.album_ID
                WHERE RA.user_ID IN (
                    SELECT followee
                    FROM Followers
                    WHERE follower = '${user_ID[0].user_ID}'
                )
            )
            UNION
            (
                SELECT U.username, T.name, T.spotify_track_ID AS spotify_item_ID, A.image_URL, RT.review, RT.datetime, 'track' AS item_type
                FROM ReviewedTrack RT
                JOIN Users U ON RT.user_ID = U.user_ID
                JOIN Tracks T ON RT.track_ID = T.track_ID
                JOIN Albums A ON T.album_ID = A.album_ID
                WHERE RT.user_ID IN (
                    SELECT followee
                    FROM Followers
                    WHERE follower = '${user_ID[0].user_ID}'
                )
            )
            ORDER BY datetime DESC
            LIMIT 6;
            `)

            // Get up to 10 of the most recent reviews regardless of follow status
            const reviews = await db.pool.query(`(
                SELECT U.username, A.name, A.spotify_album_ID AS spotify_item_ID, A.image_URL, RA.review, RA.datetime, 'album' AS item_type
                FROM ReviewedAlbum RA
                JOIN Users U ON RA.user_ID = U.user_ID
                JOIN Albums A ON RA.album_ID = A.album_ID
            )
            UNION
            (
                SELECT U.username, T.name, T.spotify_track_ID AS spotify_item_ID, A.image_URL, RT.review, RT.datetime, 'track' AS item_type
                FROM ReviewedTrack RT
                JOIN Users U ON RT.user_ID = U.user_ID
                JOIN Tracks T ON RT.track_ID = T.track_ID
                JOIN Albums A ON T.album_ID = A.album_ID
            )
            ORDER BY datetime DESC
            LIMIT 10;
            `)

            // Get up to 6 of the most popular albums or tracks based on total number of reviews and marked listened/rated from the past 7 days regardless of follow status
            const popular = await db.pool.query(`SELECT 'album' AS item_type, A.name, A.spotify_album_ID AS spotify_item_ID, A.image_URL,
                    COUNT(DISTINCT LA.user_ID) + COUNT(DISTINCT RA.user_ID) AS total_popularity
            FROM Albums A
            LEFT JOIN ListenedAlbum LA ON A.album_ID = LA.album_ID
            LEFT JOIN ReviewedAlbum RA ON A.album_ID = RA.album_ID
            WHERE COALESCE(LA.datetime, RA.datetime) >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            GROUP BY A.album_ID, A.name
            UNION
            SELECT 'track' AS item_type, T.name, T.spotify_track_ID AS spotify_item_ID, A.image_URL,
                    COUNT(DISTINCT LT.user_ID) + COUNT(DISTINCT RT.user_ID) AS total_popularity
            FROM Tracks T
            LEFT JOIN Albums A ON T.album_ID = A.album_ID
            LEFT JOIN ListenedTrack LT ON T.track_ID = LT.track_ID
            LEFT JOIN ReviewedTrack RT ON T.track_ID = RT.track_ID
            WHERE COALESCE(LT.datetime, RT.datetime) >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            GROUP BY T.track_ID, T.name
            ORDER BY total_popularity DESC
            LIMIT 6;`)

            // Formats the total number of reviews and marked listened/rated into strings (instead of big ints) for each of the top 6 most popular albums/tracks
            // Useful if we wanted to display the total interactions, but currently we don't use this value
            if (popular.length !== 0) {
                for (let index = 0; index < popular.length; index++) {
                    popular[index].total_popularity = popular[index].total_popularity.toString();
                }
            }

            // Return the arrays generated from the various queries back to the front end, where it can then be displayed to show the recent activity and popular albums/tracks
            return res.status(200).json({ "ratingsFromFriends": ratingsFromFriends, "reviewsFromFriends": reviewsFromFriends, "reviews": reviews, "popular": popular })
        }
        else {
            // If the user is no longer in the database (i.e. their account has been deleted, or the token was spoofed), then we return status 500
            return res.status(500)
        }
    }
    catch (err) {
        console.log(err)
        throw err;
    }
})

module.exports = router;