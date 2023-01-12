import { useMutation } from "@apollo/client";
import moment from "moment/moment";
import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { deletePost } from "../graphql/mutation/postMutations";
import { allPosts } from "../graphql/query/getAllPosts";
import { UserContext } from "../util/userContext";
import "./post.css";

const Post = ({ listPosts, isNewFeed, limit }) => {
  const { user, filterUserSearch, setEditPostId } = useContext(UserContext);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletePostId, setDeletePostId] = useState(null);

  const handleShowText = (e) => {
    e.target.parentNode.classList.toggle("text__container-active");
  };

  const handleClickBtnButtonDel = (postId) => {
    setIsDeleting(true);
    setDeletePostId(postId);
  };

  const handleClickCancelDel = () => {
    setIsDeleting(false);
    setDeletePostId(null);
  };

  const handleClickDelForce = async () => {
    console.log(deletePostId);
    const { data } = await deletePostGraphql({
      variables: {
        id: Number(deletePostId),
      },
      refetchQueries: [
        {
          query: allPosts,
          variables: {
            limit: limit,
            filter: {
              userId: Number(user.id),
            },
          },
        },
      ],
    });

    if (data?.deletePost.status === 200) {
      setIsDeleting(false);
      setDeletePostId(null);
    }
  };

  // graphql operations
  const [deletePostGraphql] = useMutation(deletePost);

  return (
    <div className="mt-10">
      {listPosts?.map((post, index) => {
        const date = post.createdAt.toString().slice(0, 10);
        const dateFormat = moment(date).format("DD MMM YYYY");
        return (
          <div className={`mb-8 border-dotted border-b pb-8 border-gray-800 `} key={index}>
            <div className="flex">
              <h2 className="block-inline ml-3 grow">{post.title}</h2>
              <div className={`${isNewFeed && "hidden"} ${filterUserSearch && "hidden"}`}>
                <Link
                  to={"/edit-post"}
                  className="bg-blue-500 hover:bg-blue-700 text-white px-4 rounded mr-2 p-1"
                  onClick={() => setEditPostId(post.id)}
                >
                  Edit
                </Link>
                <button
                  className="bg-red-500 hover:bg-red-700 text-white px-4 rounded"
                  onClick={() => {
                    handleClickBtnButtonDel(post.id);
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
            <p className="block ml-3 text-sm">
              Create by {post.user.username} ~ {dateFormat}
            </p>
            <div className="m-3 text-sm">
              <p className="text__container-show">{post.text}</p>
              {post.textShort.length >= 100 && (
                <span className="opacity-50 cursor-pointer text__container-show" onClick={(e) => handleShowText(e)}>
                  Hide
                </span>
              )}

              <p className="inline text__container-hide">{post.textShort}</p>
              {post.textShort.length >= 100 && (
                <span className="opacity-50 cursor-pointer text__container-hide" onClick={(e) => handleShowText(e)}>
                  More
                </span>
              )}
            </div>
            <div className="flex flex-end">
              <div className="h-10 w-fit bg-green-100 leading-10 px-4 whitespace-nowrap rounded-lg mx-2 text-sm snap-center">
                {post.tag}
              </div>
            </div>
          </div>
        );
      })}

      {/* popup confirm delete post  */}
      <div className={`w-screen h-screen fixed top-[0px] left-[0px] ${!isDeleting && "hidden"}`}>
        <main className="antialiased bg-gray-200/75 text-gray-900 font-sans overflow-x-hidden">
          <div className="relative px-4 min-h-screen md:flex md:items-center md:justify-center">
            <div className="bg-black opacity-25 w-full h-full absolute z-10 inset-0"></div>
            <div className="bg-white rounded-lg w-6/12 md:mx-auto p-4 fixed inset-x-0 bottom-0 z-50 mb-4 mx-4 md:relative">
              <div className="md:flex items-center">
                <div className="mt-4 md:mt-0 md:ml-6 text-center md:text-left">
                  <p className="font-bold">Delete Post</p>
                  <p className="text-sm text-gray-700 mt-1">This action cannot be undone.</p>
                </div>
              </div>
              <div className="text-center md:text-right mt-4 md:flex md:justify-end">
                <button
                  className="block w-full md:inline-block md:w-auto px-4 py-3 md:py-2 bg-red-200 text-red-700 rounded-lg font-semibold text-sm md:ml-2 md:order-2"
                  onClick={handleClickDelForce}
                >
                  Delete Post
                </button>
                <button
                  className="block w-full md:inline-block md:w-auto px-4 py-3 md:py-2 bg-gray-200 rounded-lg font-semibold text-sm mt-4 md:mt-0 md:order-1"
                  onClick={handleClickCancelDel}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Post;
