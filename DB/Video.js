const mongoose = require('mongoose')

const VideoSchema = new mongoose.Schema({
    AWS_ID: {
        type: String,
        requried: true,
    },
    createdBy: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    httpUrl: {
        type: String,
        default: ''
    }
}, {timestamps: true})

const Video = mongoose.model('videos', VideoSchema)

module.exports = Video