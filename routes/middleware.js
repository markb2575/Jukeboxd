const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    const token = req.headers['authorization']
    if (!token) return res.sendStatus(401)
    jwt.verify(token, process.env.JWT_SECRET, (err, jwtVerify) => {
        if (err) return res.sendStatus(403)
        req.user = jwtVerify.username
        next()
    })
}