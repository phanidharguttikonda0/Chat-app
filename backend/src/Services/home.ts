import mongoose from "mongoose";
import { ChatCollection, UserCollection, MessagesCollection, groupChatsCollection
    , groupMessagesCollection
 } from "../model/Model";

export async function isChatExists(userId:string, otherUserId:string){
    try{
        const result = await ChatCollection.findOne({
            $or: [{participant1: userId, participant2: otherUserId},{participant1: otherUserId, participant2: userId}]
        },{_id: 1}) ;
        if(result) return true ;
        return false ;
    }catch(err){
        console.log(`The error was in isChatExists ${err}`);
        return false ;
    }
 }


 export async function createChat(sender: string, reciever: string){
    try{
        const result = await  ChatCollection.insertOne({
            participant1: new mongoose.Types.ObjectId(sender),
            participant2: new mongoose.Types.ObjectId(reciever)
        }) ;
        return true ;
    }catch(err){
        console.log(`The error occured in the create chat function ${err}`) ;
        return false ;
    }
 }

 export async function publishChat(sender: string, reciever: string,message: string, isPrivate: boolean){
    try{
        if(isPrivate){
            const result = await MessagesCollection.insertOne({
                sender: new mongoose.Types.ObjectId(sender),
                reciever: new mongoose.Types.ObjectId(reciever),
                message: message,
            }) ;
            return result ;
        }else{
            const result = await groupMessagesCollection.insertOne({
                sender: new mongoose.Types.ObjectId(sender),
                reciever: new mongoose.Types.ObjectId(reciever), // groupChat id
                message: message
            }) ;
            return result ;
        }
    }catch(err){
        console.log(`The error occured in publishChat was ${err}`) ;
    }
 }


 export async function isAdmin(userId: string, groupId: string) {

    try{
        const isAdmin = await groupChatsCollection.findOne({_id: groupId},{admin: 1}) as {admin: string} ;
        if(isAdmin && isAdmin?.admin as string === userId) return true ;
        else return false ;
    }catch(err){
        console.log(`The error occured in isAdmin was ${err}`) ;
        return false ;
    }

 }

