import { useMutation } from "@apollo/client";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../graphql/mutation/authMutation";
import { UserContext } from "../util/userContext";
import tokenManager from "../util/tokenManager";
import { hello } from "../graphql/query/test";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { toastConfig } from "../util/toastifyConfig";

const Login = () => {
  const { user, setUser } = useContext(UserContext);

  const navigate = useNavigate();

  const [userInfo, setUserInfo] = useState({
    username: "",
    password: "",
  });

  const inputChange = (event) => {
    setUserInfo({
      ...userInfo,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const { data } = await loginGraphql({
      variables: {
        loginInput: {
          username: userInfo.username,
          password: userInfo.password,
        },
      },
      refetchQueries: {
        query: hello,
      },
    });

    if (data.login.status === 400) {
      return toast.error(data.login.message, toastConfig);
    }

    if (data.login.status === 500) {
      return toast.error("Please try again !!!", toastConfig);
    }

    tokenManager.setToken(data.login.accessToken);

    setUser(data.login.user);

    navigate("/");
  };

  // graphql operations
  const [loginGraphql] = useMutation(login);

  if (user) {
    return navigate("/");
  }

  return (
    <section className="h-screen">
      <div className="container px-20 py-20 mt-20 bg-gray-100 rounded-lg">
        <div className="flex justify-center items-center flex-wrap h-full g-6 text-gray-800">
          <div className="">
            <form onSubmit={handleSubmit}>
              {/* <!-- Username input --> */}
              <div className="mb-6">
                <input
                  type="text"
                  className="form-control block w-full px-4 py-2 text-xl font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
                  placeholder="Username"
                  name="username"
                  value={userInfo.username}
                  onChange={inputChange}
                />
              </div>

              {/* <!-- Password input --> */}
              <div className="mb-6">
                <input
                  type="password"
                  className="form-control block w-full px-4 py-2 text-xl font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
                  placeholder="Password"
                  name="password"
                  value={userInfo.password}
                  onChange={inputChange}
                />
              </div>

              {/* <!-- Submit button --> */}
              <button
                type="submit"
                className="inline-block px-7 py-3 bg-blue-600 text-white font-medium text-sm leading-snug uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out w-full"
                data-mdb-ripple="true"
                data-mdb-ripple-color="light"
              >
                Sign in
              </button>

              <div className="flex items-center my-4 before:flex-1 before:border-t before:border-gray-300 before:mt-0.5 after:flex-1 after:border-t after:border-gray-300 after:mt-0.5">
                <p className="text-center font-semibold mx-4 mb-0">OR</p>
              </div>

              <a
                className="px-7 py-3 text-white bg-blue-500 font-medium text-sm leading-snug uppercase rounded shadow-md hover:shadow-lg focus:shadow-lg focus:outline-none focus:ring-0 active:shadow-lg transition duration-150 ease-in-out w-full flex justify-center items-center mb-3"
                href="#!"
                role="button"
                data-mdb-ripple="true"
                data-mdb-ripple-color="light"
              >
                Continue with Facebook
              </a>
              <a
                className="px-7 py-3 text-white font-medium text-sm bg-red-400 leading-snug uppercase rounded shadow-md hover:shadow-lg focus:shadow-lg focus:outline-none focus:ring-0 active:shadow-lg transition duration-150 ease-in-out w-full flex justify-center items-center"
                href="#!"
                role="button"
                data-mdb-ripple="true"
                data-mdb-ripple-color="light"
              >
                Continue with Google
              </a>
            </form>
          </div>
        </div>
      </div>
      <div className="text-sm">
        <ToastContainer />
      </div>
    </section>
  );
};

export default Login;
