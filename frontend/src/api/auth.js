import { apiClient } from './client';

export const authApi = {
  login: async (email, password) => {
    // In a real app:
    // const response = await apiClient.post('/auth/login', { email, password });
    // return response.data;
    
    // Mock for now:
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email === 'admin@findoc.ai' && password === 'admin') {
          resolve({
            token: 'mock-jwt-token-12345',
            user: { id: 1, name: 'Admin User', email: 'admin@findoc.ai', role: 'admin' }
          });
        } else {
          reject(new Error('Invalid email or password'));
        }
      }, 1000);
    });
  },
  
  logout: async () => {
    // await apiClient.post('/auth/logout');
    return Promise.resolve();
  }
};
