import { useEffect, useState } from "react"
import axios from "axios"
import { Search } from "./Search";
import Chaty from "./Chaty.tsx";
import { chatsListType, groupChatsListType } from "./Home.tsx";
import { User } from "./User.tsx";

type chatsList = {
    privateChats: chatsListType[],
    groupChats: groupChatsListType[]
}

export function ChatsList({ privateChats, groupChats }: chatsList) {
    const [chats, setChats] = useState<string[]>([]);
    const [isPrivate, setPrivate] = useState(true);


    return <div className="flex flex-col items-center w-[100%] h-[100vh]">
        <div className="w-[90%]">
            <Search chats={chats} setChats={setChats} />
        </div>
        <div className="w-[100%] m-4">
            <div className="flex items-center space-x-2">
                {/* Display current state */}
                <span className="font-medium text-gray-700">{isPrivate ? "On" : "Off"}</span>

                {/* Toggle button */}
                <button
                    type="button"
                    onClick={() => setPrivate(!isPrivate)}
                    className={`relative inline-flex h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none ${isPrivate ? "bg-blue-600" : "bg-gray-300"
                        }`}
                >
                    <span className="sr-only">Toggle Switch</span>
                    <span
                        className={`inline-block h-5 w-5 rounded-full bg-white shadow transform transition ease-in-out duration-200 ${isPrivate ? "translate-x-5" : "translate-x-0"
                            }`}
                    />
                </button>
            </div>
        </div>
        <div className="pb-2">
            {
                isPrivate ?
                    privateChats.map(chat => <User username={chat.username} _id={chat._id}/>) : 
                    groupChats.map(chat => <User username={chat.name} _id={chat._id}/>)
            }
        </div>
    </div>
}