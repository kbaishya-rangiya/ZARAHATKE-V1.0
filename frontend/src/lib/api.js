import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({ baseURL: API });

export const fetchProducts = (section) =>
  api.get("/products", { params: section ? { section } : {} }).then((r) => r.data);

export const fetchCategories = () => api.get("/categories").then((r) => r.data);
export const fetchReviews = () => api.get("/reviews").then((r) => r.data);
export const fetchHeroSlides = () => api.get("/hero-slides").then((r) => r.data);
export const fetchInstagram = () => api.get("/instagram-feed").then((r) => r.data);
export const subscribeNewsletter = (email) =>
  api.post("/newsletter", { email }).then((r) => r.data);
