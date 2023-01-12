import { gql } from "@apollo/client";

const getPost = gql`
  query Query($id: Float!) {
    post(id: $id) {
      tag
      text
      title
    }
  }
`;

export { getPost };
