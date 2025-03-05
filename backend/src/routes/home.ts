import e, { Router, Request,Response, NextFunction } from "express";
import { authorizationVerification, loginValidation } from "../Middleswares/inputValidation";
import { ChatCollection, groupChatsCollection, groupMessagesCollection, MessagesCollection, UserCollection } from "../model/Model";
import jwt from 'jsonwebtoken'; 
import dotenv from 'dotenv' ;
import mongoose from "mongoose";
const router = Router() ;
dotenv.config() ;
const JWT_SECRET = process.env.JWT_SECRET ;

interface CustomRequest extends Request{
    user?: {
        userId: string,
    } ;
}

router.post('/', async (req:Request, res:Response, next:NextFunction) =>{
    if(loginValidation(req.body.username, req.body.password)) next() ;
    else res.json({message: "invalid username or password", value: null}) ;
}, async (req:Request,res:Response) => {
    try{
        const username = req.body.username ;
        const password = req.body.password ;
        const user = await  UserCollection.findOne({username: username}, {password: 1, _id: 1}) ;
        let done = false ;
        let _id ;
        if(user ) {
            if(user.password === password)
            {
                done = true ;
                _id = user._id ;
            }
            else res.json({message: "invalid password", value: null}) ;
        }else{
            // we are going to create a user
            const result = await UserCollection.create({username: username, password: password, chats: []}) ;
            _id = result._id ;
            done = true ;
        }
        if(done){
            const authorizationHeader = jwt.sign({userId: _id}, JWT_SECRET as string) ;
            res.json({"message": "Success", value: authorizationHeader}) ;
        }
        
    }catch(err){
        console.log(`The error in / route was ${err}`) ;
        res.json({message: "error occured", value: false})
    }
}) ;


async function AuthorizationCheck(req:CustomRequest,res:Response,next:NextFunction) {
    try{
        const result = authorizationVerification(req.headers['authorization'] || "") ;
        if(result) {
            req.user = {
                userId: result as string
            } ;
            next() ;
        }
        else res.json({"message": "invalid authorization header", value: null}) ;
    }catch(err){
        console.log(`Error Occured in Authorization Check ${err}`) ;
        res.json({"message": "error occured", value: null}) ;
    }
}




router.get('/chats',AuthorizationCheck, async (req:CustomRequest, res:Response)=>{
    try{
        const userId = req.user?.userId as string ;

        // here we are gonna return all the chats with userId , username for private chats
        const privateChats = await ChatCollection.find({
            $or: [{ participant1: userId }, { participant2: userId }]
        }).select("participant1 participant2");

        const participants = new Set<String>() ;

        privateChats.forEach(chat => {
            if(chat.participant1 === userId) participants.add(chat.participant2 as string) ;
            else participants.add(chat.participant1 as string) ;
        }) ;

        // now we are gonna get the username and the _id of the user

        const privateChatList = await UserCollection.find({_id: {$in: Array.from(participants)}}, {username:1,_id: 1}) ;
        

        // for group chats we are gonna return group name , groupid
        const groupChats = await groupChatsCollection.find({participants: userId},{_id: 1, name: 1}).exec() ;

        res.json({message: "returning the list of private chat list and group chats lists", value: {privateChatList,
            groupChats
        }}) ;
        
        
    }catch(err){
        console.log(`The error occured in chats ${err}`) ;
        res.json({"message": "error occured", value: null})
    }
}) ;



router.get('/chat-unseen-Messages/:userId', AuthorizationCheck, async (req: CustomRequest, res: Response)=>{
    try{
        const userId = req.user?.userId as string ;
        const otherUserId = req.params.userId as string ; // it may be group id if isPrivateChat is false
        const isPrivateChat = req.query.isPrivateChat ? JSON.parse(req.query.isPrivateChat as string) : false; // Proper boolean conversion

        if(isPrivateChat){

            const unseenMessages = await MessagesCollection.find({
                sender: otherUserId, reciever: userId,
                seen: false
            },{_id: 1}) ;

            res.json({message: "we got it", value: unseenMessages.length}) ;

        }else{

            const unseenMessages = await groupMessagesCollection.find({reciever: otherUserId, 
                seenBy: { $nin: [userId] } 
            }, {time: 1}) ;
            res.json({"message": "got it ", value: unseenMessages.length}) ;
        }


    }catch(err){
        console.log(`The error Occured in the chat-unseen-meesages ${err}`) ;
        res.json({"message": "error occured", value: null}) ;
    }
}) ;




export default router ;