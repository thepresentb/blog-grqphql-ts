import { Context } from "../type/Context";
import { MiddlewareFn } from "type-graphql";
import { JwtPayload, Secret, verify } from "jsonwebtoken";

const checkAuth: MiddlewareFn<Context> = ({ context }, next) => {
  try {
    const authHeader = context.req.header("authorization");
    const accessToken = authHeader && authHeader.split(" ")[1];

    if (!accessToken) {
      throw new Error("not authenticated");
    }

    const decodedUser = verify(accessToken, process.env.ACCESS_TOKEN_KEY as Secret) as JwtPayload;

    context.user = decodedUser;

    return next();
  } catch (err) {
    throw new Error(err);
  }
};

export default checkAuth;
