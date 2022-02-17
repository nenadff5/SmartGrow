import axios from 'axios';

const api = axios.create({
  baseURL: 'https://smartgrow.azurewebsites.net/api',
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  },
});

export default api;
