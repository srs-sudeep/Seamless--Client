import axios from 'axios';
import { useAuthStore } from '@/store/useAuthStore';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function onRefreshed(token: string) {
  refreshSubscribers.forEach(cb => cb(token));
  refreshSubscribers = [];
}

function addRefreshSubscriber(callback: (token: string) => void) {
  refreshSubscribers.push(callback);
}

// Public client (no token)
export const publicApiClient = axios.create({
  baseURL: BASE_URL,
});

// Authenticated client
export const apiClient = axios.create({
  baseURL: BASE_URL,
});

apiClient.interceptors.request.use(config => {
  // Get the latest access_token from Zustand store
  const access_token = useAuthStore.getState().access_token;
  if (access_token && config.headers) {
    config.headers.Authorization = `Bearer ${access_token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      // Get refresh_token from Zustand store
      const refreshToken = useAuthStore.getState().refresh_token;
      if (!refreshToken) {
        useAuthStore.getState().logout();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise(resolve => {
          addRefreshSubscriber((newToken: string) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(apiClient(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await publicApiClient.post('/refresh-token', {
          refresh_token: refreshToken,
        });

        const newAccessToken = response.data.access_token;
        // Update Zustand store with new access_token
        useAuthStore.setState({ access_token: newAccessToken });

        apiClient.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
        onRefreshed(newAccessToken);
        return apiClient(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
