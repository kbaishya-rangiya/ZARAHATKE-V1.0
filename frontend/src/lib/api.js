import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({ baseURL: API });

export const fetchProducts = (params) =>
  api.get("/products", { params: params || {} }).then((r) => r.data);

export const fetchProduct = (id) => api.get(`/products/${id}`).then((r) => r.data);

export const fetchCategories = () => api.get("/categories").then((r) => r.data);
export const fetchCategoryDetail = (slug) =>
  api.get(`/categories/${slug}`).then((r) => r.data);

export const fetchReviews = () => api.get("/reviews").then((r) => r.data);
export const fetchHeroSlides = () => api.get("/hero-slides").then((r) => r.data);
export const fetchInstagram = () => api.get("/instagram-feed").then((r) => r.data);
export const fetchInstagramLook = (id) =>
  api.get(`/instagram-feed/${id}`).then((r) => r.data);

export const subscribeNewsletter = (email) =>
  api.post("/newsletter", { email }).then((r) => r.data);

export const createCheckout = (payload) =>
  api.post("/checkout", payload).then((r) => r.data);

export const fetchPaymentStatus = (sessionId) =>
  api.get(`/payments/status/${sessionId}`).then((r) => r.data);

export const fetchOrder = (orderId) =>
  api.get(`/orders/${orderId}`).then((r) => r.data);
