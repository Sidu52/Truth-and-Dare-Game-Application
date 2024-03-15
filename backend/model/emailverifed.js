const mongoose = require('mongoose');

const emailVerifiedSchema = new mongoose.Schema({
    email: String,
    otp: Number,
    tokenExpiry: Number,
    verified: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const Email = mongoose.model('email', emailVerifiedSchema);
module.exports = Email;
