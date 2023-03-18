const jwt = require('jsonwebtoken')
const {StatusCodes} = require('http-status-codes')
const Authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization 
    const token = authHeader.split(' ')[1]
    if(!token) return res.status(StatusCodes.UNAUTHORIZED).json({err: 'unauthorized'}) 
    jwt.verify(token, process.env.JWT_ACCESS, (err, decoded) => {
        if(err) return res.status(StatusCodes.UNAUTHORIZED).json({err: ''})
        const {userId} = decoded
        console.log('USER ID', userId)
        req.userId = userId
        next()
    })
}

module.exports = Authenticate