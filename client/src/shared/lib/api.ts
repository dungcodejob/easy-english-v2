import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.PUBLIC_API_URL || '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Handle global errors here if needed
    return Promise.reject(error);
  },
);
