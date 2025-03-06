import axios from "axios";
import { useEffect, useState } from "react"
interface SearchProps {
    chats: string[]; 
    setChats: React.Dispatch<React.SetStateAction<string[]>>;
}

interface user{
    username: String,
    _id: String
}


export function Search({chats, setChats}:SearchProps) {


    const [username, setUsername] = useState<String>("");
    const [usernames, setUsernames] = useState<user[]>([]);

    useEffect(()=>{
        async function send() {

            const call = async () => {
                const response = await axios.get(`http://localhost:11000/search/:${username}`);
                if (response.data) {
                    setUsernames(response.data.value);
                } else {
                    alert("Some thing went wrong");
                }
            }
            const debounceTimeout = setTimeout(call, 300); // Debounce API calls
            return () => clearTimeout(debounceTimeout);
        } 
        if(username.length > 1) send() ;
        else{
            setUsernames([]) ;
        }
    },[username]) ;

    return <div className="w-[100%] flex flex-col items-center">
        <div className="w-[100%]">
            <input type="text" placeholder="search username" value={username as string} onChange={(e) => setUsername(e.target.value)}
                className="bg-transparent outline-0 border border-transparent border-b-2 border-b-white w-[100%] text-xl text-white" />
            <button onClick={() => {

            }}></button>
        </div>
        <div className="w-[100%] flex flex-col items-center ">
            {
                usernames.map((username:user,index)=> <div key={index}
                onClick={() => {
                    setChats(prevChats => [username.username as string, ...prevChats]) ;
                }}
                className="w-[100%] p-2 cursor-pointer border border-b-2 border-transparent border-b-gray-300 text-white bg-[#17153B] text-xl">
                        {username.username}
                    </div>)
            }
        </div>
    </div>

}