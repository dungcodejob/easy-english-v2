import axios from 'axios';

export const bareApi = axios.create({
  baseURL: import.meta.env.PUBLIC_API_URL || '/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});
