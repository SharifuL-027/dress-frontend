import axios from 'axios';

const api = axios.create({
  // যেহেতু .env তে ইতিমধ্যেই http://localhost:5000/api দেওয়া আছে, তাই এখানে আর + '/api' লাগবে না
  baseURL: import.meta.env.VITE_API_URL, 
  withCredentials: true,
});

export default api;