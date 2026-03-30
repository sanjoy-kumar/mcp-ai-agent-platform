import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000"
});

// Attach token automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Handle expired token globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.log("Token expired → redirecting to login");

      // Remove invalid token
      localStorage.removeItem("token");

      // Redirect to login page
      window.location.href = "/";
    }

    return Promise.reject(error);
  }
);


export default API;



