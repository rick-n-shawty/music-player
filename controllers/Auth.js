const User = require('../DB/User')
const {StatusCodes} = require('http-status-codes')
const {createAccessJWT, createRefreshJWT} = require('../tokens')
const joi = require("joi")
const jwt = require('jsonwebtoken')
const {BadRequest, Unauthorized, NotFound} = require('../Errors/CustomErrors/CustomError')

const Login = async(req, res, next) =>{
    const loginSchema = joi.object({
        email: joi.string().email().required(),
        password: joi.string().min(3).max(12)
    })
    const {error, value} = loginSchema.validate(req.body)
    if(error){
        console.log(error)
        return next(error)
    }
    try{
        let {email, password} = value
        const user = await User.findOne({email})
        if(!user) throw new BadRequest('email or password is incorrect')
        password = password.replace(/\s/g, '')
        const isPasswordCorrect = await user.Check(password)
        if(!isPasswordCorrect) throw new BadRequest('email or password is incorrect')
        const accessToken = createAccessJWT(user._id)
        const refreshToken = createRefreshJWT(user._id)
        return res.status(StatusCodes.OK).json({msg: 'logged in', accessToken, refreshToken})
    }catch(err){
        console.log(err)
        return next(err)
    }
}

const Register = async(req, res, next) =>{
    const registerSchema = joi.object({
        email: joi.string().email().required(),
        password: joi.string().required().min(3).max(12)
    })
    const {error, value} = registerSchema.validate(req.body)
    if(error){
        console.log(error)
        return next(error)
    }
    try{
        let {email, password} = value 
        password = password.replace(/\s/g, '')
        const user = await User.create({email, password})
        return res.status(StatusCodes.OK).json({msg: 'user has been created'})
    }catch(err){
        console.log(err)
        return next(err)
    }
}

const NewToken = async (req, res) => {
    const refreshTokenSchema = joi.object({
        refreshToken: joi.string().required()
    })
    const {error, value} = refreshTokenSchema.validate(req.body)
    if(error){
        console.log(error)
        return res.status(StatusCodes.BAD_REQUEST).json({err: 'Invalid request'})
    }
    try{
        const {refreshToken} = value 
        jwt.verify(refreshToken, process.env.JWT_REFRESH, (err, decoded) =>{
            if(err){
                throw new Unauthorized('you are not authorized')
            }
            const userId = decoded.userId 
            const accessToken = createAccessJWT(userId)
            const newRefreshToken = createRefreshJWT(userId)
            return res.status(StatusCodes.OK).json({accessToken, refreshToken: newRefreshToken})
        })
    }catch(err){
        console.log(err)
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({err})
    }
}
module.exports = {
    Login, Register, NewToken
}