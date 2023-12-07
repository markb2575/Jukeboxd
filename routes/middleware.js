const jwt = require('jsonwebtoken');
const db = require('../db');

module.exports = function (req, res, next) {
    // Gets the jwt from the request header
    const token = req.headers['authorization']
    // If there is no token return 401 error
    if (!token) return res.sendStatus(401)
    // Verify if the token is valid
    jwt.verify(token, process.env.JWT_SECRET, async (err, jwtVerify) => {
        if (err) return res.sendStatus(403)
        req.user = jwtVerify.username
        try {
            const user = req.user;
            const role = await db.pool.query(`SELECT role FROM Users WHERE binary username = ?;`, [user])
            req.role = -1 // set an identifier role for an invalid user
            if (role.length !== 0) { // check if the user is in the database (if they aren't, then the query will return an empty array)
                req.role = role[0].role // set the role to the users role if they are a valid user (i.e. they are in the database)
            }
            next()
        } catch (err) {
            console.error(err.message);
            res.status(403);
        }
    })
}