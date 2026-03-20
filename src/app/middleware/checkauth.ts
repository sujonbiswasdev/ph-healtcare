import { NextFunction, Request, Response } from "express";
import { Role, UserStatus } from "../../generated/prisma/enums";
import { getCookie } from "../utils/cookie";
import { prisma } from "../lib/prisma";
import { verifyToken } from "../utils/jwt";
import AppError from "../errorhelper/AppError";

export const auth=(...authroles:Role[])=>{
    return async (req:Request,res:Response,next:NextFunction)=>{
        const sessionToken=await getCookie(req,'better-auth.session_token')
        if(!sessionToken){
            throw new AppError(404,"token not found",'skdkjfsfsdjfsdjf')
        }

        if(sessionToken){
            const userexist=await prisma.session.findFirst({
                where:{
                    token:sessionToken,
                    expiresAt:{
                        gt:new Date()
                    }
                },
                include:{user:true}
            })
            if(userexist && userexist.user){
                const user=userexist.user
                const now = new Date();
                const expiresAt = new Date(userexist.expiresAt)
                const createdAt = new Date(userexist.createdAt)
                const sessionLifeTime = expiresAt.getTime() - createdAt.getTime();
                const timeRemaining = expiresAt.getTime() - now.getTime();
                const percentRemaining = (timeRemaining / sessionLifeTime) * 100;
                  if (percentRemaining < 20) {
                    res.setHeader('X-Session-Refresh', 'true');
                    res.setHeader('X-Session-Expires-At', expiresAt.toISOString());
                    res.setHeader('X-Time-Remaining', timeRemaining.toString());

                    console.log("Session Expiring Soon!!");
                }

                 if (user.status === UserStatus.BLOCKED || user.status === UserStatus.DELETED) {
                    throw new Error( 'Unauthorized access! User is not active.');
                }
                   if (authroles.length > 0 && !authroles.includes(user.role)) {
                    throw new Error( 'Forbidden access! You do not have permission to access this resource.');
                }
                req.user = {
                    userId : user.id,
                    role : user.role,
                    email : user.email,
                }

                 const accessToken = getCookie(req, 'accessToken');

            if (!accessToken) {
                throw new Error('Unauthorized access! No access token provided.');
            }
            }

                
            }

                //Access Token Verification
        const accessToken = getCookie(req, 'accessToken');

        if (!accessToken) {
            throw new Error( 'Unauthorized access! No access token provided.');
        }

        const verifiedToken = verifyToken(accessToken, process.env.ACCESS_TOKEN_SECRET as string);

        if (!verifiedToken) {
            throw new Error( 'Unauthorized access! Invalid access token.');
        }
        next()
        }
    }

