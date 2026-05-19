import axios from "axios";

const api = axios.create({
  baseURL: "", // Utilizes our Vite server proxy
});

// Automatically inject JWT Token into the Authorization header of every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("smartbiz_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercept responses to handle 401 (expired/invalid token) errors instantly
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear expired credentials
      localStorage.removeItem("smartbiz_token");
      localStorage.removeItem("smartbiz_user");
      
      // Redirect to login page
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
