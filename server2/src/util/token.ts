import { Response } from "express";
import { Secret, sign } from "jsonwebtoken";
import { User } from "../entity/User";

const createAccessToken = (user: User) => {
  const accessToken = sign({ userId: user.id }, process.env.ACCESS_TOKEN_KEY as Secret, {
    expiresIn: "60s",
  });

  return accessToken;
};

const createRefreshToken = (user: User) => {
  const accessToken = sign({ userId: user.id }, process.env.REFRESH_TOKEN_KEY as Secret, {
    expiresIn: "1h",
  });

  return accessToken;
};

const saveRefreshTokenToCookie = (res: Response, user: User) => {
  res.cookie(process.env.REFRESH_TOKEN_NAME as string, createRefreshToken(user), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/refresh_token",
  });
};

export { createAccessToken, saveRefreshTokenToCookie };
