import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import type { ApiResponse, AppVersion } from '../types';

export function useAppVersion() {
  return useQuery({
    queryKey: ['app-version'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<AppVersion>>('/app/version');
      return data.data;
    },
    staleTime: 1000 * 60 * 30,
  });
}
