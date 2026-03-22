import { useMutation, useQuery, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useDmStore } from '../stores/useDmStore';
import type { ApiResponse, Conversation, DirectMessage, SendMessagePayload } from '../types';

export function useConversations() {
  const { setConversations } = useDmStore();

  return useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Conversation[]>>('/dm');
      setConversations(data.data);

      // Calculate total unread
      const total = data.data.reduce((sum, c) => sum + c.unread_count, 0);
      useDmStore.getState().setUnreadCount(total);

      return data.data;
    },
    staleTime: 30_000,
  });
}

export function useMessages(conversationId: string) {
  return useInfiniteQuery({
    queryKey: ['messages', conversationId],
    queryFn: async ({ pageParam }) => {
      const params: Record<string, string> = {};
      if (pageParam) params.cursor = pageParam;

      const { data } = await api.get<ApiResponse<DirectMessage[]>>(`/dm/${conversationId}`, { params });
      return {
        messages: data.data,
        nextCursor: data.meta?.cursor ?? null,
        hasMore: data.meta?.has_more ?? false,
      };
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
    staleTime: 10_000,
    enabled: !!conversationId,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: SendMessagePayload) => {
      const { data } = await api.post<ApiResponse<{ message: DirectMessage; conversation_id: string }>>('/dm', payload);
      return data.data;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['messages', result.conversation_id] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

export function useReactToMessage(conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ messageId, emoji }: { messageId: string; emoji: string }) => {
      await api.post(`/dm/${conversationId}/react`, { message_id: messageId, emoji });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
    },
  });
}

export function useMarkConversationRead(conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await api.post(`/dm/${conversationId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}
