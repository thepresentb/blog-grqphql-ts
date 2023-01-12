import { Post } from "./../entity/Post";
import { Field, ObjectType } from "type-graphql";

@ObjectType()
export class PaginatedPosts {
  @Field()
  totalCount: number;

  @Field()
  cursor: Date;

  @Field()
  hasMore: boolean;

  @Field(() => [Post])
  paginatedPosts: Post[];
}
