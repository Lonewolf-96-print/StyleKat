// src/utils/axiosInstance.js
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true, // if you're using cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token automatically
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // 👈 attach token to every request
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
