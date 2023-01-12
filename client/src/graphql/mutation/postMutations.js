import { gql } from "@apollo/client";

const createPost = gql`
  mutation Mutation($createPostInput: CreatePostInput!) {
    createPost(createPostInput: $createPostInput) {
      status
      message
    }
  }
`;

const deletePost = gql`
  mutation Mutation($id: Float!) {
    deletePost(id: $id) {
      status
      message
    }
  }
`;

const updatePost = gql`
  mutation Mutation($updatePostInput: UpdatePostInput!) {
    updatePost(updatePostInput: $updatePostInput) {
      status
      message
    }
  }
`;

export { createPost, deletePost, updatePost };
