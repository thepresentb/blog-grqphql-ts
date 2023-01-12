import { JwtPayload, Secret, verify } from "jsonwebtoken";
import express from "express";
import { User } from "../entity/User";
import { createAccessToken, saveRefreshTokenToCookie } from "../util/token";

const route = express.Router();

route.get("/", async (req, res) => {
  try {
    const refreshToken = req.cookies[process.env.REFRESH_TOKEN_NAME as string];

    if (!refreshToken) {
      res.status(401);
    }

    const decodedUser = verify(refreshToken, process.env.REFRESH_TOKEN_KEY as Secret) as JwtPayload;

    const existingUser = await User.findOne({ where: { id: decodedUser.userId } });

    if (!existingUser) {
      res.status(401);
    }

    saveRefreshTokenToCookie(res, existingUser!);

    return res.json({
      statusbar: "success",
      accessToken: createAccessToken(existingUser!),
    });
  } catch (err) {
    // console.log(err);
    return res.sendStatus(403);
  }
});

export default route;
