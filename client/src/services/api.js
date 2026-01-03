import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Auth API
export const authAPI = {
    login: (username, password) =>
        api.post('/auth/login', { username, password }),

    logout: () =>
        api.post('/auth/logout'),

    getMe: () =>
        api.get('/auth/me'),
};

// Expenses API
export const expensesAPI = {
    getAll: (filters = {}) => {
        const params = new URLSearchParams();
        if (filters.startDate) params.append('startDate', filters.startDate);
        if (filters.endDate) params.append('endDate', filters.endDate);
        if (filters.category) params.append('category', filters.category);
        if (filters.minAmount) params.append('minAmount', filters.minAmount);
        if (filters.maxAmount) params.append('maxAmount', filters.maxAmount);
        if (filters.sortBy) params.append('sortBy', filters.sortBy);
        if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
        return api.get(`/expenses?${params.toString()}`);
    },

    getById: (id) =>
        api.get(`/expenses/${id}`),

    create: (data) =>
        api.post('/expenses', data),

    update: (id, data) =>
        api.put(`/expenses/${id}`, data),

    delete: (id) =>
        api.delete(`/expenses/${id}`),

    getSummary: () =>
        api.get('/expenses/summary'),
};

export default api;
