import { useMutation, useQuery } from "@apollo/client";
import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { totalTags } from "../graphql/query/getTotalTags";
import { UserContext } from "../util/userContext";
import "react-toastify/dist/ReactToastify.css";
import { createPost } from "../graphql/mutation/postMutations";
import { allPosts } from "../graphql/query/getAllPosts";
import { toastConfig } from "../util/toastifyConfig";

const CreatePost = () => {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [newPost, setNewPost] = useState({
    title: "",
    text: "",
    tag: "",
  });

  const inputChange = (e) => {
    setNewPost({
      ...newPost,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { data } = await createPostGraphql({
      variables: {
        createPostInput: {
          title: newPost.title,
          text: newPost.text,
          tag: newPost.tag,
        },
      },
      refetchQueries: [{ query: allPosts }, { query: totalTags }],
    });

    setNewPost({
      title: "",
      text: "",
      tag: "",
    });

    if (data?.createPost.status === 200) {
      return navigate("/");
    }

    return toast.error("Please try again !!!", toastConfig);
  };

  // graphql operations
  const { data } = useQuery(totalTags);

  const [createPostGraphql] = useMutation(createPost);

  if (!user) {
    return (
      <div className="flex flex-col">
        <p className=" mt-20">Please login to create a new post</p>
        <Link to="/login" className="block text-center mt-4">
          == Login now!!! ==
        </Link>
      </div>
    );
  }

  return (
    <section className="h-screen w-7/12">
      <div className="container px-20 py-20 mt-20 bg-gray-100 rounded-lg">
        <div className="block p-6 rounded-lg shadow-lg bg-white">
          <h1 className="mb-8 text-center text-2xl">Create Post</h1>
          <form onSubmit={handleSubmit}>
            <div className="form-group mb-6">
              <input
                type="text"
                className="form-control block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
                id="exampleInput7"
                placeholder="Title"
                name="title"
                required
                onChange={(e) => inputChange(e)}
                value={newPost.title}
              />
            </div>
            <div className="form-group mb-6">
              <textarea
                className=" form-control block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none     "
                id="exampleFormControlTextarea13"
                rows="3"
                placeholder="Text..."
                name="text"
                required
                onChange={(e) => inputChange(e)}
                value={newPost.text}
              ></textarea>
            </div>
            <div className="mb-3 xl:w-96">
              <select
                className="form-select appearance-none block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding bg-no-repeat border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
                aria-label="Default select example"
                name="tag"
                required
                onChange={inputChange}
                value={newPost.tag}
              >
                <option disabled value={""}>
                  Open this select tag
                </option>
                {data?.getTotalTags.listKeys.map((key, index) => {
                  return (
                    <option key={index} value={`${key}`}>
                      {key}
                    </option>
                  );
                })}
              </select>
            </div>
            <button
              type="submit"
              className=" w-full px-6 py-2.5 bg-blue-600 text-white font-medium text-xs leading-tight uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out"
            >
              Create
            </button>
          </form>
        </div>
      </div>
      <div className="text-sm">
        <ToastContainer />
      </div>
    </section>
  );
};

export default CreatePost;
