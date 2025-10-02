import Constants from 'expo-constants'
import axios from "axios";

const { apiUrl, env } = Constants.expoConfig?.extra as {
    apiUrl: string,
    env: string
}

const api = axios.create({
  baseURL: apiUrl,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export default api;
