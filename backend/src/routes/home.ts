import e, { Router, Request,Response, NextFunction } from "express";
import { authorizationVerification, loginValidation } from "../Middleswares/inputValidation";
import { ChatCollection, groupChatsCollection, groupMessagesCollection, MessagesCollection, UserCollection } from "../model/Model";
import jwt from 'jsonwebtoken'; 
import dotenv from 'dotenv' ;
import mongoose from "mongoose";
import { isAdmin } from "../Services/home";
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



router.get('/messages/:otherUserId', AuthorizationCheck, async (req:CustomRequest, res: Response)=>{
    try{

        const otherUserId = req.params.otherUserId as string ;
        const userId = req.user?.userId as string ;
        const isPrivateChat = req.query.isPrivateChat ? JSON.parse(req.query.isPrivateChat as string) : false;
        if(isPrivateChat){
            const chats = await MessagesCollection.find({
                $or: [{sender: otherUserId,reciever: userId},{sender: userId, reciever: otherUserId}]
            }) ;
            res.json({message: "got it", value: chats}) ;
        }else{
            const groupChats = await groupMessagesCollection.find({
                reciever: otherUserId
            }, {sender:1 ,message: 1,time: 1}) ;

            res.json({message: "got it", value: groupChats}) ;
        }

    }catch(err){
        console.log(`The error Occured in the chat-unseen-meesages ${err}`) ;
        res.json({"message": "error occured", value: null}) ;
    }
}) ;

//* when ever a new message is sent, in front-end we actually maintain a count
// so we will increment that count , when ever user clicked a specific chat, then 
// we will retrive all the messages of the chat


router.post('/create-group', AuthorizationCheck, async (req: CustomRequest, res: Response)=>{
    try{
        const userId = req.user?.userId ;
        const members = req.body.usersIds as string[];
        const name = req.body.groupName as string;
        const result = await groupChatsCollection.insertOne({
            admin: userId,
            participants: members.map(member => new mongoose.Types.ObjectId(member)) ,
            name: name
        }) ;
        res.json({message: "The group was created successfully", value: result}) ;

    }catch(err){
        console.log(`The error occured in create-group ${err}`)
        res.json({message: "error occured", value: null}) ;
    }
}) ;


router.post('/add-member-to-group/:groupNo', AuthorizationCheck, async (req:CustomRequest, res:Response, next:NextFunction)=>{
    try{
        const userId = req.user?.userId as string;
        const otherUserIds = req.body.userId as string[];
        const groupId = req.params.groupNo as string;
        if(await isAdmin(userId,groupId)){
            // know we are going to change it
            const newParticipantIds = otherUserIds.map(
                id => new mongoose.Types.ObjectId(id)
              );
              
              // Use findByIdAndUpdate with $push and $each to add the array
              const updatedGroupChat = await groupChatsCollection.findByIdAndUpdate(
                groupId,
                { $push: { participants: { $each: newParticipantIds } } },
                { new: true } // Returns the updated document
              );
            res.json({"message": "success", value: true}) ;
        }else{
            res.json({"message": "only admin can do that", value: false}) ;
        }
    }catch(err){
        console.log(`The error occured in /add-member-to-group ${err}`)
        res.json({message: "error occured", value: false}) ;
    }
}) ;


router.get('/search/:username', async (req: Request, res: Response) => {
    try {
        // If you need to remove a leading character, do it explicitly.
        // For example, if the username parameter starts with a colon,
        // you can remove it with substring(1) otherwise, use it directly.
        const username = req.params.username.startsWith(':')
            ? req.params.username.substring(1)
            : req.params.username;
            
        // Create a regex for case-insensitive matching.
        // Adjust the regex pattern as needed (e.g., adding ^ to match beginning).
        const regex = new RegExp(`^${username}`, "i");

        // Use .limit(5) to get only the first 5 matching documents.
        const usernames = await UserCollection.find({ username: { $regex: regex } }).limit(5);

        res.json({ message: "got it", value: usernames });
    } catch (err) {
        console.log(`The error occurred in search: ${err}`);
        res.status(500).json({ message: "error occurred", value: false });
    }
});


export default router ;