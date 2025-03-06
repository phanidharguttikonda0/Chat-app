import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"
import { ChatsList } from "./ChatsList";
import Chat from "./Chat";
import axios from "axios";

export type chatsListType = {
    username: string,
    _id: string,
}

export type groupChatsListType = {
    _id: string,
    name: string
}

export default function Home() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    const [chatsList, setChatsList] = useState<chatsListType[]>([]) ;
    const [groupChatsList, setGroupChatsList] = useState<groupChatsListType[]>([]) ;

    useEffect(() => {
        console.log("items ", localStorage.getItem("authorization") === 'null')
        if (localStorage.getItem("authorization") === 'null') {
            console.log("in to")
            navigate('/login')
        }
        else {
            setLoading(false)

            // firstly we need to get the chats
            async function getChats() {
                const result = await axios.get('http://localhost:11000/chats',{
                    headers:{
                        Authorization: localStorage.getItem("authorization")
                    }
                }) ;
                console.log(`The result was ${result.data.value} `,result.data.value) ;
                if(result.data.value){
                    setChatsList(result.data.value.privateChatList) ;
                    setChatsList(result.data.value.groupChats) ;
                }
            }
            getChats() ;

        };
    }, [navigate]);


    if (loading) return <div> loading.. </div>

    return <div className="w-[100%] h-[100vh] flex flex-row">
        <div className="w-[30%] h-[100%] bg-[#2E236C] p-2">
            <ChatsList groupChats={groupChatsList} privateChats={chatsList}/>
        </div>
        <div className="w-[70%] h-[100%] bg-[#17153B] p-2">
            <Chat />
        </div>
    </div>
}