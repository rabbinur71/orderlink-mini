import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // Vite proxy to http://localhost:5000
  timeout: 10_000
});

export default api;