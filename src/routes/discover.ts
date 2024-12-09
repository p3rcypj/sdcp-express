import express, { Request, Response, NextFunction } from "express";
import dgram from "dgram";

const router = express.Router();

const udpStartPort = 50000;
const _networkRegex = /^([0-9]{1,3}\.){3}[0-9]{1,3}$/;

/* GET users listing. */
router.get("/", (_req: Request, res: Response, _next: NextFunction) => {
    const message = Buffer.from("M99999");
    const socket = dgram.createSocket("udp4");
    const broadcastAddress = "192.168.1.255";
    const port = 3000; // SDCP port
    const responses: { message: Buffer; address: string; port: number }[] = [];

    socket.bind(udpStartPort, () => {
        socket.setBroadcast(true);

        console.log(`UDP Socket bound to port ${udpStartPort}, ready to send broadcast.`);

        socket.send(message, 0, message.length, port, broadcastAddress, err => {
            if (err) console.error("Error sending message:", err);
            else console.log(`Message "${message}" broadcasted to port ${port}`);
        });
    });

    socket.on("message", (msg: Buffer, rinfo: dgram.RemoteInfo) => {
        const response = {
            message: msg,
            address: rinfo.address,
            port: rinfo.port,
        };

        console.log(`Received response:`, response);

        if (!responses.some(r => r.address === rinfo.address && r.message.equals(msg)))
            responses.push(response);
    });

    socket.on("error", (err: Error) => {
        console.error(`Socket error: ${err}`);
        socket.close();
    });

    socket.on("close", () => {
        console.log("Socket closed.");
    });

    setTimeout(() => {
        res.json({
            timestamp: new Date(),
            responses: responses.map(r => r.message.toString()),
        });

        socket.close();
    }, 2000);
});

export default router;
