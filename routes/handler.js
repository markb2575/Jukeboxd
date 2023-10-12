const express = require('express');
const db = require('../db')
const router = express.Router();


router.post('/login', async (req, res) => {
    let credentials = req.body;
    try {
        //const result = await db.pool.query("select * from User where userID ='" + req.get("username") + "' and password='" + req.get("password") + "'");
        const result = await db.pool.query("select * from User where userID ='" + credentials.username + "' and password='" + credentials.password + "'");
        //const result = await db.pool.query("select * from User where userID =(username) and password=(password)", [credentials.username, credentials.password]);
        if (result.length == 1) {
            res.send("valid"); // CHANGE TODO
        }
        else {
            res.send("invalid"); // CHANGE TODO
        }
    } catch (err) {
        throw err;
    }
});

// POST
router.post('/signup', async (req, res) => {
    let credentials = req.body;
    try {
        //const result = await db.pool.query("insert into User (username, password) values (?,?)", [credentials.username, credentials.password]);
        const exists = await db.pool.query("select * from User where userID ='" + credentials.username + "'")
        if (exists.length == 1) {
            res.send("username taken");
        } else {
            const result = await db.pool.query("insert into User(userID, password) values (?,?)", [credentials.username, credentials.password]);
            res.send("success");
        }
    } catch (err) {
        throw err;
    }
});

module.exports = router;