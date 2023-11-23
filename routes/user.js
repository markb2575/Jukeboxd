const express = require('express')
const db = require('../db')
const auth = require('./middleware')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
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

router.post('/login', async (req, res) => {
    let credentials = req.body;
    try {
        const hash = await db.pool.query(`select password from Users where binary username = '${credentials.username}';`);
        // userID could not be found
        if (hash.length == 0) return res.status(401).send()
        if (await bcrypt.compare(credentials.password, hash[0].password)) {
            var token = jwt.sign({ username: credentials.username }, process.env.JWT_SECRET, { expiresIn: '7d' })
            return res.json({ "token": token });
        }
        // password does not match hash in database
        res.status(401).send()
    } catch (err) {
        throw err;
    }
});

router.post('/signup', async (req, res) => {
    let credentials = req.body;
    try {
        const exists = await db.pool.query(`select * from Users where username = '${credentials.username}';`)
        console.log(exists)
        if (exists.length === 1) return res.status(400).send()
        const hashed = await bcrypt.hash(credentials.password, await bcrypt.genSalt())
        await db.pool.query("insert into Users(username, password) values (?,?);", [credentials.username, hashed]);
        return res.status(200).send()
    } catch (err) {
        throw err;
    }
});

router.get('/findUser/:username', async (req, res) => {
    let params = req.params;
    try {
        const user = await db.pool.query(`select * from Users where username = '${params.username}';`);
        // if username could not be found
        console.log(user)
        if (user.length == 0) return res.status(404).send()
        return res.status(200).send()
    } catch (err) {
        throw err;
    }
});

router.post('/followUser', async (req, res) => {
    let usernames = req.body;
    try {
        const followerID = await db.pool.query(`select user_ID from Users where username = '${usernames.followerUsername}';`)
        const followeeID = await db.pool.query(`select user_ID from Users where username = '${usernames.followeeUsername}';`)
        if (followeeID.length === 0 || followerID.length === 0) return res.status(400).send()
        // check if follower already follows followee
        const exists = await db.pool.query(`select * from Followers where follower = '${followerID[0].user_ID}' and followee = '${followeeID[0].user_ID}';`)
        if (exists.length != 0) return res.status(403).send()
        await db.pool.query("insert into Followers(follower, followee) values (?,?);", [followerID[0].user_ID, followeeID[0].user_ID])
        return res.status(200).send()
    } catch (err) {
        throw err;
    }
});
router.post('/unfollowUser', async (req, res) => {
    let usernames = req.body;
    try {
        const followerID = await db.pool.query(`select user_ID from Users where username = '${usernames.followerUsername}';`)
        const followeeID = await db.pool.query(`select user_ID from Users where username = '${usernames.followeeUsername}';`)
        if (followeeID.length === 0 || followerID.length === 0) return res.status(400).send()
        // // check if follower already follows followee
        const exists = await db.pool.query(`select * from Followers where follower = '${followerID[0].user_ID}' and followee = '${followeeID[0].user_ID}';`)
        if (exists.length === 0) return res.status(403).send()
        await db.pool.query(`delete from Followers where follower = '${followerID[0].user_ID}' and followee = '${followeeID[0].user_ID}';`)
        return res.status(200).send()
    } catch (err) {
        throw err;
    }
});
router.get('/follower=:followerUsername&followee=:followeeUsername', async (req, res) => {
    //console.log("inside check status")
    //console.log("params",req.params)
    const followerUsername = req.params.followerUsername;
    const followeeUsername = req.params.followeeUsername;
    try {
        //console.log(followerUsername,followeeUsername)
        const followerID = await db.pool.query(`select user_ID from Users where username = '${followerUsername}';`)
        const followeeID = await db.pool.query(`select user_ID from Users where username = '${followeeUsername}';`)
        if (followeeID.length === 0 || followerID.length === 0) return res.status(400).send()
        // // check if follower already follows followee
        const exists = await db.pool.query(`select * from Followers where follower = '${followerID[0].user_ID}' and followee = '${followeeID[0].user_ID}';`)
        if (exists.length === 0) {
            console.log("not following")
            return res.status(200).json({ 'isFollowing': false })
        } else if (exists.length === 1) {
            console.log("already following")
            return res.status(200).json({ 'isFollowing': true })
        }
        return res.status(400).send()
        // await db.pool.query("insert into Followers(follower, followee) values (?,?)", [followerID[0].user_ID, followeeID[0].user_ID])
        // return res.status(200).send()
    } catch (err) {
        throw err;
    }
});

router.get('/profile/:username', async (req, res) => {
    const username = req.params.username;
    try {
        const tmp = await db.pool.query(`select user_ID from Users where username = '${username}';`)
        var userID = null;
        if (tmp.length > 0) {
            userID = tmp[0].user_ID
        } else {
            return res.status(400).send()
        }
        //get Followers
        const followersList = await db.pool.query(`select U.username from Users U join Followers F on U.user_ID = F.follower where F.followee = '${userID}';`)
        //get following
        const followingList = await db.pool.query(`select U.username from Users U join Followers F on U.user_ID = F.followee where F.follower = '${userID}';`)
        //console.log(FollowersList)
        //console.log(followingList)

        //get listened to tracks
        //get listened to albums
        //get watchlist tracks
        //get watchlist albums

        //combine into JSON object

        return res.status(200).json({
            followers: followersList,
            following: followingList
        })



    } catch (err) {
        throw err;
    }
});

router.get('/getHome/:getUsername', async (req, res) => {
    const username = req.params.getUsername;
    //let params = req.params;
    try {
        const user_ID = await db.pool.query(`SELECT user_ID FROM Users WHERE username = ?`, [username]) // Not returned to keep user_ID private
        //const user_ID = await db.pool.query(`SELECT user_ID FROM Users WHERE username = '${username}';`) // Not returned to keep user_ID private

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
        LIMIT 5;
        `)

        // Get 10 most recent reviews regardless of follow status
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

        if (popular.length !== 0) {
            for (let index = 0; index < popular.length; index++) {
                popular[index].total_popularity = popular[index].total_popularity.toString();
            }
        }

        //console.log("ratingsFromFriends", ratingsFromFriends, "reviewsFromFriends", reviewsFromFriends, "reviews", reviews)
        //console.log("popular", popular)
        //console.log("updated home")
        return res.status(200).json({ "ratingsFromFriends": ratingsFromFriends, "reviewsFromFriends": reviewsFromFriends, "reviews": reviews, "popular": popular })
    }
    catch (err) {
        console.log(err)
        throw err;
    }
})



module.exports = router;