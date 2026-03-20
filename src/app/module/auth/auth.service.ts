import { JwtPayload } from "jsonwebtoken";
import AppError from "../../errorhelper/AppError";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { verifyToken } from "../../utils/jwt";
import { getAccessToken, getrefreshToken } from "../../utils/token";
import { UserStatus } from "../../../generated/prisma/enums";
interface IRegisterPatientPayload {
  name: string;
  email: string;
  password: string;
}
const createUser = async (payload: IRegisterPatientPayload) => {
  const { name, email, password } = payload;
  const data = await auth.api.signUpEmail({
    body: {
      name,
      email,
      password,
    },
  });
  const accessToken = getAccessToken({
    name: data.user.name,
    email: data.user.email,
    emailVerified: data.user.emailVerified,
    role: data.user.role,
    status: data.user.status,
    isDeleted: data.user.isDeleted,
  });
  const refreshToken = getrefreshToken({
    name: data.user.name,
    email: data.user.email,
    emailVerified: data.user.emailVerified,
    role: data.user.role,
    status: data.user.status,
    isDeleted: data.user.isDeleted,
  });
  return {
    ...data.user,
    token: data.token,
    accessToken,
    refreshToken,
  };
};
interface ILoginUserPayload {
  email: string;
  password: string;
}

const LoginUser = async (payload: ILoginUserPayload) => {
  const { email, password } = payload;
  const data = await auth.api.signInEmail({
    body: {
      email,
      password,
    },
  });
  const accessToken = getAccessToken({
    name: data.user.name,
    email: data.user.email,
    emailVerified: data.user.emailVerified,
    role: data.user.role,
    status: data.user.status,
    isDeleted: data.user.isDeleted,
  });
  const refreshToken = getrefreshToken({
    name: data.user.name,
    email: data.user.email,
    emailVerified: data.user.emailVerified,
    role: data.user.role,
    status: data.user.status,
    isDeleted: data.user.isDeleted,
  });
  return {
    ...data.user,
    token: data.token,
    accessToken,
    refreshToken,
  };
};

const getNewToken = async (refreshtoken: string, sessiontoken: string) => {
  const isExistsessiontoken = await prisma.session.findUnique({
    where: {
      token: sessiontoken,
    },
    include: {
      user: true,
    },
  });
  if (!isExistsessiontoken) {
    throw new AppError(404, "token is invalid");
  }
  const verifiedRefreshToken = verifyToken(
    refreshtoken,
    process.env.REFRESH_TOKEN_SECRET!,
  );
  if (!verifiedRefreshToken && verifiedRefreshToken) {
    throw new AppError(400, "Invalid refresh token");
  }
  const data = (await verifiedRefreshToken).data as JwtPayload;
  const accessToken = getAccessToken({
    name: data.user.name,
    email: data.user.email,
    emailVerified: data.user.emailVerified,
    role: data.user.role,
    status: data.user.status,
    isDeleted: data.user.isDeleted,
  });
  const refreshToken = getrefreshToken({
    name: data.user.name,
    email: data.user.email,
    emailVerified: data.user.emailVerified,
    role: data.user.role,
    status: data.user.status,
    isDeleted: data.user.isDeleted,
  });
  return {
    ...data.user,
    token: data.token,
    accessToken,
    refreshToken,
  };
};

export interface IChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

const changePassword = async (
  payload: IChangePasswordPayload,
  sessionToken: string,
) => {
  const session = await auth.api.getSession({
    headers: new Headers({
      Authorization: `Bearer ${sessionToken}`,
    }),
  });

  if (!session) {
    throw new AppError(400, "Invalid session token");
  }

  const { currentPassword, newPassword } = payload;

  const result = await auth.api.changePassword({
    body: {
      currentPassword,
      newPassword,
      revokeOtherSessions: true,
    },
    headers: new Headers({
      Authorization: `Bearer ${sessionToken}`,
    }),
  });

  if (session.user.needPasswordChange) {
    await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        needPasswordChange: false,
      },
    });
  }

  const accessToken = getAccessToken({
    userId: session.user.id,
    role: session.user.role,
    name: session.user.name,
    email: session.user.email,
    status: session.user.status,
    isDeleted: session.user.isDeleted,
    emailVerified: session.user.emailVerified,
  });

  const refreshToken = getrefreshToken({
    userId: session.user.id,
    role: session.user.role,
    name: session.user.name,
    email: session.user.email,
    status: session.user.status,
    isDeleted: session.user.isDeleted,
    emailVerified: session.user.emailVerified,
  });

  return {
    ...result,
    accessToken,
    refreshToken,
  };
};

const logoutUser = async (sessionToken: string) => {
  const result = await auth.api.signOut({
    headers: new Headers({
      Authorization: `Bearer ${sessionToken}`,
    }),
  });

  return result;
};


const verifyEmail = async (email : string, otp : string) => {

    const result = await auth.api.verifyEmailOTP({
        body:{
            email,
            otp,
        }
    })

    if(result.status && !result.user.emailVerified){
        await prisma.user.update({
            where : {
                email,
            },
            data : {
                emailVerified: true,
            }
        })
    }
}

const forgetPassword = async (email : string) => {
    const isUserExist = await prisma.user.findUnique({
        where : {
            email,
        }
    })

    if(!isUserExist){
        throw new AppError(404, "User not found");
    }

    if(!isUserExist.emailVerified){
        throw new AppError(400, "Email not verified");
    }

    if(isUserExist.isDeleted || isUserExist.status === UserStatus.DELETED){
        throw new AppError(404, "User not found"); 
    }

    await auth.api.requestPasswordResetEmailOTP({
        body:{
            email,
        }
    })
}

const resetPassword = async (email : string, otp : string, newPassword : string) => {
    const isUserExist = await prisma.user.findUnique({
        where: {
            email,
        }
    })

    if (!isUserExist) {
        throw new AppError(404, "User not found");
    }

    if (!isUserExist.emailVerified) {
        throw new AppError(400, "Email not verified");
    }

    if (isUserExist.isDeleted || isUserExist.status === UserStatus.DELETED) {
        throw new AppError(400, "User not found");
    }

    await auth.api.resetPasswordEmailOTP({
        body:{
            email,
            otp,
            password : newPassword,
        }
    })

    if (isUserExist.needPasswordChange) {
        await prisma.user.update({
            where: {
                id: isUserExist.id,
            },
            data: {
                needPasswordChange: false,
            }
        })
    }

    await prisma.session.deleteMany({
        where:{
            userId : isUserExist.id,
        }
    })
}

export const authServices = {
  createUser,
  LoginUser,
  getNewToken,
  changePassword,
  logoutUser,
  verifyEmail,
  forgetPassword,
  resetPassword
};
