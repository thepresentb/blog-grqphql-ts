import { gql } from "@apollo/client";

const allPosts = gql`
  query Posts($limit: Float!, $filter: FilterType, $cursor: DateTime) {
    posts(limit: $limit, filter: $filter, cursor: $cursor) {
      cursor
      hasMore
      totalCount
      paginatedPosts {
        id
        text
        textShort
        title
        tag
        createdAt
        user {
          id
          username
        }
        userId
      }
    }
  }
`;

export { allPosts };
