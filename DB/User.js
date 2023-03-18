const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true],
        unique: true
    },
    password:{
        type: String,
        required:  [true]
    },
    videos: {
        type: Array
    },
    audios: {
        type: Array
    }
})
UserSchema.pre('save', async function(){
    const salt = await bcrypt.genSalt()
    this.password = await bcrypt.hash(this.password, salt)
})
UserSchema.methods.Check = async function(password){
    const isMatch = await bcrypt.compare(password, this.password)
    return isMatch
}
const User = mongoose.model('users', UserSchema)
module.exports = User