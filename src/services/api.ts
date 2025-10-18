import Constants from "expo-constants";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { apiUrl, env } = Constants.expoConfig?.extra as {
  apiUrl: string;
  env: string;
};

// Log para debug - remova depois de confirmar que está correto
console.log("🔧 API URL configurada:", apiUrl);
console.log("🌍 Ambiente:", env);

const api = axios.create({
  baseURL: apiUrl,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
