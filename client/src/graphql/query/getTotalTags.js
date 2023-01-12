import { gql } from "@apollo/client";

const totalTags = gql`
  query GetTotalTags($userId: Float) {
    getTotalTags(userId: $userId) {
      listKeys
      listValues
    }
  }
`;

export { totalTags };
