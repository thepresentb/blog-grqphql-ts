import jwtDecode from "jwt-decode";

function tokenManager() {
  let accessToken = null;
  let setTimeoutRefreshTokenId = null;

  const getToken = () => {
    return accessToken;
  };
  const setToken = (token) => {
    accessToken = token;

    // auto refresh token
    const decoded = jwtDecode(token);
    setTimeoutRefreshToken(decoded.exp - decoded.iat);
  };

  const setTimeoutRefreshToken = (delay) => {
    setTimeoutRefreshTokenId = window.setTimeout(() => {
      handleRefreshToken();
    }, delay * 1000 - 5000);
  };

  const abortRefreshToken = () => {
    if (setTimeoutRefreshTokenId) {
      window.clearTimeout(setTimeoutRefreshTokenId);
    }
  };

  const logout = () => {
    accessToken = null;
    abortRefreshToken();
  };

  const handleRefreshToken = async () => {
    try {
      const response = await fetch("http://localhost:4000/refresh_token", {
        credentials: "include",
      });
      const data = await response.json();

      console.log("check data", data);

      setToken(data.accessToken);
      return true;
    } catch (error) {
      console.log("UNAUTHENTICATED", error);
      accessToken = null;
      abortRefreshToken();
      return false;
    }
  };

  return {
    getToken,
    setToken,
    handleRefreshToken,
    logout,
  };
}

export default tokenManager();
