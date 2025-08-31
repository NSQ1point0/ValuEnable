import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
};

// Policy API
export const policyAPI = {
  createPolicy: (policyData) => api.post('/policy', policyData),
  getUserPolicies: () => api.get('/policy'),
  getPolicyDetails: (policyId) => api.get(`/policy/${policyId}`),
  updatePolicy: (policyId, policyData) => api.put(`/policy/${policyId}`, policyData),
  deletePolicy: (policyId) => api.delete(`/policy/${policyId}`),
};

// Calculation API
export const calculationAPI = {
  calculateIllustration: (policyData) => api.post('/calculation/calculate', policyData),
  validateInputs: (inputData) => api.post('/calculation/validate', inputData),
  getCalculationRules: () => api.get('/calculation/rules'),
  bulkCalculation: (policiesData) => api.post('/calculation/bulk', { policies: policiesData }),
};

export default api;
