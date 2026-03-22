import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import type { ApiResponse, FeedItem } from '../types';

export function useFeed() {
  return useInfiniteQuery({
    queryKey: ['feed'],
    queryFn: async ({ pageParam }) => {
      const params: Record<string, string> = {};
      if (pageParam) params.cursor = pageParam;

      const { data } = await api.get<ApiResponse<FeedItem[]>>('/feed', { params });
      return {
        items: data.data,
        nextCursor: data.meta?.cursor ?? null,
        hasMore: data.meta?.has_more ?? false,
      };
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
    staleTime: 60_000,
  });
}
