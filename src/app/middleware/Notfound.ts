import { Request, Response } from "express";

export const Notfound=(req:Request,res:Response)=>{
      res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} Not Found`,
    })
}