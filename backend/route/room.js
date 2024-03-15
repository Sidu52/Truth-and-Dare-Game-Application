const express = require('express');
const router = express.Router();

const { createRoom, joinRoom, gameJoining } = require('../controller/roomController');

router.post('/createRoom', createRoom);
router.post('/joinRoom', joinRoom);
router.post('/gamejoin', gameJoining);

module.exports = router;