const express = require("express");
const fs = require("fs")
const chokidar = require('chokidar')
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});


const CHUNK_SIZE = 10000000; // 10MB
async function sendWholeLog(socket) {
    lockBool = true
    const stream = fs.createReadStream('./file.txt', { highWaterMark: CHUNK_SIZE });
    for await (const data of stream) {
        socket ? socket.emit("wholeChunk", data.toString()) : io.emit("wholeChunk", data.toString())
    }
    lockBool = false
}


let watcherBool = false
io.on("connection", (socket) => {
    socket.on("getWholeLog", () => {
        sendWholeLog(socket)
    })
    socket.on("logUpdate", (data) => {
        watcherBool = true
        fs.appendFile("file.txt", "\n" + data, (err) => {
            if (err) throw err;
            setTimeout(() => watcherBool = false, 1000)
            io.emit("newChunk", data.toString())
        })

    })
});

chokidar.watch("file.txt").on('change', () => {
    if (watcherBool) {
        console.log("Recognized Write")
        return
    }
    console.log("File manually changed!")
    sendWholeLog()
})


httpServer.listen(3000);
app.get('/', (req, res) => {
    res.send('Hello World!')
})

