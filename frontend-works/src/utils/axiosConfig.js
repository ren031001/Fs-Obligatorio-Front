import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const axiosConfig = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

axiosConfig.interceptors.response.use(
  (response) => response,
  (error) => {
    // En /auth/ un 401 es "usuario o contraseña incorrectos": eso lo muestra Login
    const esAuth = error.config?.url?.includes("/auth/");
    if (error.response?.status === 401 && !esAuth) {
      localStorage.clear();
      sessionStorage.setItem("sesionVencida", "1");
      window.location.href = "/";
    }
    return Promise.reject(error);
  },
);
