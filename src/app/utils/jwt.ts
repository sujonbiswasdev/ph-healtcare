import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
export const createToken = async (
  payload: JwtPayload,
  secrect: string,
  { expiresIn }: SignOptions,
) => {
  const token = jwt.sign(payload, secrect, { expiresIn });
  return token;
};

export const verifyToken = async (token: string, secrect: string) => {
  const decoded = jwt.verify(token, secrect) as JwtPayload;
  return {
    success: true,
    data: decoded,
  };
};

export const decode = async (token: string) => {
  const decode = jwt.decode(token);
  return decode;
};
