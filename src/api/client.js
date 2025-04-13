import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.DEV
    ? 'http://localhost:3001/api'  // Локальный сервер (Vite проксирует запросы)
    : 'https://gym-note.onrender.com/api'   // Реальный бэкенд после деплоя
});

export default api;
