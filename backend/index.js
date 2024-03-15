require('dotenv').config()
const express = require('express');
const cors = require('cors');
const db = require('./config/mongoose');
const bodyParser = require('body-parser');
const http = require("http");
const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 4000;
const User = require("./model/user");

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


// Set routes
app.use('/', require('./route/user'));
app.use('/room', require('./route/room'));


server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});




const io = require("socket.io")(server, {
    pingTimeout: 60000,
    cors: {
        origin: [
            'http://localhost:3000',
            'http://192.168.29.91:3000',
            'https://siddhantsharmasocialmedia.netlify.app',
            'http://192.168.139.176:5173'
        ],
    },
});
//Socket.io
let users = [];
io.on('connection', socket => {
    console.log("User connected", socket.id)
    socket.on('addUser', async id => {
        const isUserExist = users.find(user => user.id === id);
        if (!isUserExist) {
            const user = { id, socketId: socket.id };
            users.push(user);
            // Emitting the updated user list to all clients
            io.emit('getUsers', users);

            // Fetch online users from the User model based on their IDs
            try {
                const onlineUsers = await User.find({ _id: { $in: users.map(u => u.id) } });
                // Emit the list of online users to the client who just connected
                io.emit('getOnlineUsers', onlineUsers);
            } catch (error) {
                console.error('Error fetching online users:', error);
            }
        }
    });

    socket.on('sendMessage', async ({ senderId, receiverId, message, conversationId }) => {
        const receiver = users.find(user => user.id == receiverId);
        const sender = users.find(user => user.id == senderId);
        if (receiver) {
            const user = await User.findById(senderId);
            const data = await Messages.find({ message });
            const messageUserData = { user: { id: user._id, email: user.email, usename: user.username, avatar: user.avatar }, message: data }
            io.to(receiver.socketId).to(sender.socketId).emit('getMessage', {
                senderId,
                receiverId,
                conversationId,
                messageUserData
            });
        }
    })
    socket.on('inputfocus', async ({ receiverId, value }) => {
        console.log(receiverId)
        const receiver = users.find(user => user.id == receiverId);
        io.to(receiver?.socketId).emit('inputfocusserver', value);
    })


    socket.on('notificationsend', async ({ senderuserID, reciveruserID, notificationDes, postID, notificationType, viewBy }) => {
        try {
            const data = await Notification.create({
                senderuserID,
                reciveruserID,
                notificationDes,
                postID,
                notificationType,
                viewBy
            });
            const fromUser = await User.findById(data.senderuserID);
            const post = await Post.findById(postID);
            await reciveruserID.map(async receiver => {
                const receiverUser = users.find(user => user.id == receiver);
                if (receiverUser && receiverUser.socketId) {

                    io.to(receiverUser.socketId).emit('getNotification', { notification: data, fromUser, post });
                } else {
                    console.log(`User ${receiver} not found or no socket ID`);
                    // Handle the case where the user is not found or has no socket ID
                }
            });
            console.log("Notifications sent");
        } catch (err) {
            console.error("Error:", err);
            // Handle any potential errors while creating notifications or emitting to sockets
        }
    });


    socket.on('calluser', (userToCall, signalData, from, name) => {
        io.to(userToCall).emit(["calluser", { signal: signalData, from, name }]);

    });
    socket.on("answercall", (data) => {
        io.to(data.to).emit("callaccepted", data.signal);
    })

    socket.on('callUser', (roomID, from, to) => {
        io.to(rooms[roomID][to]).emit('incomingCall', { from, to });
    });

    socket.on('acceptCall', (roomID, from, to) => {
        io.to(rooms[roomID][from]).emit('callAccepted', { from, to });
    });



    socket.on('disconnect', async () => {
        users = users.filter(user => user.socketId !== socket.id)

        // Fetch online users from the User model based on their IDs
        try {
            const onlineUsers = await User.find({ _id: { $in: users.map(u => u.id) } });
            // Emit the list of online users to the client who just connected
            io.emit('getOnlineUsers', onlineUsers);
        } catch (error) {
            console.error('Error fetching online users:', error);
        }
    })
})