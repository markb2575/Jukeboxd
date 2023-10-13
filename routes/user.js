const express = require('express')
const db = require('../db')
const auth = require('./middleware')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();


router.post('/login', async (req, res) => {
    let credentials = req.body;
    try {
        const hash = await db.pool.query("select password from User where userID ='" + credentials.username + "'");
        // userID could not be found
        if (hash.length == 0) return res.status(401).send()
        if (await bcrypt.compare(credentials.password, hash[0].password)) {
            const token = jwt.sign(credentials.username, process.env.JWT_SECRET);
            return res.status(200).send({token: token})
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
        const exists = await db.pool.query("select * from User where userID ='" + credentials.username + "'")
        console.log(exists)
        if (exists.length === 1) return res.status(400).send()
        const hashed = await bcrypt.hash(credentials.password, await bcrypt.genSalt())
        await db.pool.query("insert into User(userID, password) values (?,?)", [credentials.username, hashed]);
        const token = jwt.sign(credentials.username, process.env.JWT_SECRET);
        return res.status(200).send({token: token})
    } catch (err) {
        throw err;
    }
});

module.exports = router;