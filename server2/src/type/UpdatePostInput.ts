import { InputType, Field } from "type-graphql";

@InputType()
export class UpdatePostInput {
  @Field()
  id!: number;

  @Field()
  title!: string;

  @Field()
  text!: string;

  @Field()
  tag!: string;
}
