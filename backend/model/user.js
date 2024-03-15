const mongoose = require('mongoose');

const user = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    mobileNumber: {
        type: Number,
    },
    online: {
        type: Boolean,
        default: false
    },
    avatar: {
        type: String
    }
}, {
    timestamps: true
});

const User = mongoose.model('User', user);
module.exports = User;