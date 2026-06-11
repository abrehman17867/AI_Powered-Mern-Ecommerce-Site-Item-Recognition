import axios from "axios";

export const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;

function attachAuthHeader(config) {
  const jwt = localStorage.getItem("jwt");
  if (jwt) {
    config.headers.Authorization = `Bearer ${jwt}`;
  }
  return config;
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(attachAuthHeader);

export const apiWithMultipart = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "multipart/form-data",
  },
});

apiWithMultipart.interceptors.request.use(attachAuthHeader);
