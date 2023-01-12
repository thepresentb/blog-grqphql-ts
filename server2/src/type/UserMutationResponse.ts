import { User } from "../entity/User";
import { Field, ObjectType } from "type-graphql";
import { IMutationResponse } from "./MutationResponse";

@ObjectType({ implements: IMutationResponse })
export class UserMutationResponse implements IMutationResponse {
  status: number;
  message?: string;

  @Field({ nullable: true })
  user?: User;

  @Field({ nullable: true })
  accessToken?: string;
}
