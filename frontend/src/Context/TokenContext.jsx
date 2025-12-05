import { createContext, useEffect, useState } from "react";
import { setAuthUserId } from "../api/client";

export const tokenContext = createContext();

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
};

export default function TokenContextProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [user, setUser] = useState(getStoredUser());

  useEffect(() => {
    setAuthUserId(token);
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }

    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [token, user]);

  const login = (authToken, userData) => {
    setToken(authToken);
    setUser(userData || null);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setAuthUserId(null);
  };

  return (
    <tokenContext.Provider value={{ token, user, userId: user?.id || null, login, logout }}>
      {children}
    </tokenContext.Provider>
  );
}
