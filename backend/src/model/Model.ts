import mongoose, { mongo } from "mongoose";
import { boolean } from "zod";


const User = new mongoose.Schema({
    username: {type: String, require: true},
    password: {type: String, require: true},
    lastSeen: {type: Date, require: true},
    isOnline: {type: Boolean, require: true}
}) ;


const Chat = new mongoose.Schema({
    participant1: {type: String, require: true},
    participant2: {type: String, require: true}
}) ;


const Messages = new mongoose.Schema({
    sender: {type: mongoose.Schema.Types.ObjectId, require: true, ref: 'Users'} ,
    reciever: {type: mongoose.Schema.Types.ObjectId, require:true, ref: 'Users'},
    message: {type: String, require: true},
    seen: {type: Boolean, default: false },
    time: {type: Date, default: Date.now}
}) ;


const groupChats = new mongoose.Schema({
    admin: {type: mongoose.Schema.Types.ObjectId, ref: 'Users', require: true} ,
    name: {type: String, require: true},
    participants: [{type: mongoose.Schema.Types.ObjectId, ref: 'Users', require: true}]
}) ;

const groupMessages = new mongoose.Schema({
    sender: {type: mongoose.Schema.Types.ObjectId, ref: 'Users', require: true},
    reciever: {type: mongoose.Schema.Types.ObjectId, ref: 'groupChats', require: true},
    message: {type: String, require: true},
    seenBy: [{type: mongoose.Schema.Types.ObjectId, ref: 'Users', require: true}],
    time: {type: Date, default: Date.now}
})


export const UserCollection = mongoose.model('Users', User) ;

export const ChatCollection = mongoose.model('Chats', Chat) ;

export const MessagesCollection = mongoose.model('Messages', Messages) ;

export const groupChatsCollection = mongoose.model('groupChats', groupChats) ;

export const groupMessagesCollection = mongoose.model('groupMessages', groupMessages) ;