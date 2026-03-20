import { JwtPayload } from "jsonwebtoken";
import { createToken } from "./jwt";
import { setCookie } from "./cookie";
import { Response } from "express";

export const getAccessToken=(payload:JwtPayload)=>{
    const accessToken=createToken(payload,process.env.ACCESS_TOKEN_SECRET as string,{expiresIn:60*60*60*24})
    return accessToken
}

export const getrefreshToken=(payload:JwtPayload)=>{
    const accessToken=createToken(payload,process.env.REFRESH_TOKEN_SECRET as string,{expiresIn:60})
    return accessToken
}

export const setAccessToken=(res:Response,token:string)=>{
    setCookie(res,"accessToken",token,{httpOnly:true,sameSite:'none',secure:true,path:"/",maxAge:60*60*60*24})   
}

export const setRefreshToken=(res:Response,token:string)=>{
    setCookie(res,"refreshToken",token,{httpOnly:true,sameSite:'none',secure:true,path:"/",maxAge:60*60*60*24*1000})   
}
export const setBetterAuthToken=(res:Response,token:string)=>{
    setCookie(res,"better-auth.session_token",token,{httpOnly:true,sameSite:'none',secure:true,path:"/",maxAge:60*60*60*24*1000})
}