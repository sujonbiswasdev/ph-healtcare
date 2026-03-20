import { Response } from "express";

export interface IResponseData<T>{
    status:number,
    message:string,
    success:boolean,
    data?:T
}
export const sendResponse=<T>(res:Response,resData:IResponseData<T>)=>{
    const {status,message,success,data}=resData
    res.status(status).json({success,message,data})
}