import { Field, InputType } from "type-graphql";

@InputType()
export class FilterType {
  @Field({ nullable: true })
  userId?: number;

  @Field({ nullable: true })
  tag?: string;
}
