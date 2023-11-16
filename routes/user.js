const express = require('express')
const db = require('../db')
const auth = require('./middleware')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
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

router.post('/login', async (req, res) => {
    let credentials = req.body;
    try {
        const hash = await db.pool.query(`select password from Users where username = '${credentials.username}'`);
        // userID could not be found
        if (hash.length == 0) return res.status(401).send()
        if (await bcrypt.compare(credentials.password, hash[0].password)) {
            var token = jwt.sign({username:credentials.username}, process.env.JWT_SECRET, {expiresIn:'7d'})
            return res.json({"token": token});
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
        const exists = await db.pool.query(`select * from Users where username = '${credentials.username}'`)
        console.log(exists)
        if (exists.length === 1) return res.status(400).send()
        const hashed = await bcrypt.hash(credentials.password, await bcrypt.genSalt())
        await db.pool.query("insert into Users(username, password, role) values (?,?,?)", [credentials.username, hashed, 1]);
        return res.status(200).send()
    } catch (err) {
        throw err;
    }
});

router.get('/findUser/:username', async (req, res) => {
    let params = req.params;
    try {
        const user = await db.pool.query(`select * from Users where username = '${params.username}'`);
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
        const followerID = await db.pool.query(`select user_ID from Users where username = '${usernames.followerUsername}'`)
        const followeeID = await db.pool.query(`select user_ID from Users where username = '${usernames.followeeUsername}'`)
        if (followeeID.length === 0 || followerID.length === 0) return res.status(400).send()
        // check if follower already follows followee
        const exists = await db.pool.query(`select * from Followers where follower = '${followerID[0].user_ID}' and followee = '${followeeID[0].user_ID}'`)
        if (exists.length != 0) return res.status(403).send()
        await db.pool.query("insert into Followers(follower, followee) values (?,?)", [followerID[0].user_ID, followeeID[0].user_ID])
        return res.status(200).send()
    } catch (err) {
        throw err;
    }
});
router.post('/unfollowUser', async (req, res) => {
    let usernames = req.body;
    try {
        const followerID = await db.pool.query(`select user_ID from Users where username = '${usernames.followerUsername}'`)
        const followeeID = await db.pool.query(`select user_ID from Users where username = '${usernames.followeeUsername}'`)
        if (followeeID.length === 0 || followerID.length === 0) return res.status(400).send()
        // // check if follower already follows followee
        const exists = await db.pool.query(`select * from Followers where follower = '${followerID[0].user_ID}' and followee = '${followeeID[0].user_ID}'`)
        if (exists.length === 0) return res.status(403).send()
        await db.pool.query(`delete from Followers where follower = '${followerID[0].user_ID}' and followee = '${followeeID[0].user_ID}'`)
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
        const followerID = await db.pool.query(`select user_ID from Users where username = '${followerUsername}'`)
        const followeeID = await db.pool.query(`select user_ID from Users where username = '${followeeUsername}'`)
        if (followeeID.length === 0 || followerID.length === 0) return res.status(400).send()
        // // check if follower already follows followee
        const exists = await db.pool.query(`select * from Followers where follower = '${followerID[0].user_ID}' and followee = '${followeeID[0].user_ID}'`)
        if (exists.length === 0) {
            console.log("not following")
            return res.status(200).json({'isFollowing' : false})
        } else if (exists.length === 1) {
            console.log("already following")
            return res.status(200).json({'isFollowing' : true})
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
        const tmp = await db.pool.query(`select user_ID from Users where username = '${username}'`)
        var userID = null;
        if(tmp.length > 0) {
            userID = tmp[0].user_ID
        } else {
            return res.status(400).send()
        }
         //get Followers
         const followersList = await db.pool.query(`select U.username from Users U join Followers F on U.user_ID = F.follower where F.followee = '${userID}'`)
         //get following
        const followingList = await db.pool.query(`select U.username from Users U join Followers F on U.user_ID = F.followee where F.follower = '${userID}'`)
        //console.log(FollowersList)
        //console.log(followingList)

         //get listened to tracks
         //get listened to albums
         //get watchlist tracks
         //get watchlist albums

         //combine into JSON object

        return res.status(200).json({
            followers:followersList,
            following:followingList
         })



    } catch (err) {
        throw err;
    }
});



module.exports = router;