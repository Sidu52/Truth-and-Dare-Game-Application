const mongoose = require('mongoose');
const User = require('./user');

const roomSchema = new mongoose.Schema({
    roomID: {
        type: String,
        unique: true
    },
    password: {
        type: String,
    },
    gameStatus: {
        type: Boolean,
        default: false
    },
    users: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
}, {
    timestamps: true
});

// Define the Room model
const Room = mongoose.model('Room', roomSchema);

module.exports = Room;
