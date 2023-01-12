import { useMutation } from "@apollo/client";
import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import tokenManager from "../util/tokenManager";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { register } from "../graphql/mutation/authMutation";
import { toastConfig } from "../util/toastifyConfig";
import { UserContext } from "../util/userContext";

const Register = () => {
  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const [userInfo, setUserInfo] = useState({
    username: "",
    email: "",
    password: "",
    confirm_password: "",
  });

  const inputChange = (event) => {
    setUserInfo({
      ...userInfo,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (userInfo.password !== userInfo.confirm_password) {
      return toast.error("Confirm password and Password not match", toastConfig);
    }

    const { data } = await registerGraphql({
      variables: {
        registerInput: {
          username: userInfo.username,
          email: userInfo.email,
          password: userInfo.password,
        },
      },
    });

    if (data.register.status === 400) {
      return toast.error(data.register.message, toastConfig);
    }

    if (data.register.status === 500) {
      return toast.error("Please try again !!!", toastConfig);
    }

    tokenManager.setToken(data.register.accessToken);

    setUser(data.register.user);

    navigate("/");
  };

  // graphql operations
  const [registerGraphql] = useMutation(register);

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

              {/* <!-- Email input --> */}
              <div className="mb-6">
                <input
                  type="text"
                  className="form-control block w-full px-4 py-2 text-xl font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
                  placeholder="Email"
                  name="email"
                  value={userInfo.email}
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

              <div className="mb-6">
                <input
                  type="password"
                  className="form-control block w-full px-4 py-2 text-xl font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
                  placeholder="Confirm Password"
                  name="confirm_password"
                  value={userInfo.confirm_password}
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
                Register
              </button>

              <div className="flex items-center my-4 before:flex-1 before:border-t before:border-gray-300 before:mt-0.5 after:flex-1 after:border-t after:border-gray-300 after:mt-0.5">
                <p className="text-center mx-4 mt-8 ">
                  Have an account? <Link to="/login">Login now!!!</Link>
                </p>
              </div>
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

export default Register;
