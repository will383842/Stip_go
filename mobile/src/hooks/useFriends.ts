import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useSocialStore } from '../stores/useSocialStore';
import type { ApiResponse, Friendship } from '../types';

export function useFriends() {
  const { setFriends } = useSocialStore();

  return useQuery({
    queryKey: ['friends'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Friendship[]>>('/friends');
      setFriends(data.data);
      return data.data;
    },
    staleTime: 60_000,
  });
}

export function useFriendRequests() {
  const { setFriendRequests } = useSocialStore();

  return useQuery({
    queryKey: ['friend-requests'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Friendship[]>>('/friends/requests');
      setFriendRequests(data.data);
      return data.data;
    },
    staleTime: 30_000,
  });
}

export function useSendFriendRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const { data } = await api.post<ApiResponse<Friendship>>(`/friends/${userId}/request`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      queryClient.invalidateQueries({ queryKey: ['friend-requests'] });
    },
  });
}

export function useAcceptFriend() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const { data } = await api.post<ApiResponse<Friendship>>(`/friends/${userId}/accept`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      queryClient.invalidateQueries({ queryKey: ['friend-requests'] });
    },
  });
}

export function useRemoveFriend() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      await api.delete(`/friends/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
    },
  });
}
