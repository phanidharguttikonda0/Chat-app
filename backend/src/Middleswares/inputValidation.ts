import {z} from 'zod' ;
import jwt from 'jsonwebtoken' ;
import dotnev from 'dotenv' ;

dotnev.config() ;
const JWT_SECRET = process.env.JWT_SECRET ;
export function loginValidation(username: string, password: string){
    const usernameSchema = z.string().regex(/^[a-z_A-Z]+[a-z_A-Z0-9]{2,49}$/) ; // max of 18 character
    const passwordSchema = z.string().min(8).max(24) ;
    return usernameSchema.safeParse(username).success && passwordSchema.safeParse(password) ;
}


export function authorizationVerification(authorizationHeader: string){
    try{
        const decode:any = jwt.verify(authorizationHeader, JWT_SECRET as string);
        return decode.userId; 
    }catch(err){
        console.log(`Invalid authorization header`);
        return null ;
    }
}