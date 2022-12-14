const fs = require('fs')
const { io } = require("socket.io-client")
const readLine = require('readline')

const rl = readLine.createInterface({
    input: process.stdin,
    output: process.stdout
});

const socket = io("http://localhost:3000/")

socket.on("connect", (a) => {
    console.log("Connected to Server!\n")
    rl.question('What would you like to write to a file?\n', (text) => {
        socket.emit("logUpdate", text)
        rl.close()
    })
})