Firstly user logins for that , we need a route /
After User logins, we will have 2 components , one is Chats list and other is Chat window
    Chat list (fetch all the chats containing [user_id, chat_id and username ]from the route /chats:userId along with authorizaton key) and also has Search , which search for the user /search:username-prefix

    Chat window , where we will show case the the chat of a particular user selected, by default empty, when a user was clicked from the chats ,we will get /get-chat:chatId , we will retrive all the messages


    / -> login and sign-up
    /chats:userId -> returns all the chats for that user
    /get-chat:userId -> return the chat of the userId that he chated with
    
NOTE:
    -> here the authorization key contains the userId not the username