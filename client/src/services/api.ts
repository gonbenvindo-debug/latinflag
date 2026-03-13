import axios from 'axios';
import { Product, Order, Customer, CartItem, PaginatedResponse } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const productService = {
  getProducts: async (params?: {
    category?: string;
    subcategory?: string;
    featured?: boolean;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    limit?: number;
    sort?: string;
  }): Promise<PaginatedResponse<Product>> => {
    const response = await api.get('/products', { params });
    return response.data;
  },

  getCategories: async (): Promise<Record<string, string[]>> => {
    const response = await api.get('/products/categories');
    return response.data;
  },

  getFeaturedProducts: async (): Promise<Product[]> => {
    const response = await api.get('/products/featured');
    return response.data;
  },

  getProduct: async (slug: string): Promise<Product> => {
    const response = await api.get(`/products/${slug}`);
    return response.data;
  },
};

export const orderService = {
  createOrder: async (orderData: {
    items: CartItem[];
    shippingAddress: any;
    billingAddress?: any;
    paymentMethod: string;
    notes?: string;
  }): Promise<Order> => {
    const response = await api.post('/orders', orderData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  getOrders: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<PaginatedResponse<Order>> => {
    const response = await api.get('/orders', { params });
    return response.data;
  },

  getOrder: async (id: string): Promise<Order> => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  updatePayment: async (id: string, paymentData: {
    transactionId: string;
    status: string;
  }): Promise<Order> => {
    const response = await api.put(`/orders/${id}/payment`, paymentData);
    return response.data;
  },

  cancelOrder: async (id: string, reason?: string): Promise<{ message: string }> => {
    const response = await api.post(`/orders/${id}/cancel`, { reason });
    return response.data;
  },
};

export const customerService = {
  register: async (userData: {
    name: string;
    email: string;
    password: string;
    phone: string;
    company?: any;
  }): Promise<{ customer: Customer; token: string }> => {
    const response = await api.post('/customers/register', userData);
    return response.data;
  },

  login: async (credentials: {
    email: string;
    password: string;
  }): Promise<{ customer: Customer; token: string }> => {
    const response = await api.post('/customers/login', credentials);
    return response.data;
  },

  getProfile: async (): Promise<Customer> => {
    const response = await api.get('/customers/profile');
    return response.data;
  },

  updateProfile: async (profileData: {
    name?: string;
    phone?: string;
    company?: any;
    preferences?: any;
  }): Promise<Customer> => {
    const response = await api.put('/customers/profile', profileData);
    return response.data;
  },

  addAddress: async (address: any): Promise<any[]> => {
    const response = await api.post('/customers/addresses', address);
    return response.data;
  },

  updateAddress: async (id: string, address: any): Promise<any[]> => {
    const response = await api.put(`/customers/addresses/${id}`, address);
    return response.data;
  },

  deleteAddress: async (id: string): Promise<any[]> => {
    const response = await api.delete(`/customers/addresses/${id}`);
    return response.data;
  },

  changePassword: async (passwordData: {
    currentPassword: string;
    newPassword: string;
  }): Promise<{ message: string }> => {
    const response = await api.post('/customers/change-password', passwordData);
    return response.data;
  },
};

export const adminService = {
  getDashboard: async (): Promise<any> => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  getOrders: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<PaginatedResponse<Order>> => {
    const response = await api.get('/admin/orders', { params });
    return response.data;
  },

  updateOrder: async (id: string, orderData: {
    status?: string;
    supplierInfo?: any;
    notes?: string;
  }): Promise<Order> => {
    const response = await api.put(`/admin/orders/${id}`, orderData);
    return response.data;
  },

  getCustomers: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    isGuest?: boolean;
  }): Promise<PaginatedResponse<Customer>> => {
    const response = await api.get('/admin/customers', { params });
    return response.data;
  },

  getProducts: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    status?: string;
    search?: string;
  }): Promise<PaginatedResponse<Product>> => {
    const response = await api.get('/admin/products', { params });
    return response.data;
  },

  placeSupplierOrder: async (orderData: {
    orderId: string;
    supplierOrderData: any;
  }): Promise<{ message: string; order: Order }> => {
    const response = await api.post('/admin/supplier/order', orderData);
    return response.data;
  },
};

export default api;
