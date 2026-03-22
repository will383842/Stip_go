import { useMutation } from '@tanstack/react-query';
import { api } from '../services/api';
import type { ApiResponse, ReportPayload } from '../types';

export function useReport() {
  return useMutation({
    mutationFn: async (payload: ReportPayload) => {
      const { data } = await api.post<ApiResponse<{ id: string }>>('/reports', payload);
      return data.data;
    },
  });
}
