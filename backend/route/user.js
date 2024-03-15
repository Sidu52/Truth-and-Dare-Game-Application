const express = require('express');
const router = express.Router();

const { Singup, Signin, otpSent, otpverification, } = require('../controller/userConteroller');

router.post('/signup', Singup);
router.post('/signin', Signin);
router.post('/sendOtp', otpSent);
router.post('/otpVerification', otpverification);


module.exports = router;