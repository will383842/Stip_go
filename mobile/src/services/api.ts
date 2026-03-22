import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { Platform } from 'react-native';
import { getToken, getRefreshToken, setTokens, useAuthStore } from '../stores/useAuthStore';
import { useSettingsStore } from '../stores/useSettingsStore';
import Constants from 'expo-constants';

const API_BASE_URL = __DEV__
  ? 'http://10.0.2.2:8000/api/v1'
  : 'https://api.stip-me.com/api/v1';

const APP_VERSION = Constants.expoConfig?.version || '0.1.0';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// === REQUEST INTERCEPTOR — inject auth token + metadata headers ===
api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await getToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Metadata headers for backend analytics + i18n
  if (config.headers) {
    config.headers['Accept-Language'] = useSettingsStore.getState().locale || 'fr';
    config.headers['X-Device-Platform'] = Platform.OS; // 'ios' | 'android'
    config.headers['X-App-Version'] = APP_VERSION;
  }

  return config;
});

// === RESPONSE INTERCEPTOR — handle 401 refresh + global error mapping ===
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const status = error.response?.status;

    // --- 401: Token expired → attempt refresh ---
    if (status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              resolve(api(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await getRefreshToken();
        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });

        const newToken = data?.data?.token;
        const newRefreshToken = data?.data?.refresh_token;
        if (!newToken || !newRefreshToken) throw new Error('Invalid refresh response');
        await setTokens(newToken, newRefreshToken);

        processQueue(null, newToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Refresh failed → force logout, redirect to Auth
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

// === ERROR HELPERS — translate HTTP codes to user-facing messages ===

export interface AppError {
  status: number;
  message: string;
  field?: string;
  isNetwork: boolean;
}

export function parseApiError(error: unknown): AppError {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status || 0;
    const data = error.response?.data as any;

    // JSON parse error (WiFi captif returns HTML)
    if (error.response && typeof error.response.data === 'string') {
      return { status: 0, message: 'Connexion limitée. Vérifie ton WiFi.', isNetwork: true };
    }

    // Network error (no response at all)
    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        return { status: 0, message: 'Connexion lente. Réessaie.', isNetwork: true };
      }
      return { status: 0, message: 'Erreur réseau. Vérifie ta connexion.', isNetwork: true };
    }

    // Specific field validation error
    const fieldError = data?.errors?.[0];
    if (status === 422 && fieldError) {
      return { status, message: fieldError.message, field: fieldError.field, isNetwork: false };
    }

    // Known HTTP codes
    const messages: Record<number, string> = {
      403: "Cette action n'est pas disponible",
      404: 'Introuvable',
      409: 'Tu as déjà stampé ici',
      429: 'Trop de tentatives. Réessaie dans quelques minutes.',
      500: 'Une erreur est survenue. Réessaie.',
      503: "L'app est en maintenance. Reviens vite !",
    };

    return {
      status,
      message: messages[status] || data?.message || 'Une erreur est survenue',
      field: fieldError?.field,
      isNetwork: false,
    };
  }

  return { status: 0, message: 'Une erreur est survenue', isNetwork: false };
}
