const {S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand} = require('@aws-sdk/client-s3')
const { StatusCodes } = require('http-status-codes')
const {CloudFrontClient, CreateInvalidationCommand  } = require('@aws-sdk/client-cloudfront')
const mongoose = require('mongoose')
const {getSignedUrl} = require('@aws-sdk/cloudfront-signer')
const s3 = new S3Client({
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY
    },
    region: 'us-east-1'
})
const CloudFront = new CloudFrontClient({
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY
    },
    region: 'us-east-1'
})

const Audio = require('../DB/Audio')
const crypto = require('crypto')
const PostAudio = async (req, res) =>{
    const userId = req.userId
    try{
        const buffer = req.file.buffer 
        console.log(buffer)
        const AWS_ID = await crypto.randomBytes(32).toString('hex')
        const putCommand = new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: AWS_ID,
            Body: buffer,
            ContentType: req.file.mimetype
        })
        const s3_response = await s3.send(putCommand)
        console.log(s3_response)
        console.log('name', req.file)
        let songName = req.file.originalname 
        songName = songName.slice(0, songName.length - 4)
        const audio = await Audio.create({AWS_ID, createdBy: userId, songName: songName})
        return res.status(StatusCodes.OK).json({msg: 'oki'})
    }catch(err){
        console.log(err)
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({err})
    }
}

const GetAudios = async(req, res, next) =>{
    try{
        const userId = req.userId 
        const audios = await Audio.find({createdBy: userId})
        console.log(await Audio.find({createdBy: userId}).explain('executionStats'))
        for(const item of audios){
            const url = getSignedUrl({
                url: `${process.env.CDN_URL}/${item.AWS_ID}`,
                dateLessThan: new Date(Date.now() + 1000 * 60 * 60 * 2),
                privateKey: process.env.CLOUDFRONT_PRIVATE_KEY,
                keyPairId: process.env.CLOUDFRONT_KEY_PAIR_ID
            })
            item.httpUrl = url
        }
        return res.status(StatusCodes.OK).json({msg: 'here u go', audios})
    }catch(err){
        console.log(err)
        return next(err)
    }
}

const DeleteAudio = async (req, res) => {
    try{
        const userId = req.userId 
        // guard 
        const audioId = req.params.id 
        const deleteCommand = new DeleteObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: audioId
        })
        const s3_response = await s3.send(deleteCommand) 
        console.log(s3_response)
        const InvalidationCommand = new CreateInvalidationCommand({
            DistributionId: process.env.DISTRIBUTION_ID,
            InvalidationBatch: {
                CallerReference: audioId,
                Paths: {
                    Quantity: 1,
                    Items: [`/${audioId}`]
                }
            }
        })
        await CloudFront.send(InvalidationCommand)
        const audio = await Audio.findOneAndDelete({createdBy: userId, AWS_ID: audioId})
        return res.status(StatusCodes.OK).json({msg: 'oki'})
    }catch(err){
        console.log(err)
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({err})
    }
}
const DeleteAllAudios = async(req, res) =>{
    try{
        const userId = req.userId
        const audios = await Audio.find({createdBy: userId})
        for(const item of audios){
            const deleteCommand = new DeleteObjectCommand({
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: item.AWS_ID
            })
            await s3.send(deleteCommand)
        }
        await Audio.deleteMany({createdBy: userId})
        return res.status(StatusCodes.OK).json({msg: 'you deleted everything'})
    }catch(err){
        console.log(err)
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({err})
    }
}


module.exports = {
    PostAudio,
    GetAudios,
    DeleteAudio,
    DeleteAllAudios
}
