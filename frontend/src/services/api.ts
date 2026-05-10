import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Redirect to login on 401 or 403 (stale token without permissions)
api.interceptors.response.use(
  (res) => {
    // If the response is paginated { data: [...], meta: {...} }, return just the data array
    // to maintain compatibility with existing components that expect an array.
    if (res.data && res.data.data && res.data.meta) {
      return { ...res, data: res.data.data };
    }
    return res;
  },
  (err) => {
    const status = err.response?.status;
    if ((status === 401 || status === 403) && window.location.pathname !== '/login') {
      // Only force logout on 403 if it's a permissions/auth issue, not a data validation error
      if (status === 401 || (status === 403 && err.response?.data?.message?.includes('permission'))) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  },
);

// Auth
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (data: { email: string; password: string; name: string; role: string; permissions?: string[] }) =>
    api.post('/auth/register', data),
};

// Clients
export const clientsApi = {
  getAll: () => api.get('/clients'),
  getOne: (id: string | number) => api.get(`/clients/${id}`),
  create: (data: any) => api.post('/clients', data),
  update: (id: string | number, data: any) => api.put(`/clients/${id}`, data),
};

// Departments
export const departmentsApi = {
  getAll: () => api.get('/departments'),
  getByCode: (code: string) => api.get(`/departments/${code}`),
  create: (data: { code: string; name?: string; price: number }) =>
    api.post('/departments', data),
  update: (id: string, data: any) => api.put(`/departments/${id}`, data),
};

// Payment Plans
export const paymentPlansApi = {
  getAll: () => api.get('/payment-plans'),
  getOne: (id: string) => api.get(`/payment-plans/${id}`),
  create: (data: any) => api.post('/payment-plans', data),
};

// Payments
export const paymentsApi = {
  getAll: () => api.get('/payments'),
  post: (data: { installmentId: string; amount: number; receiptUrl?: string; reference?: string }) =>
    api.post('/payments', data),
};

// Notifications
export const notificationsApi = {
  getAll: () => api.get('/notifications'),
  getInstallments: (status?: string) =>
    api.get('/notifications/installments', { params: status ? { status } : {} }),
};

// Users (Admin Only)
export const usersApi = {
  getAll: () => api.get('/users'),
  getOne: (id: string) => api.get(`/users/${id}`),
  update: (id: string, data: any) => api.patch(`/users/${id}`, data),
  remove: (id: string) => api.delete(`/users/${id}`),
};

// Exports
export const exportsApi = {
  getSummary: () => api.get('/exports/summary'),
  downloadAccounting: (filters?: any) =>
    api.get('/exports/accounting', { params: filters, responseType: 'blob' }),
};

// AI
export const aiApi = {
  chat: (prompt: string) => api.post('/ai/chat', { prompt }),
};

export default api;
