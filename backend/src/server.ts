import express from 'express';
import dotenv from 'dotenv';
import http from 'http';
import cors from 'cors';
import mongoose from 'mongoose';
import WebSocket from 'ws';
import jwt from 'jsonwebtoken';
import Message from './types/Message';
import router from './routes/home';
import { createChat, isChatExists, publishChat } from './Services/home';


const app = express(); // express is an web framework to handle HTTP Routes
dotenv.config();
mongoose.connect(process.env.DATABASE_URL as string);
const server = http.createServer(app);
/* 

 WebSockets require an HTTP server to establish an initial connection (via an HTTP handshake) 
 before upgrading to a WebSocket.

*/
app.use(express.json());
app.use(cors());

const wss = new WebSocket.Server({ server }); // creating an server instance
// this ensures that web sockets work on the same port as the existing http server

const clients = new Map<string, WebSocket>();

const jwtSecret = process.env.JWT_SECRET as string;
let decode: any;
wss.on("connection", (ws: WebSocket, req) => {
    console.log(`A new user was Connected in`);
    const token = req.headers['authorization'] as string;
    // first we need to get the authorization header
    let userId;
    if (!req.headers['authorization']) {
        console.log(`No authorization was provided`);
        ws.close();
        return;
    } else {
        try {
            decode = jwt.verify(token, jwtSecret);
            userId = decode.userId as string;
            clients.set(decode.userId as string, ws);
        } catch (err) {
            console.log(`The error occured in jwt verification in websocket ${err}`);
            ws.close();
            return;
        }
    }



    // now we need to write the logic when user sent a message


    ws.on("message", async (data: Message) => {

        // we need to store the data in the data base 
            const exists = await isChatExists(data.sender_id, data.reciever_id);
            if (!exists) {
                // create a new chat
                await createChat(data.sender_id, data.reciever_id) ;
            }
            // here we need to check whether the client is connected or not
            // if connected send the message 
            const result = await publishChat(data.sender_id, data.reciever_id, data.message, data.isPrivate) ;

            if(clients.has(data.reciever_id)){
                // now we need to broadcast this meesage to the User
                clients.get(data.reciever_id)?.send(JSON.stringify(result)) ;
            }
    });



    // here we need to write the logic when user disconnected
    ws.on("close", () => {
        console.log("client disconnected ");
        clients.delete(decode.userId);
    });




    // here we need to write the logic when an error occured
    ws.on("error", (err) => {
        console.log(`The error occured in the websocket where the error was ${err}`);
    });

});





app.use('/', router);



app.listen(11000, () => console.log("listening on the port 11000"));



