import { gql } from "@apollo/client";

const getUser = gql`
  mutation getUser {
    getUser {
      id
      username
      email
    }
  }
`;

export { getUser };
