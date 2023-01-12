import checkAuth from "../middleware/checkAuth";
import { Resolver, Query, UseMiddleware, Ctx } from "type-graphql";
import { Context } from "../type/Context";

@Resolver()
export class GreetingResolver {
  @Query(() => String)
  @UseMiddleware(checkAuth)
  hello(@Ctx() { user }: Context): string {
    console.log("check getting hello", user);
    return "Hello words";
  }
}
