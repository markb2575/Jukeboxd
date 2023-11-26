const jwt = require('jsonwebtoken');
const db = require('../db');

module.exports = function (req, res, next) {

    const token = req.headers['authorization']
    if (!token) return res.sendStatus(401)
    jwt.verify(token, process.env.JWT_SECRET, async (err, jwtVerify) => {
        if (err) return res.sendStatus(403)
        req.user = jwtVerify.username

        try {
            const user = req.user;
            const role = await db.pool.query(`select role from Users where binary username = '${user}';`)
            //console.log("username: ", user, "role: ", role)
            console.log("role: ", role[0].role)
            req.role = role[0].role
            next()
            /*
            if (role[0].role !== 0) {
                return res.sendStatus(401)
            } else {
                next()
            }
            */
        } catch (err) {
            console.error(err.message);
            res.status(403);
        }
    })
}