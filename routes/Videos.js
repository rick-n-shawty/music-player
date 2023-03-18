const express = require('express')
const router = express.Router()
// find out why the server switches to the websockets 
const {S3Client, PutObjectCommand, GetObjectCommand} = require('@aws-sdk/client-s3')
const {getSignedUrl} = require('@aws-sdk/s3-request-presigner')
const Video = require('../DB/Video')
const User = require('../DB/User')
const s3 = new S3Client({
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY
    },
    region: 'us-east-1'
})

const multer = require('multer')
const { StatusCodes } = require('http-status-codes')
const storage = multer.memoryStorage()
const crypto = require('crypto')
const upload = multer({storage})
const Audio = require('../DB/Audio')

router.post('/videos', upload.single('video'), async (req, res) => {
    const buffer = req.file.buffer
    const AWS_ID = await crypto.randomBytes(32).toString('hex') 
    const userId = req.userId
    console.log(req.file.filename)
    try{
        const putVideoCommand = new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: AWS_ID,
            Body: buffer,
            ContentType: req.file.mimetype
        })
        const aws_response = await s3.send(putVideoCommand)
        const video = await Video.create({AWS_ID: AWS_ID, createdBy: userId})
        const user = await User.findOneAndUpdate({_id: userId}, {$push: {videos: video._id}})
        // update user as well 
        console.log(aws_response)
        return res.status(StatusCodes.OK).json({msg: 'okay'})
    }catch(err){
        console.log(err)
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({err})
    }
})

router.get('/videos', async(req, res) =>{
    const userId= req.userId
    try{
        const videos = await Video.find({createdBy: userId}) 
        for(const video of videos){
            const AWS_ID = video.AWS_ID
            const getObjectCommand = new GetObjectCommand({
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: AWS_ID
            })
            const url = await getSignedUrl(s3, getObjectCommand)
            console.log(url)
            video.httpUrl = url
        }
        return res.status(StatusCodes.OK).json({videos})
    }catch(err){
        console.log(err)
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({err})
    }
})

router.delete('/videos/:id')



module.exports = router