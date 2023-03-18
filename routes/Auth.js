const express = require('express')
const router = express.Router()
const {Login, Register, NewToken} = require('../controllers/Auth')

router.post('/login', Login)
router.post('/register', Register)
router.post('/newtoken', NewToken)
module.exports = router