import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173"],
        methods: ["GET", "POST"]
    }
});

let userMap = {};
let groups = {};

io.on('connection', (socket) => {
    const { userId, groupName } = socket.handshake.query;

    if (!userId || !groupName) return;

    if (!groups[groupName]) {
        groups[groupName] = [];
    }


    if (groups[groupName].length < 2) {
        groups[groupName].push(userId);
        userMap[userId] = { socketId: socket.id, groupName };
        socket.join(groupName);
        socket.broadcast.to(groupName).emit('group_joined', { userId, groupName });
        console.log(`User ${userId} joined group ${groupName}`, groups);
        console.log(groups[groupName].length)
        if (groups[groupName].length === 2) {
            console.log("in the length")
            let user1 = groups[groupName][0]
            let user2 = groups[groupName][1]

            io.to(groupName).emit("sign", { user1: { name: user1, sign: "X" }, user2: { name: user2, sign: "O" } })
        }

    } else {
        socket.emit('group_full', { groupName });
    }

    socket.on('press', ({ nextTurn, id, sign }) => {
        io.to(groupName).emit("turn", { nextTurn: nextTurn === "O" ? "X" : "O", id: id, sign: sign })

    });
    socket.on('winner', (winner) => {
        io.to(groupName).emit("win", winner)

    });


    socket.on('disconnect', () => {
        if (userMap[userId]) {
            const group = groups[userMap[userId].groupName];
            if (group) {
                const index = group.indexOf(userId);
                if (index !== -1) {
                    group.splice(index, 1);
                }
                if (group.length === 0) {
                    delete groups[userMap[userId].groupName];
                }
            }
            delete userMap[userId];
        }
        console.log(`User ${userId} disconnected`, groups);
    });
});

server.listen(5555, () => {
    console.log('server running at http://localhost:5555');
});
