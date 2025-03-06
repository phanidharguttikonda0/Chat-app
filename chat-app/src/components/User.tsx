

export function User({username, _id}:{username: string, _id: string}){

    return <div className="w-[100%] p-2 text-center text-white border border-transparent border-b-1 border-b-gray-200">
        {username}
    </div>
}