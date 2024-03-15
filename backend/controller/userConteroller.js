const bcrypt = require('bcrypt')
const User = require('../model/user');
const Email = require("../model/emailverifed");
const sendOTP = require("../sendEmail");

//Email Verify
// //OTP sent
async function otpSent(req, res) {
    const { email } = req.body;
    try {
        // Generate OTP
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(200).json({ message: 'User already exists.', action: false });
        }
        const otp = Math.floor(100000 + Math.random() * 900000);
        // Send OTP
        await sendOTP(email, otp);
        // Find existing email verification record

        const existingEmail = await Email.findOne({ email });

        if (!existingEmail) {
            // Create a new email verification record
            const newEmail = new Email({
                email,
                otp,
                tokenExpiry: Date.now() + 120000 // Set expiry time to 2 minutes from now
            });
            // Save the new email verification record
            await newEmail.save();
            console.log("Email saved successfully!");
            res.status(201).json({ action: true, message: 'OTP sent successfully' });
        } else {
            // Update the existing email verification record
            await Email.updateOne(
                { email },
                {
                    otp,
                    tokenExpiry: Date.now() + 120000 // Set expiry time to 2 minutes from now
                }
            );
            res.status(201).json({ action: true, message: 'OTP sent successfully' });
        }
    } catch (error) {
        console.log("Error sending OTP:", error);
        res.status(500).json({ action: false, error: 'Internal server error.' });
    }
}

//OTP verification
const otpverification = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const emailfind = await Email.findOne({ email });
        if (!emailfind) {
            return res.status(200).json({ message: "Regenerate OTP", action: true });
        }
        const currentTimestamp = Date.now();
        if (otp == emailfind.otp) {
            if (emailfind.tokenExpiry && emailfind.tokenExpiry > currentTimestamp) {
                await Email.updateOne({ email }, {
                    verified: true
                })
                return res.status(201).json({
                    message: "User Verified",
                    action: true
                });
            } else {
                return res.status(200).json({
                    message: "Token Expired",
                    action: false
                });
            }
        }
        return res.status(200).json({
            message: "Wrong OTP",
            action: false
        });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error.', error });
    }
}

//Create User
async function Singup(req, res) {
    try {
        const { userName, email, mobileNumber, password } = req.body;
        const existingEmail = await Email.findOne({ email });
        if (existingEmail && existingEmail.verified) {
            // Check if user with the same email or username already exists
            const existingUser = await User.findOne({ email });
            if (!existingUser) {
                // Hash the password
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(password, salt);
                // Create a new user
                const newUser = new User({
                    username: userName,
                    email,
                    mobileNumber,
                    password: hashedPassword,
                });
                await newUser.save();
                await Email.deleteOne({ email })
                return res.status(200).json({ message: 'Signup successful!', action: true, user: newUser });
            }
            return res.status(200).json({ message: 'User already exists.', action: false });
        }
        return res.status(200).json({ message: 'Email not verifed', action: false });

        // }
    } catch (error) {
        console.log("ERR", error)
        res.status(500).json({ message: 'Internal Error', action: false, error: error, });
    }
}

//Sigin User
const Signin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(200).json({ message: 'User not found.', action: false });
        }
        // Compare the provided password with the stored hashed password
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(200).json({ message: 'Invalid password.', action: false });
        }
        // Password matches, login successful
        res.status(200).json({ message: 'Login successful!', action: true, user });
    }
    catch (error) {
        console.log("ERR", error)
        res.status(500).json({ message: 'Internal Error', action: false, error: error, });
    }
}


module.exports = { Singup, Signin, otpSent, otpverification };