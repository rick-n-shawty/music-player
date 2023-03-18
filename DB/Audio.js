const mongoose = require('mongoose')

const AudioSchema = new mongoose.Schema({
    httpUrl: {
        type: String,
        default: ''
    },
    createdBy: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    AWS_ID: {
        type: String,
        required: true 
    },
    songName: {
        type: String,
        default: ''
    }
}, {timestamps: true})
const Audio = mongoose.model("audios", AudioSchema)
module.exports = Audio