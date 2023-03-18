const jwt = require('jsonwebtoken')
const createAccessJWT = (userId) => {
    return jwt.sign({userId}, process.env.JWT_ACCESS, {expiresIn: process.env.JWT_ACCESS_LIFETIME})
}
const createRefreshJWT = (userId) => {
    return jwt.sign({userId}, process.env.JWT_REFRESH, {expiresIn: process.env.JWT_REFRESH_LIFETIME})
}

module.exports = {
    createAccessJWT, 
    createRefreshJWT
}