const express = require('express')
const db = require('../db')
const auth = require('./middleware')
const router = express.Router();

router.get('/', auth, async (req, res) => {
    try {
        const user = await req.user;
        const role = await db.pool.query(`select role from Users where binary username = '${user}'`)
        //console.log("username: ", user, "role: ", role)
        return res.json({ "username": user, "role": role });
    } catch (err) {
        console.error(err.message);
        res.status(500);
    }
});


module.exports = router;