import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { usePassportStore } from '../stores/usePassportStore';
import type { ApiResponse, PassportData, Stamp, DeclareCountriesResponse } from '../types';

export function usePassportData() {
  const { setStamps, setStampedCountries, setBadges, setStats, setLevels } = usePassportStore();

  return useQuery({
    queryKey: ['passport'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<PassportData>>('/passport');
      const passport = data.data;
      setStamps(passport.stamps);
      setStampedCountries(passport.stamped_countries ?? []);
      setBadges(passport.badges);
      setStats(passport.stats);
      setLevels(passport.level, passport.next_level);
      return passport;
    },
    staleTime: 5 * 60_000, // 5 min — stamps don't change often
  });
}

export function usePassportStamps() {
  return useInfiniteQuery({
    queryKey: ['passport-stamps'],
    queryFn: async ({ pageParam }) => {
      const params: Record<string, string> = {};
      if (pageParam) params.cursor = pageParam;

      const { data } = await api.get<ApiResponse<Stamp[]>>('/passport', { params });
      return {
        stamps: data.data,
        nextCursor: data.meta?.pagination?.cursor ?? null,
        hasMore: data.meta?.pagination?.has_more ?? false,
      };
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
    staleTime: 5 * 60_000,
  });
}

export function usePassportCompare(userId: string) {
  return useQuery({
    queryKey: ['passport-compare', userId],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<{
        common_stamps: Stamp[];
        user_stamps: number;
        other_stamps: number;
      }>>(`/passport/compare/${userId}`);
      return data.data;
    },
    enabled: !!userId,
    staleTime: 5 * 60_000,
  });
}

export function useDeclareCountries() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (countryCodes: string[]) => {
      const { data } = await api.post<ApiResponse<DeclareCountriesResponse>>('/passport/declare', {
        country_codes: countryCodes,
      });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['passport'] });
    },
  });
}
