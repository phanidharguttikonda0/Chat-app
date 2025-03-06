import axios from "axios"
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login(){

    const [username, setUsername] = useState("") ;
    const [password, setPassword] = useState("") ;
    const navigate = useNavigate() ;

    const login = async () => {
        if(username.length < 2 && password.length < 8) alert("invalid username and password") ;
        else{
            try{    
                const result = await axios.post("http://localhost:11000/",{
                    username,password
                }) ;
                if(result.data.value){
                    localStorage.setItem("authorization", result.data.value) ;
                    navigate('/') ;
                }else{
                    alert(result.data.message) ;
                }
            }catch(err){
                console.log(`The error occured was ${err}`) ;
            }
        }

    }

    return <div className="w-[100%] h-[100vh] flex justify-center items-center bg-[#1A1A1D]">
        <div className="p-4 rounded-2xl flex flex-col items-center bg-[#2E073F]">
            <input type="text" placeholder="username" value={username} onChange={(event) => setUsername(event.target.value)}
            className="text-xl p-1 bg-transparent outline-0 border border-transparent border-b-2 border-b-white text-white mb-4"
            />
            <input type="password" placeholder="password" value={password} onChange={(event) => setPassword(event.target.value)}
            className="text-xl p-1 bg-transparent outline-0 border border-transparent border-b-2 border-b-white text-white mb-4"
            />
            <button className="p-2 text-white text-xl bg-[#6A1E55] rounded cursor-pointer" 
            onClick={login}> continue </button>
        </div>
    </div>
}