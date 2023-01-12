import { Field, ObjectType } from "type-graphql";
import { IMutationResponse } from "./MutationResponse";
import { Post } from "../entity/Post";

@ObjectType({ implements: IMutationResponse })
export class PostMutationResponse implements IMutationResponse {
  status: number;
  message?: string;

  @Field({ nullable: true })
  post?: Post;
}
