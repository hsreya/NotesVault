import axios from 'axios';

export const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080';

export const api = axios.create({
  baseURL: apiBaseUrl
});
