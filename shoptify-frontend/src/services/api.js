import axios from "axios";

// ✅ ONE SINGLE API INSTANCE
const API = axios.create({
  baseURL: "https://shoptify-production.up.railway.app/api",
});

API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }

  return config;
});

export default API;


// ================= AUTH =================
export const signupUser = (data) => API.post("/auth/signup", data);
export const loginUser = (data) => API.post("/auth/login", data);

// ================= PRODUCTS =================
export const getProducts = () => API.get("/products");

export const createProduct = (product) => API.post("/products", product);
export const updateProduct = (id, product) =>
  API.put(`/products/${id}`, product);
export const deleteProduct = (id) => API.delete(`/products/${id}`);

// ================= ORDERS =================
export const createOrder = (data) => API.post("/orders", data);
export const getOrders = () => API.get("/orders");

// export const getAllOrders = () => API.get("/orders/admin/all");

//export const getAdminStats = () =>
  //API.get("/orders/admin/stats");

export const getAllOrdersAdmin = () =>
  API.get("/orders/admin/all");

export const updateOrderStatus = (id, status) =>
  API.put(`/orders/admin/${id}/status`, { status });

export const changePassword = (data) =>
  API.put("/auth/change-password", data);

export const initializePayment = (data) =>
  API.post("/payments/initialize", data);

export const getProductById = (id) => API.get(`/products/${id}`);

// ================= CHAT =================
export const getChatMessages = () => API.get("/chat");
export const sendChatMessage = (data) => API.post("/chat", data);

