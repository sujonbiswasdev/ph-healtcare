import { CookieOptions, Request, Response } from "express";

export const setCookie=(res:Response,key:string,value:string,options:CookieOptions)=>{
    return res.cookie(key,value,options)
}

export const getCookie=(req:Request,key:string)=>{
    return req.cookies[key]
}
export const ClearCookie=(res:Response,key:string,options:CookieOptions)=>{
    return res.clearCookie(key,options)
}