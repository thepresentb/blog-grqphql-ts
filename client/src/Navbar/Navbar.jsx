import { useLazyQuery, useMutation } from "@apollo/client";
import { Fragment, useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../graphql/mutation/authMutation";
import { getUser } from "../graphql/mutation/getUser";
import { UserContext } from "../util/userContext";
import tokenManager from "../util/tokenManager";
import { getUserByUsername } from "../graphql/query/getUserByUsername";

const Navbar = () => {
  const { user, setUser, setFilterUserSearch } = useContext(UserContext);
  const [userNameSearch, setUserNameSearch] = useState("");
  const [logoutGraphql] = useMutation(logout);
  const [getUserInfo] = useMutation(getUser);

  const navigate = useNavigate();

  // get user info from cookie refresh token
  useEffect(() => {
    const main = async () => {
      const result = await tokenManager.handleRefreshToken();
      if (result) {
        const res = await getUserInfo();
        setUser(res.data.getUser);
      }
    };
    main();
  }, []);

  const handleLogout = async () => {
    await logoutGraphql();
    tokenManager.logout();
    setUser(null);
    window.location.reload();
  };

  const handleSearchInputChange = async (e) => {
    setUserNameSearch(e.target.value.toString());
    searchUserByUsername({
      variables: {
        username: userNameSearch,
      },
    });
  };

  const handleClickSearch = (user) => {
    setFilterUserSearch(user);
    searchUserByUsername({
      variables: {
        username: "",
      },
    });
    setUserNameSearch("");
    navigate("/");
  };

  // graphql operations
  const [searchUserByUsername, { data }] = useLazyQuery(getUserByUsername);

  return (
    <nav className="bg-white border-gray-200 px-2 sm:px-4 py-2.5 rounded dark:bg-gray-900">
      <div className="container flex flex-wrap items-center justify-between mx-auto">
        <div className="items-center justify-between  w-full sm:flex sm:w-auto sm:order-2 ml-4" id="navbar-search">
          <ul className="flex flex-col p-4 mt-4 border border-gray-100 rounded-lg bg-gray-50 sm:flex-row sm:space-x-8 sm:mt-0 sm:text-sm sm:font-medium sm:border-0 sm:bg-white dark:bg-gray-800 sm:dark:bg-gray-900 dark:border-gray-700">
            <li>
              <Link
                to="/"
                className="block py-2 pl-3 pr-4 text-white bg-blue-700 rounded sm:bg-transparent sm:text-blue-700 sm:p-0 dark:text-white"
                aria-current="page"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/create-post"
                className="block py-2 pl-3 pr-4 text-white bg-blue-700 rounded sm:bg-transparent sm:text-blue-700 sm:p-0 dark:text-white"
                aria-current="page"
              >
                Create Post
              </Link>
            </li>
            {user ? (
              <Fragment>
                <li>Hi, {user.username}</li>
                <li className="cursor-pointer" onClick={handleLogout}>
                  Logout
                </li>
              </Fragment>
            ) : (
              <Fragment>
                <li>
                  <Link
                    to="/login"
                    className="block py-2 pl-3 pr-4 text-gray-700 rounded hover:bg-gray-100 sm:hover:bg-transparent sm:hover:text-blue-700 sm:p-0 sm:dark:hover:text-white dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white sm:dark:hover:bg-transparent dark:border-gray-700"
                  >
                    Login
                  </Link>
                </li>
                <li>
                  <Link
                    to="/register"
                    className="block py-2 pl-3 pr-4 text-gray-700 rounded hover:bg-gray-100 sm:hover:bg-transparent sm:hover:text-blue-700 sm:p-0 dark:text-gray-400 sm:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white sm:dark:hover:bg-transparent dark:border-gray-700"
                  >
                    Register
                  </Link>
                </li>
              </Fragment>
            )}
          </ul>
        </div>
        <div className="flex sm:order-1">
          <div className="relative hidden sm:block">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg
                className="w-5 h-5 text-gray-500"
                aria-hidden="true"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                ></path>
              </svg>
              <span className="sr-only">Search icon</span>
            </div>
            <input
              type="text"
              id="search-navbar"
              className="block w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Search Username"
              value={userNameSearch}
              onChange={(e) => handleSearchInputChange(e)}
            />
          </div>
          <div
            className={`${data?.getUserByUsername.length === 0 && "hidden"} ${
              !Boolean(userNameSearch) && "hidden"
            } flex justify-center absolute top-[80px]`}
          >
            <ul className="bg-white rounded-lg border border-gray-200 w-96 text-gray-900 rounded-lg">
              {data?.getUserByUsername.map((user, index) => {
                return (
                  <li
                    key={index}
                    onClick={() => handleClickSearch(user)}
                    className="px-6 py-2 border-b border-gray-200 w-full"
                  >
                    {user.username}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
