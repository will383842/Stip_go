import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuthStore, setTokens } from '../stores/useAuthStore';
import { isMinor } from '../utils/helpers';
import type {
  AuthResponse,
  SocialAuthPayload,
  EmailOtpPayload,
  OtpVerifyPayload,
  ProfileUpdatePayload,
  User,
  UserSettings,
  ApiResponse,
  PublicProfile,
} from '../types';

export function useSocialAuth() {
  const { setUser, setIsMinor } = useAuthStore();

  return useMutation({
    mutationFn: async (payload: SocialAuthPayload) => {
      const { data } = await api.post<ApiResponse<AuthResponse>>('/auth/social', payload);
      return data.data;
    },
    onSuccess: async (data) => {
      await setTokens(data.token, data.refresh_token);
      setUser(data.user);
      if (data.user.birth_year) {
        setIsMinor(isMinor(data.user.birth_year));
      }
    },
  });
}

export function useSendOtp() {
  return useMutation({
    mutationFn: async (payload: EmailOtpPayload) => {
      const { data } = await api.post<ApiResponse<{ message: string }>>('/auth/email-otp', payload);
      return data.data;
    },
  });
}

export function useVerifyOtp() {
  const { setUser, setIsMinor } = useAuthStore();

  return useMutation({
    mutationFn: async (payload: OtpVerifyPayload) => {
      const { data } = await api.post<ApiResponse<AuthResponse>>('/auth/email-otp/verify', payload);
      return data.data;
    },
    onSuccess: async (data) => {
      await setTokens(data.token, data.refresh_token);
      setUser(data.user);
      if (data.user.birth_year) {
        setIsMinor(isMinor(data.user.birth_year));
      }
    },
  });
}

export function useCheckUsername() {
  return useMutation({
    mutationFn: async (username: string) => {
      const { data } = await api.get<ApiResponse<{ available: boolean }>>('/auth/check-username', {
        params: { q: username },
      });
      return data.data;
    },
  });
}

export function useUpdateProfile() {
  const { updateUser, setIsMinor } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ProfileUpdatePayload) => {
      const { data } = await api.patch<ApiResponse<User>>('/users/me', payload);
      return data.data;
    },
    onSuccess: (user) => {
      updateUser(user);
      if (user.birth_year) {
        setIsMinor(isMinor(user.birth_year));
      }
      // Invalidate all queries that depend on user data
      queryClient.invalidateQueries({ queryKey: ['me'] });
      queryClient.invalidateQueries({ queryKey: ['passport'] });
    },
  });
}

export function useUpdateSettings() {
  return useMutation({
    mutationFn: async (payload: Partial<UserSettings>) => {
      const { data } = await api.put<ApiResponse<UserSettings>>('/users/me/settings', payload);
      return data.data;
    },
  });
}

export function useDeleteAccount() {
  const { logout } = useAuthStore();

  return useMutation({
    mutationFn: async () => {
      await api.delete('/users/me');
    },
    onSuccess: () => logout(),
  });
}

export function useMe() {
  const { setUser } = useAuthStore();

  return useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<User>>('/auth/me');
      setUser(data.data);
      return data.data;
    },
    enabled: useAuthStore.getState().isAuthenticated,
    staleTime: 60_000, // 1 min — profile can change
  });
}

export function usePublicProfile(userId: string) {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<PublicProfile>>(`/users/${userId}/profile`);
      return data.data;
    },
    staleTime: 5 * 60_000, // 5 min
  });
}

export function useBlockUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      await api.post(`/users/${userId}/block`);
    },
    onSuccess: () => {
      // Invalidate clusters + search + passport compare — blocked user disappears everywhere
      queryClient.invalidateQueries({ queryKey: ['clusters'] });
      queryClient.invalidateQueries({ queryKey: ['search'] });
      queryClient.invalidateQueries({ queryKey: ['passport-compare'] });
    },
  });
}

export function useUnblockUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      await api.delete(`/users/${userId}/block`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clusters'] });
    },
  });
}
