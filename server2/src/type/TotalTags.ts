import { Field, ObjectType } from "type-graphql";

@ObjectType()
export class TotalTags {
  @Field(() => [String])
  listKeys: string[];

  @Field(() => [Number])
  listValues: number[];
}
