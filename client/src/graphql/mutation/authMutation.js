import { gql } from "@apollo/client";

const login = gql`
  mutation Mutation($loginInput: LoginInput!) {
    login(loginInput: $loginInput) {
      message
      status
      user {
        id
        username
        email
      }
      accessToken
    }
  }
`;

const register = gql`
  mutation Mutation($registerInput: RegisterInput!) {
    register(registerInput: $registerInput) {
      status
      message
      user {
        id
        username
      }
      accessToken
    }
  }
`;

const logout = gql`
  mutation Mutation {
    logout {
      status
    }
  }
`;

export { login, logout, register };
