// sendEmail.js
require('dotenv').config()
// const generateEmailHTML = require('./public/main.js');
const nodemailer = require('nodemailer');


// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: process.env.EMAIL_PORT,
    service: 'gmail',
    auth: {
        user: "alstonsid9@gmail.com",
        pass: "dcziouyymdzrpsxc"
    }
});
const sendOTP = async (toEmail, otp) => {
    console.log(toEmail, otp)
    try {
        const mailOptions = {
            from: "alstonsid9@gmail.com",
            to: toEmail,
            subject: 'Email verification',
            text: `Your OTP for email verification is: ${otp}`,//name is used for send OTP here
        };
        await transporter.sendMail(mailOptions);
        console.log('OTP email sent successfully');

    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send email');
    }
};


module.exports = sendOTP;