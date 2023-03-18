const { StatusCodes } = require("http-status-codes")
const {CustomeError} = require('../Errors/CustomErrors/CustomError')
const express = require('express')
const ErrorCatcher = (err, req, res, next) =>{
    if(err instanceof CustomeError){
        return res.status(err.statusCode).json({err: err.message})
    }else if(err.code === 11000){
        return res.status(StatusCodes.BAD_REQUEST).json({err: 'user with this email already exists'})
    }else if(err.details){
        return res.status(StatusCodes.BAD_REQUEST).json({err: err.details[0].message})
    }
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({err: 'Oops, something went wrong...'})
}

module.exports = ErrorCatcher