import { useQuery } from "@apollo/client";
import { useContext } from "react";
import { totalTags } from "../graphql/query/getTotalTags";
import { UserContext } from "../util/userContext";

const TagLists = ({ filterPost, refetchPost, isNewFeed }) => {
  const { filterUserSearch } = useContext(UserContext);
  const handleClickFilterTag = (tag) => {
    if (filterPost["tag"] === tag) {
      delete filterPost["tag"];
      // tim kiem theo tag khi client dang search theo username hoac ko
      if (filterUserSearch) {
        filterPost["userId"] = Number(filterUserSearch.id);
        return refetchPost({ filter: filterPost });
      } else {
        refetchPost({ filter: filterPost });
      }
    } else {
      filterPost["tag"] = tag;
      if (filterUserSearch) {
        filterPost["userId"] = Number(filterUserSearch.id);
        return refetchPost({ filter: filterPost });
      } else {
        refetchPost({ filter: filterPost });
      }
    }
  };

  // graphql operations
  const { loading, data, refetch } = useQuery(totalTags);
  if (loading) return <div></div>;

  if (filterUserSearch) {
    refetch({
      // lay tag theo ten nguoi dang tim kiem
      userId: Number(filterUserSearch?.id),
    });
  } else {
    refetch({
      // neu la new feed thi lay tat ca cac tag ( ko search theo useId -- null)
      // neu la my post thi lay tag theo nguoi dung da dang nhap
      userId: isNewFeed ? null : filterPost["userId"],
    });
  }

  return (
    <div className="mt-4 flex overflow-x-scroll pb-2">
      {data?.getTotalTags.listKeys.map((key, index) => {
        return (
          <div
            className={`h-10 w-fit ${
              filterPost["tag"] === key ? "bg-green-300" : "bg-green-100"
            } leading-10 px-4 whitespace-nowrap rounded-lg hover:bg-green-200 mx-2 text-sm snap-center cursor-pointer`}
            key={index}
            onClick={() => handleClickFilterTag(key)}
          >
            {key} ({data?.getTotalTags.listValues[index]})
          </div>
        );
      })}
    </div>
  );
};

export default TagLists;
