import { NetworkStatus, useQuery } from "@apollo/client";
import { useContext, useEffect, useState } from "react";
import { allPosts } from "../graphql/query/getAllPosts";
import { UserContext } from "../util/userContext";
import Post from "./Post";
import TagLists from "./TagLists";

const limit = 5;
let filterPost = {};

const Home = () => {
  const [isNewFeed, setIsNewFeed] = useState(true);
  const { user, filterUserSearch, setFilterUserSearch } = useContext(UserContext);

  const handleLoadMore = () => {
    fetchMore({ variables: { cursor: data?.posts?.cursor } });
  };

  const handleClickNewFeed = () => {
    setIsNewFeed(true);
    setFilterUserSearch(null);
    filterPost = {};
    refetch({
      filter: filterPost,
    });
  };

  const handleClickMyPosts = () => {
    setIsNewFeed(false);
    setFilterUserSearch(null);
    filterPost = { userId: Number(user.id) };
    refetch({
      filter: filterPost,
    });
  };

  // moi khi render lai new feed set filter post ve null
  useEffect(() => {
    refetch({
      filter: {},
    });
  }, []);

  // khi client search post theo username
  useEffect(() => {
    if (filterUserSearch) {
      refetch({
        filter: {
          userId: Number(filterUserSearch.id),
        },
      });
    }
  }, [filterUserSearch?.id]);

  // graphql operations
  const { loading, data, fetchMore, networkStatus, refetch } = useQuery(allPosts, {
    variables: {
      limit: limit,
    },
    notifyOnNetworkStatusChange: true,
  });

  const loadMorePostStatus = networkStatus === NetworkStatus.fetchMore;

  let listPosts = data?.posts.paginatedPosts;

  return (
    <div className="container mx-auto max-w-3xl p-8 grow bg-white mt-8 rounded-lg">
      <div className="flex">
        <div
          className={`${
            // khi chua dang nhap va ko tim kiem nguoi
            !user && !filterUserSearch ? "w-full" : "w-1/2"
          } text-center font-semibold text-xl cursor-pointer ${
            isNewFeed && !filterUserSearch && "border-b-4 border-green-500 pb-4"
          }`}
          onClick={handleClickNewFeed}
        >
          News feed
        </div>
        <div
          className={`w-1/2 text-center font-semibold text-xl cursor-pointer ${!user && "hidden"} ${
            filterUserSearch && "hidden"
          } ${!isNewFeed && "border-b-4 border-green-500 pb-4"}`}
          onClick={handleClickMyPosts}
        >
          My posts
        </div>
        <div
          className={`w-1/2 text-center font-semibold text-xl cursor-pointer ${
            !filterUserSearch && "hidden"
          } border-b-4 border-green-500 pb-4`}
          onClick={handleClickMyPosts}
        >
          Post of {filterUserSearch?.username}
        </div>
      </div>
      {/* co it nhat 1 post de hien thi */}
      {listPosts?.length !== 0 && <TagLists filterPost={filterPost} refetchPost={refetch} isNewFeed={isNewFeed} />}
      {/* loading lan dau va khong render lai khi fetch more */}
      {loading && !loadMorePostStatus && <p>Loading...</p>}
      {listPosts?.length === 0 && <div className="mt-10 text-center">No Post!!!</div>}
      {listPosts?.length !== 0 && <Post listPosts={listPosts} isNewFeed={isNewFeed} limit={limit} />}
      <div className="flex">
        <button
          className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mx-auto ${
            !data?.posts.hasMore && "hidden"
          }`}
          onClick={handleLoadMore}
        >
          {loadMorePostStatus ? "Loading..." : "Show More"}
        </button>
      </div>
    </div>
  );
};

export default Home;
