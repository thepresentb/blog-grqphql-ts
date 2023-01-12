import { gql } from "@apollo/client";

const hello = gql`
  query Query {
    hello
  }
`;

export { hello };
