import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.DEV
    ? 'http://localhost:3001/api'
    : 'https://gym-note.onrender.com/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

export default api;
