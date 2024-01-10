import { Server } from 'socket.io';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { config } from 'dotenv';

config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: true
});

app.use(cors());

app.get("/", (req, res) => {
    res.send("Hello World");
});

const emailToSocketIdMap = new Map();
const socketIdtoEmailMap = new Map();

io.on("connection", (socket) => {
    console.log("socket connected ", socket.id)
    socket.on("room:join", data => {
        console.log(data)
        const {email, room} = data
        emailToSocketIdMap.set(email, socket.id)
        socketIdtoEmailMap.set(socket.id, email)

        io.to(room).emit("user:joined", {email, id: socket.id});
        socket.join(room)

        io.to(socket.id).emit("room:join", data)
    })

    socket.on("user:call", ({to, offer}) => {
        io.to(to).emit("incomming:call", {
            from: socket.id, offer
        })
    })

    socket.on("call:accepted", ({to, ans}) => {
        io.to(to).emit("call:accepted", {
            from: socket.id, ans
        })
    })

    socket.on("peer:nego:needed", ({offer, to}) => {
        io.to(to).emit("peer:nego:needed", {
            from: socket.id, offer
        })
    })

    socket.on("peer:nego:done", ({to, ans}) => {
        io.to(to).emit("peer:nego:final", {
            from: socket.id, ans
        })
    })
})

server.listen(process.env.PORT, () => console.log(`Server has started.`));