import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { authServices } from "./auth.service";
import { sendResponse } from "../../shared/sendResponse";
import { ClearCookie, setCookie } from "../../utils/cookie";
import { setAccessToken, setBetterAuthToken, setRefreshToken } from "../../utils/token";

const Createuser=catchAsync(async(req:Request,res:Response)=>{
    const body=req.body
    console.log(body,'bodydaat')
    const result = await authServices.createUser(body)
    const {accessToken,refreshToken,token}= result
    setAccessToken(res,accessToken as any)
    setRefreshToken(res,refreshToken as any)
    setBetterAuthToken(res,token as string)
    sendResponse(res,{success:true,message:"user created successfully",status:400,data:result})
})
const LoginUser=catchAsync(async(req:Request,res:Response)=>{
    const body=req.body
    console.log(body,'bodydaat')
    const result = await authServices.createUser(body)
    const {accessToken,refreshToken,token}= result
    setAccessToken(res,accessToken as any)
    setRefreshToken(res,refreshToken as any)
    setBetterAuthToken(res,token as string)
    sendResponse(res,{success:true,message:"user created successfully",status:400,data:result})
})

const getNewToken=catchAsync(async(req:Request,res:Response)=>{
    const refreshtoken=req.cookies.refreshToken
    const sessionToken=req.cookies["better-auth.session_token"]
    const result = await authServices.getNewToken(refreshtoken,sessionToken as string)
    const {accessToken,refreshToken,token}= result
    setAccessToken(res,accessToken as any)
    setRefreshToken(res,refreshToken as any)
    setBetterAuthToken(res,token as string)
    sendResponse(res,{success:true,message:"user created successfully",status:400,data:result})
})

const changePassword=catchAsync(async(req:Request,res:Response)=>{
    const payload = req.body;
    const sessionToken=req.cookies["better-auth.session_token"]
    const result = await authServices.changePassword(payload,sessionToken as string)
    const {accessToken,refreshToken,token}= result
    setAccessToken(res,accessToken as any)
    setRefreshToken(res,refreshToken as any)
    setBetterAuthToken(res,token as string)
    sendResponse(res,{success:true,message:"user created successfully",status:400,data:result})
})


const logoutUser = catchAsync(
    async (req: Request, res: Response) => {
        const betterAuthSessionToken = req.cookies["better-auth.session_token"];
        const result = await authServices.logoutUser(betterAuthSessionToken);
        ClearCookie(res, 'accessToken', {
            httpOnly: true,
            secure: true,
            sameSite: "none",
        });
        ClearCookie(res, 'refreshToken', {
            httpOnly: true,
            secure: true,
            sameSite: "none",
        });
        ClearCookie(res, 'better-auth.session_token', {
            httpOnly: true,
            secure: true,
            sameSite: "none",
        });

        sendResponse(res, {
            status: 200,
            success: true,
            message: "User logged out successfully",
            data: result,
        });
    }
)

const verifyEmail = catchAsync(
    async (req: Request, res: Response) => {
        const { email, otp } = req.body;
       const result= await authServices.verifyEmail(email, otp);

        sendResponse(res, {
            status:200,
            success: true,
            message: "Email verified successfully",
            data:result
        });
    }
)

const forgetPassword = catchAsync(
    async (req: Request, res: Response) => {
        const { email } = req.body;
       const result= await authServices.forgetPassword(email);

        sendResponse(res, {
            status:200,
            success: true,
            message: "Password reset OTP sent to email successfully",
            data:result
        });
    }
)

const resetPassword = catchAsync(
    async (req: Request, res: Response) => {
        const { email, otp, newPassword } = req.body;
       const result= await authServices.resetPassword(email, otp, newPassword);

        sendResponse(res, {
            status:200,
            success: true,
            message: "Password reset successfully",
            data:result
        });
    }
)


export const authController={Createuser,LoginUser,getNewToken,changePassword,logoutUser,verifyEmail,forgetPassword,resetPassword}