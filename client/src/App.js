import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Home/Home";
import Navbar from "./Navbar/Navbar";
import Login from "./Login/Login";
import Register from "./Register/Register";
import { UserProvider } from "./util/userContext";
import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import tokenManager from "./util/tokenManager";
import CreatePost from "./CreatePost/CreatePost";
import EditPost from "./EditPost/EditPost";

const httpLink = createHttpLink({
  uri: "http://localhost:4000/graphql",
  credentials: "include",
});

const authLink = setContext((_, { headers }) => {
  // get the authentication token from local storage if it exists
  let token = tokenManager.getToken();

  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          posts: {
            keyArgs: false,
            merge(existing, incoming) {
              let paginatedPosts = [];

              if (existing && existing.paginatedPosts) {
                paginatedPosts = paginatedPosts.concat(existing.paginatedPosts);
              }

              if (incoming && incoming.paginatedPosts) {
                paginatedPosts = paginatedPosts.concat(incoming.paginatedPosts);
              }

              return { ...incoming, paginatedPosts };
            },
          },
        },
      },
    },
  }),
});

function App() {
  return (
    <ApolloProvider client={client}>
      <UserProvider>
        <Router>
          <Navbar />
          <div className="page-container h-max">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/create-post" element={<CreatePost />} />
              <Route path="/edit-post" element={<EditPost />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Routes>
          </div>
        </Router>
      </UserProvider>
    </ApolloProvider>
  );
}

export default App;
