import axios from 'axios';

const API_BASE_URL = __DEV__
  ? 'http://10.0.2.2:8000/api/v1'  // Android emulator -> localhost
  : 'https://api.stip-go.com/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Auth token interceptor — will be configured in auth store
api.interceptors.request.use((config) => {
  // Token injection handled by auth store setup
  return config;
});

// Standard API response type
export interface ApiResponse<T> {
  data: T;
  meta?: {
    pagination?: {
      cursor: string | null;
      has_more: boolean;
    };
  };
  errors?: Array<{
    code: string;
    message: string;
    field?: string;
  }>;
}
