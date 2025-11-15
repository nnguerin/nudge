import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Profile, UpdateProfileDto } from './types';
import { supabase } from '@/utils/supabase';

// API functions
export const profileApi = {
  getProfile: async (userId: string): Promise<Profile> => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();

    if (error) throw error;
    return data;
  },

  updateProfile: async ({
    userId,
    ...dto
  }: UpdateProfileDto & { userId: string }): Promise<Profile> => {
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...dto, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// Query keys
export const profileKeys = {
  all: ['profiles'] as const,
  detail: (userId: string) => [...profileKeys.all, userId] as const,
};

// Hooks
export const useProfile = (userId: string) => {
  return useQuery({
    queryKey: profileKeys.detail(userId),
    queryFn: () => profileApi.getProfile(userId),
    enabled: !!userId,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: profileApi.updateProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(profileKeys.detail(data.id), data);
    },
  });
};
