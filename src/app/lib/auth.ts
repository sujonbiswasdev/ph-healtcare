import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { bearer, emailOTP, jwt } from "better-auth/plugins";
import { sendEmail } from "../utils/email";


export const auth = betterAuth({
    baseURL: process.env.BETTER_AUTH_URL,
    secret: process.env.BETTER_AUTH_SECRET,
    database: prismaAdapter(prisma, {
        provider: "postgresql"
    }),

    user: {
        additionalFields: {
            role: {
                type: "string",
                required: true,
                defaultValue:"PATIENT"
            },

            status: {
                type: "string",
                required: true,
                defaultValue:"ACTIVE"
            },

            needPasswordChange: {
                type: "boolean",
                required: true,
                defaultValue: false
            },

            isDeleted: {
                type: "boolean",
                required: true,
                defaultValue: false
            },

            deletedAt: {
                type: "date",
                required: false,
                defaultValue: null
            },
        }
    },
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true
    },
    emailVerification: {
        sendOnSignUp: true,
        sendOnSignIn: true,
        autoSignInAfterVerification: true,
    },

     plugins: [
        bearer(),
        emailOTP({
            overrideDefaultEmailVerification:true,
            async sendVerificationOTP({email,otp,type}){
                if(type==='email-verification'){
                     const user = await prisma.user.findUnique({
                    where : {
                        email,
                    }
                  })
                    if(user && !user.emailVerified){
                    sendEmail({
                        to : email,
                        subject : "Verify your email",
                        templateName : "otp",
                        templateData :{
                            name : user.name,
                            otp,
                        }
                    })
                  }
                }else if(type === "forget-password"){
                    const user = await prisma.user.findUnique({
                        where : {
                            email,
                        }
                    })

                    if(user){
                        sendEmail({
                            to : email,
                            subject : "Password Reset OTP",
                            templateName : "otp",
                            templateData :{
                                name : user.name,
                                otp,
                            }
                        })
                    }
                }
            },
             expiresIn : 2 * 60, // 2 minutes in seconds
            otpLength : 6,
        })
    ],
});