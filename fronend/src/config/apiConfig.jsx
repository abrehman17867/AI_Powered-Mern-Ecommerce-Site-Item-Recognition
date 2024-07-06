import axios from "axios";

export const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;

const jwt = localStorage.getItem("jwt");

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Authorization: `Bearer ${jwt}`,
    "Content-Type": "application/json",
  },
});

export const apiWithMultipart = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Authorization: `Bearer ${jwt}`,
    "Content-Type": "multipart/form-data",
  },
});