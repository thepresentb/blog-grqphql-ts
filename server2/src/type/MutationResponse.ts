import { InterfaceType, Field } from "type-graphql";

@InterfaceType()
export abstract class IMutationResponse {
  @Field()
  status: number;

  @Field({ nullable: true })
  message?: string;
}
