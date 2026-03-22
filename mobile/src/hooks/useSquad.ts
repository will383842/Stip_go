import { useMutation, useQuery, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useSquadStore } from '../stores/useSquadStore';
import type { ApiResponse, Squad, SquadStamp, SquadMember, CreateSquadPayload, CreateSquadStampPayload, DirectMessage } from '../types';

export function useMySquads() {
  const { setSquads } = useSquadStore();

  return useQuery({
    queryKey: ['squads'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Squad[]>>('/squads/me');
      setSquads(data.data);
      return data.data;
    },
    staleTime: 60_000,
  });
}

export function useSquadDetail(squadId: string) {
  return useQuery({
    queryKey: ['squad', squadId],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Squad>>(`/squads/${squadId}`);
      return data.data;
    },
    enabled: !!squadId,
    staleTime: 30_000,
  });
}

export function useCreateSquad() {
  const queryClient = useQueryClient();
  const { addSquad } = useSquadStore();

  return useMutation({
    mutationFn: async (payload: CreateSquadPayload) => {
      const { data } = await api.post<ApiResponse<Squad>>('/squads', payload);
      return data.data;
    },
    onSuccess: (squad) => {
      addSquad(squad);
      queryClient.invalidateQueries({ queryKey: ['squads'] });
    },
  });
}

export function useEditSquad(squadId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Partial<CreateSquadPayload>) => {
      const { data } = await api.patch<ApiResponse<Squad>>(`/squads/${squadId}`, payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['squad', squadId] });
      queryClient.invalidateQueries({ queryKey: ['squads'] });
    },
  });
}

export function useDeleteSquad() {
  const queryClient = useQueryClient();
  const { removeSquad } = useSquadStore();

  return useMutation({
    mutationFn: async (squadId: string) => {
      await api.delete(`/squads/${squadId}`);
      return squadId;
    },
    onSuccess: (squadId) => {
      removeSquad(squadId);
      queryClient.invalidateQueries({ queryKey: ['squads'] });
    },
  });
}

export function useJoinSquad() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (inviteCode: string) => {
      const { data } = await api.get<ApiResponse<Squad>>(`/squads/join/${inviteCode}`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['squads'] });
    },
  });
}

export function useJoinSquadById(squadId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await api.post(`/squads/${squadId}/join`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['squads'] });
      queryClient.invalidateQueries({ queryKey: ['squad', squadId] });
    },
  });
}

export function useLeaveSquad(squadId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await api.delete(`/squads/${squadId}/leave`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['squads'] });
    },
  });
}

export function useKickMember(squadId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      await api.delete(`/squads/${squadId}/members/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['squad', squadId] });
    },
  });
}

export function useSquadStamps(squadId: string) {
  return useInfiniteQuery({
    queryKey: ['squad-stamps', squadId],
    queryFn: async ({ pageParam }) => {
      const params: Record<string, string> = {};
      if (pageParam) params.cursor = pageParam;

      const { data } = await api.get<ApiResponse<SquadStamp[]>>(`/squads/${squadId}/stamps`, { params });
      return {
        stamps: data.data,
        nextCursor: data.meta?.cursor ?? null,
        hasMore: data.meta?.has_more ?? false,
      };
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
    enabled: !!squadId,
    staleTime: 30_000,
  });
}

export function useCreateSquadStamp(squadId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateSquadStampPayload) => {
      const { data } = await api.post<ApiResponse<SquadStamp>>(`/squads/${squadId}/stamps`, payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['squad-stamps', squadId] });
      queryClient.invalidateQueries({ queryKey: ['squad', squadId] });
    },
  });
}

export function useSquadLeaderboard(squadId: string) {
  return useQuery({
    queryKey: ['squad-leaderboard', squadId],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<SquadMember[]>>(`/squads/${squadId}/leaderboard`);
      return data.data;
    },
    enabled: !!squadId,
    staleTime: 60_000,
  });
}

export function useSquadMessages(squadId: string) {
  return useInfiniteQuery({
    queryKey: ['squad-messages', squadId],
    queryFn: async ({ pageParam }) => {
      const params: Record<string, string> = {};
      if (pageParam) params.cursor = pageParam;

      const { data } = await api.get<ApiResponse<DirectMessage[]>>(`/squads/${squadId}/messages`, { params });
      return {
        messages: data.data,
        nextCursor: data.meta?.cursor ?? null,
        hasMore: data.meta?.has_more ?? false,
      };
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
    enabled: !!squadId,
    staleTime: 15_000,
  });
}

export function useSendSquadMessage(squadId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { content: string; photo_url?: string }) => {
      await api.post(`/squads/${squadId}/messages`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['squad-messages', squadId] });
    },
  });
}
