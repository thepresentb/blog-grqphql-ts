import { gql } from "@apollo/client";

const getUserByUsername = gql`
  query Query($username: String!) {
    getUserByUsername(username: $username) {
      id
      username
    }
  }
`;

export { getUserByUsername };
