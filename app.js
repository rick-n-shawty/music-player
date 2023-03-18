require('dotenv').config()

const express = require('express')
const app = express() 
const connect = require('./DB/connect')
const port = process.env.PORT || 8080
const cors = require('cors')
const helmet = require('helmet')
const xss = require('xss-clean')
const rateLimiter = require('express-rate-limit')

app.use(express.json())
app.use(cors({
    origin: '*'
}))
app.use(helmet())
app.use(xss())

const AuthRouter = require('./routes/Auth')
const VideosRouter = require('./routes/Videos')
const AudioRouter = require('./routes/Audios')
const Authenticate = require('./middleware/verify')
const ErrorCatcher = require('./Errors/ErrorCatcher')
const notFound = require('./Errors/NotFound')
app.use('/api/v1', AuthRouter)
app.use('/api/v1', Authenticate,VideosRouter)
app.use('/api/v1', Authenticate, AudioRouter)
app.use(ErrorCatcher)
app.use(notFound)

const start = async() =>{
    try{
        await connect(process.env.MONGO_URI)
        app.listen(port, () => console.log(`server is up on port ${port}`))
    }catch(err){
        console.log(err)
    }
}
start()

