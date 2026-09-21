import axios from 'axios';

const api = axios.create({
  // .env theke base URL nibe
  baseURL: import.meta.env.VITE_API_URL, 
  withCredentials: true, // HTTP-Only Cookie (JWT) pathanor jonno eta oboshshoi true thakte hobe
});

export default api;