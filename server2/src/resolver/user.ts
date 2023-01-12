import argon2 from "argon2";
import { User } from "../entity/User";
import { Resolver, Mutation, Arg, Ctx, UseMiddleware, Query } from "type-graphql";
import { RegisterInput } from "../type/RegisterInput";
import { UserMutationResponse } from "../type/UserMutationResponse";
import { LoginInput } from "../type/LoginInput";
import { Context } from "../type/Context";
import { createAccessToken, saveRefreshTokenToCookie } from "../util/token";
import checkAuth from "../middleware/checkAuth";
import { Like } from "typeorm";

@Resolver()
export class UserResolver {
  @Mutation(() => User)
  @UseMiddleware(checkAuth)
  async getUser(@Ctx() { user }: Context): Promise<User | undefined> {
    try {
      const existingUser = await User.findOne({ where: { id: user?.userId } });
      if (existingUser) {
        return existingUser;
      } else {
        return Promise.reject();
      }
    } catch (err) {
      return Promise.reject();
    }
  }

  @Query(() => [User])
  async getUserByUsername(@Arg("username") username: string): Promise<User[]> {
    try {
      if (username === "") {
        return [];
      }

      const findOption = `%${username}%`;
      const listUsers = await User.find({
        where: {
          username: Like(findOption),
        },
      });
      return listUsers;
    } catch (err) {
      return Promise.reject();
    }
  }

  @Mutation(() => UserMutationResponse)
  async register(
    @Ctx() { res }: Context,
    @Arg("registerInput") { username, email, password }: RegisterInput
  ): Promise<UserMutationResponse> {
    try {
      if (username.length < 6) {
        return {
          status: 400,
          message: "Username must be at least 6 characters long!!!",
        };
      }

      if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
        return {
          status: 400,
          message: "You have entered an invalid email address!!!",
        };
      }

      const existingUser = await User.findOne({ where: [{ username }, { email }] });
      if (existingUser) {
        return {
          status: 400,
          message: `${existingUser.username === username ? "username" : "email"} already exists!!!`,
        };
      }

      const hashedPassword = await argon2.hash(password);
      const newUser = User.create({
        username,
        email,
        password: hashedPassword,
      });
      const user = await newUser.save();

      saveRefreshTokenToCookie(res, user);

      return {
        status: 200,
        message: `registered successfully!!!`,
        user: user,
        accessToken: createAccessToken(user),
      };
    } catch (error) {
      console.log(error);
      return {
        status: 500,
        message: "internal server error!!!",
      };
    }
  }

  @Mutation(() => UserMutationResponse)
  async login(
    @Ctx() { res }: Context,
    @Arg("loginInput") { username, password }: LoginInput
  ): Promise<UserMutationResponse> {
    try {
      const existingUser = await User.findOne({ where: { username: username } });
      if (!existingUser) {
        return {
          status: 400,
          message: "username or password incorrect",
        };
      }

      const passwordValid = await argon2.verify(existingUser.password, password);
      if (!passwordValid) {
        return {
          status: 400,
          message: "username or password incorrect",
        };
      }

      saveRefreshTokenToCookie(res, existingUser);

      return {
        status: 200,
        message: "login successful",
        user: existingUser,
        accessToken: createAccessToken(existingUser),
      };
    } catch (error) {
      return {
        status: 500,
        message: "internal server error",
      };
    }
  }

  @Mutation(() => UserMutationResponse)
  async logout(
    // @Arg('userId', _type => ID) userId: number,
    @Ctx() { res }: Context
  ): Promise<UserMutationResponse> {
    res.clearCookie(process.env.REFRESH_TOKEN_NAME as string, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/refresh_token",
    });

    return { status: 200, message: "logout successfully" };
  }
}
