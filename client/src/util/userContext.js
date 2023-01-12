import { createContext, useState } from "react";

const UserContext = createContext();

function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [filterUserSearch, setFilterUserSearch] = useState(null);
  const [editPostId, setEditPostId] = useState(null);

  const store = { user, setUser, filterUserSearch, setFilterUserSearch, editPostId, setEditPostId };

  return <UserContext.Provider value={store}>{children}</UserContext.Provider>;
}

export { UserContext, UserProvider };
