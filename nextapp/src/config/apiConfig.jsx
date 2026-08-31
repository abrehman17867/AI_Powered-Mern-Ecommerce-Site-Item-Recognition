"use client";

import axios from "axios";

// The API now lives in the same Next.js app (src/app/api/**), so requests go to
// the same origin. Set NEXT_PUBLIC_BACKEND_URL only to point at a separate API host.
export const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "";

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
