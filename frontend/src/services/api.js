
import axios from "axios";

// =====================================
// AXIOS API CONFIGURATION
// =====================================

const api = axios.create({
  baseURL: "http://localhost:5000/api",

  headers: {
    "Content-Type": "application/json",
  },

  timeout: 15000,
});

// =====================================
// REQUEST INTERCEPTOR
// Automatically attach JWT token
// =====================================

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);

// =====================================
// RESPONSE INTERCEPTOR
// Handle API errors
// =====================================

api.interceptors.response.use(
  (response) => {
    return response;
  },

  (error) => {
    if (error.response) {
      console.error(
        "API Error:",
        error.response.status,
        error.response.data
      );

      if (error.response.status === 401) {
        localStorage.removeItem("token");
      }

    } else if (error.request) {
      console.error(
        "Server is not responding. Check your backend."
      );
    } else {
      console.error("Request Error:", error.message);
    }

    return Promise.reject(error);
  }
);

// =====================================
// AUTHENTICATION APIs
// =====================================

export const authAPI = {
  register: (data) =>
    api.post("/auth/register", data),

  login: (data) =>
    api.post("/auth/login", data),

  logout: () => {
    localStorage.removeItem("token");
  },
};

// =====================================
// SERVICE APIs
// =====================================

export const serviceAPI = {
  getAllServices: () =>
    api.get("/services"),

  getServiceById: (id) =>
    api.get(`/services/${id}`),
};

// =====================================
// TOKEN APIs
// =====================================

export const tokenAPI = {
  generateToken: (serviceId) =>
    api.post("/tokens", {
      service_id: Number(serviceId),
    }),

  getAllTokens: () =>
    api.get("/tokens"),

  getTokenById: (id) =>
    api.get(`/tokens/${id}`),

  getMyTokens: () =>
    api.get("/tokens/my-tokens"),

  cancelToken: (id) =>
    api.patch(`/tokens/${id}/cancel`),
};

// =====================================
// QUEUE APIs
// =====================================

export const queueAPI = {
  getQueueStatus: (serviceId) =>
    api.get(`/queue/${serviceId}`),

  getQueuePosition: (tokenId) =>
    api.get(`/queue/position/${tokenId}`),
};

// =====================================
// ADMIN APIs
// =====================================

export const adminAPI = {
  getDashboard: () =>
    api.get("/admin/dashboard"),

  getUsers: () =>
    api.get("/admin/users"),

  getServices: () =>
    api.get("/admin/services"),

  createService: (data) =>
    api.post("/admin/services", data),

  updateService: (id, data) =>
    api.put(`/admin/services/${id}`, data),

  deleteService: (id) =>
    api.delete(`/admin/services/${id}`),
};

// =====================================
// DEFAULT EXPORT
// =====================================

export default api;
