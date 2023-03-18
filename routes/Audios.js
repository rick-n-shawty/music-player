const express = require('express')
const router = express.Router()
const {PostAudio, GetAudios, DeleteAudio, DeleteAllAudios} = require('../controllers/Audio')
const multer = require('multer')
const storage = multer.memoryStorage()
const upload = multer({storage})


router.post('/audios', upload.single('audio'), PostAudio)

router.get('/audios', GetAudios)
router.delete('/audios/:id', DeleteAudio)
router.delete('/audios', DeleteAllAudios)

module.exports = router