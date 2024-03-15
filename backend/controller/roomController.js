const Room = require('../model/room');
const bcrypt = require('bcrypt');

const createRoom = async (req, res) => {
    try {
        const { roomID, password, userID } = req.body;
        const existingRoom = await Room.findOne({ roomID });
        if (existingRoom) {
            return res.status(200).json({ message: 'Room already exists', action: false });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const room = new Room({
            roomID,
            password: hashedPassword,
            users: [userID]
        });
        await room.save();
        return res.status(200).json({ message: 'Room created successfully!', action: true, room });
    } catch (error) {
        res.status(500).json({ message: 'Internal Error', action: false, error });
    }
};

const joinRoom = async (req, res) => {
    try {
        const { roomID, password, userID } = req.body;
        const existingRoom = await Room.findOne({ roomID }).populate({
            path: 'users',
            select: 'username _id online'
        });
        if (!existingRoom) {
            return res.status(200).json({ message: 'Room not available', action: false });
        }
        // if (existingRoom.gameStatus) {
        //     return res.status(200).json({ message: 'Game started join another room', action: false });
        // }
        const passwordMatch = await bcrypt.compare(password, existingRoom.password);
        if (!passwordMatch) {
            return res.status(200).json({ message: 'Incorrect Password', action: false });
        }
        if (!existingRoom.users.some(user => user._id == userID)) {
            console.log("USER", userID)
            console.log("object", existingRoom.users.includes(userID))
            existingRoom.users.push(userID);
            await existingRoom.save();
        }
        return res.status(200).json({ message: 'Room Join Successful', action: true, room: existingRoom });
    } catch (error) {
        res.status(500).json({ message: 'Internal Error', action: false, error });
    }
};

//Game Joining
const gameJoining = async (req, res) => {
    try {
        const { id } = req.body;

        const existingRoom = await Room.findById(id);
        if (!existingRoom) {
            return res.status(200).json({ message: 'Room not available', action: false });
        }
        await Room.updateOne({ _id: id }, { gameStatus: true });
        return res.status(200).json({ message: 'Game Join Successful', action: true });
    } catch (error) {
        console.log("ERR", error)
        res.status(500).json({ message: 'Internal Error', action: false, error });
    }
}

module.exports = { createRoom, joinRoom, gameJoining };
