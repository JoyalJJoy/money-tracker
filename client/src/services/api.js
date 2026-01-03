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

// Masters API - Categories
export const categoriesAPI = {
    getAll: () => api.get('/masters/categories'),
    create: (data) => api.post('/masters/categories', data),
    update: (id, data) => api.put(`/masters/categories/${id}`, data),
    delete: (id) => api.delete(`/masters/categories/${id}`),
};

// Masters API - SubCategories
export const subcategoriesAPI = {
    getAll: () => api.get('/masters/subcategories'),
    getByCategory: (categoryId) => api.get(`/masters/subcategories/category/${categoryId}`),
    create: (data) => api.post('/masters/subcategories', data),
    update: (id, data) => api.put(`/masters/subcategories/${id}`, data),
    delete: (id) => api.delete(`/masters/subcategories/${id}`),
};

// Masters API - Platforms
export const platformsAPI = {
    getAll: () => api.get('/masters/platforms'),
    create: (data) => api.post('/masters/platforms', data),
    update: (id, data) => api.put(`/masters/platforms/${id}`, data),
    delete: (id) => api.delete(`/masters/platforms/${id}`),
};

// Masters API - Modes
export const modesAPI = {
    getAll: () => api.get('/masters/modes'),
    create: (data) => api.post('/masters/modes', data),
    update: (id, data) => api.put(`/masters/modes/${id}`, data),
    delete: (id) => api.delete(`/masters/modes/${id}`),
};

// Masters API - Statuses
export const statusesAPI = {
    getAll: () => api.get('/masters/statuses'),
    create: (data) => api.post('/masters/statuses', data),
    update: (id, data) => api.put(`/masters/statuses/${id}`, data),
    delete: (id) => api.delete(`/masters/statuses/${id}`),
};

export default api;
