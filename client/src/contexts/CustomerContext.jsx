// src/contexts/CustomerContext.jsx

import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { API_URL } from "../lib/config";

const CustomerContext = createContext();

export const CustomerProvider = ({ children }) => {
  const [customer, setCustomer] = useState(null);
  const [customerToken, setCustomerToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  /* ----------------------------------------------
      RESTORE USER FROM LOCAL STORAGE ON REFRESH
  ---------------------------------------------- */
  useEffect(() => {
    const savedUser = localStorage.getItem("customerUser");
    const savedToken = localStorage.getItem("customerToken");

    if (savedUser && savedToken) {
      try {
        setCustomer(JSON.parse(savedUser));
        setCustomerToken(savedToken);
      } catch (err) {
        console.error("❌ Failed restoring customer:", err);
        localStorage.removeItem("customerUser");
        localStorage.removeItem("customerToken");
      }
    }

    setLoading(false);
  }, []);

  /* ----------------------------------------------
      LOGIN (EMAIL + PASSWORD)
  ---------------------------------------------- */
  const login = async (email, password) => {
    const res = await fetch(`${API_URL}/api/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (res.ok) navigate("/user/dashboard")
    if (!res.ok || !data.token) return data;


    // SAVE
    localStorage.setItem("customerToken", data.token);
    localStorage.setItem("customerUser", JSON.stringify(data.user));

    setCustomer(data.user);
    setCustomerToken(data.token);

    return data;
  };

  /* ----------------------------------------------
      REGISTER USER
  ---------------------------------------------- */
  const register = async (name, email, password, phone) => {
    const res = await fetch(`${API_URL}/api/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, phone }),
    });

    const data = await res.json();
    if (!res.ok || !data.token) return data;
    if (res.ok) navigate("/user/dashboard")

    localStorage.setItem("customerToken", data.token);
    localStorage.setItem("customerUser", JSON.stringify(data.user));

    setCustomer(data.user);
    setCustomerToken(data.token);

    return data;
  };

  /* ----------------------------------------------
      LOGIN WITH GOOGLE (COMMON FOR ANY PAGE)
  ---------------------------------------------- */
  const googleLogin = async (credential) => {
    const res = await fetch(`${API_URL}/api/users/google/user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: credential }),
    });

    const data = await res.json();
    if (!res.ok || !data.token) return data;

    // SAVE
    localStorage.setItem("customerToken", data.token);
    localStorage.setItem("customerUser", JSON.stringify(data.user));

    setCustomer(data.user);
    setCustomerToken(data.token);

    return data;
  };

  /* ----------------------------------------------
      LOGOUT
  ---------------------------------------------- */
  const logout = () => {
    localStorage.removeItem("customerToken");
    localStorage.removeItem("customerUser");

    setCustomer(null);
    setCustomerToken(null);
  };

  return (
    <CustomerContext.Provider
      value={{
        customer,
        customerToken,
        setCustomer,
        setCustomerToken,
        login,
        register,
        googleLogin,
        loading,
        logout,
        setLoading,
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
};

export const useCustomer = () => useContext(CustomerContext);
