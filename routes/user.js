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
        const hash = await db.pool.query(`select password from users where username = '${credentials.username}'`);
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
        const exists = await db.pool.query(`select * from users where username = '${credentials.username}'`)
        console.log(exists)
        if (exists.length === 1) return res.status(400).send()
        const hashed = await bcrypt.hash(credentials.password, await bcrypt.genSalt())
        await db.pool.query("insert into users(username, password) values (?,?)", [credentials.username, hashed]);
        return res.status(200).send()
    } catch (err) {
        throw err;
    }
});

router.get('/findUser/:username', async (req, res) => {
    let params = req.params;
    console.log("params",params)
    try {
        const user = await db.pool.query(`select * from users where username = '${params.username}'`);
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
    console.log(usernames)
    try {
        var exists = await db.pool.query(`select user_ID as followerID from users where username = '${usernames.followerUsername}' union all select user_ID as followerID from users where username = '${usernames.followeeUsername}'`)
        if (exists.length != 2) return res.status(400).send()

        console.log(exists)
        // await db.pool.query("insert into followers(follower, followee) values (?,?)", [exists, hashed])
        // const hashed = await bcrypt.hash(credentials.password, await bcrypt.genSalt())
        // await db.pool.query("insert into users(username, password) values (?,?)", [credentials.username, hashed]);
        // return res.status(200).send()
    } catch (err) {
        throw err;
    }
});

module.exports = router;