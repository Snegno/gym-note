import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.DEV
    ? 'http://localhost:3003/api'  // Локальный сервер (Vite проксирует запросы)
    : 'https://real-api.com/api'   // Реальный бэкенд после деплоя
});

export default api;
