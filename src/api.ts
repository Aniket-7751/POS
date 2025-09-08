import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  organizationLogin: (data: { email: string; password: string }) => api.post('/auth/organization/login', data),
  storeLogin: (data: { email: string; password: string }) => api.post('/auth/store/login', data),
  createOrganizationUser: (data: { name: string; email: string; password: string; organizationId: string; role?: string }) => api.post('/auth/organization/register', data),
  createStoreUser: (data: { name: string; email: string; password: string; storeId: string; role?: string }) => api.post('/auth/store/register', data),
  getProfile: () => api.get('/auth/profile'),
};

// Organization API
export const organizationAPI = {
  getAll: () => api.get('/organizations'),
  getById: (id: string) => api.get(`/organizations/${id}`),
  create: (data: any) => api.post('/organizations', data),
  update: (id: string, data: any) => api.put(`/organizations/${id}`, data),
  delete: (id: string) => api.delete(`/organizations/${id}`),
};

// Store API
export const storeAPI = {
  getAll: () => api.get('/stores'),
  getById: (id: string) => api.get(`/stores/${id}`),
  create: (data: any) => api.post('/stores', data),
  update: (id: string, data: any) => api.put(`/stores/${id}`, data),
  delete: (id: string) => api.delete(`/stores/${id}`),
};

// Category API
export const categoryAPI = {
  getAll: () => api.get('/categories'),
  getById: (id: string) => api.get(`/categories/${id}`),
  create: (data: any) => api.post('/categories', data),
  update: (id: string, data: any) => api.put(`/categories/${id}`, data),
  delete: (id: string) => api.delete(`/categories/${id}`),
};

// Catalogue API
export const catalogueAPI = {
  getAll: () => api.get('/catalogues'),
  getById: (id: string) => api.get(`/catalogues/${id}`),
  create: (data: any) => api.post('/catalogues', data),
  update: (id: string, data: any) => api.put(`/catalogues/${id}`, data),
  delete: (id: string) => api.delete(`/catalogues/${id}`),
  getBySKU: (sku: string) => api.get(`/sales/product/sku/${sku}`),
  getByBarcode: (barcode: string) => api.get(`/sales/product/barcode/${barcode}`),
};

// Sales/Transaction API
export const salesAPI = {
  getAll: () => api.get('/sales'),
  createTransaction: (data: any) => api.post('/sales/transaction', data),
  getTransactionById: (id: string) => api.get(`/sales/transaction/${id}`),
  getTransactionsByStore: (storeId: string) => api.get(`/sales/store/${storeId}`),
  getByDateRange: (startDate: string, endDate: string) => api.get(`/sales/date-range?start=${startDate}&end=${endDate}`),
  getByTransactionId: (transactionId: string) => api.get(`/sales/transaction-id/${transactionId}`),
  getStats: () => api.get('/sales/stats'),
  getTodaysSales: () => api.get('/sales/today'),
  getByPaymentMethod: (paymentMethod: string) => api.get(`/sales/payment-method/${paymentMethod}`),
  getProductBySKU: (sku: string) => api.get(`/sales/product/sku/${sku}`),
  getProductByBarcode: (barcode: string) => api.get(`/sales/product/barcode/${barcode}`),
};

// Billing API
export const billingAPI = {
  generateBill: (data: { transactionId: string }) => api.post('/billing/generate', data),
  getAll: () => api.get('/billing'),
  getById: (id: string) => api.get(`/billing/${id}`),
  getByStore: (storeId: string) => api.get(`/billing/store/${storeId}`),
};

// Legacy API (for backward compatibility)
export const getProducts = () => api.get('/products');
export const createProduct = (data: any) => api.post('/products', data);
export const updateProduct = (id: string, data: any) => api.put(`/products/${id}`, data);
export const deleteProduct = (id: string) => api.delete(`/products/${id}`);

export const getSales = () => api.get('/sales');
export const createSale = (data: any) => api.post('/sales', data);

export const getUsers = () => api.get('/users');
export const createUser = (data: any) => api.post('/users', data);
