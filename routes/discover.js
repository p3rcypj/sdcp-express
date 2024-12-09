var express = require("express");
var dgram = require("dgram");
var router = express.Router();

const udpStartPort = 50000;
const networkRegex = /^([0-9]{1,3}\.){3}[0-9]{1,3}$/;

/* GET users listing. */
router.get("/", function (req, res, next) {
    const message = Buffer.from("M99999");
    const socket = dgram.createSocket("udp4");
    const broadcastAddress = "192.168.1.255";
    const port = 3000; //SDCP port
    const responses = [];

    socket.bind(udpStartPort, () => {
        socket.setBroadcast(true);

        console.log(`UDP Socket bound to port ${udpStartPort}, ready to send broadcast.`);

        socket.send(message, 0, message.length, port, broadcastAddress, err => {
            if (err) console.error("Error sending message:", err);
            else console.log(`Message "${message}" broadcasted to port ${port}`);
        });
    });

    socket.on("message", (msg, rinfo) => {
        const response = {
            message: msg,
            address: rinfo.address,
            port: rinfo.port,
        };

        console.log(`Received response:`, response);

        if (!responses.some(r => r.address === rinfo.address && r.message === msg.toString()))
            responses.push(msg);
    });

    socket.on("error", err => {
        console.error(`Socket error: ${err}`);
        socket.close();
    });

    socket.on("close", () => {
        console.log("Socket closed.");
    });

    setTimeout(() => {
        res.json({
            timestamp: new Date(),
            responses: responses.map(r => r.message),
        });

        socket.close();
    }, 2000);
});

module.exports = router;
