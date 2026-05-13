import axios from "axios";
import { BACKEND_URL } from "../constants";

const API = axios.create({
  baseURL: BACKEND_URL,
   timeout: 10000,
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

export default API;