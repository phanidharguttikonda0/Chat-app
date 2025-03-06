

export default function Chat() {

    return <div className="w-[100%] h-[100vh] flex flex-col items-center ">
        <div className="w-[80%] h-[90vh]"></div>
        <div className="w-[80%] flex justify-around items-center">
            <input type="text" placeholder="send message" className="w-[95%] text-xl p-2 border-transparent border border-b-2 border-b-white text-white outline-0" />
            <button onClick={() => { }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="size-8 cursor-pointer">
                    <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                </svg>

            </button>
        </div>
    </div>
}