import { nudgesApi } from '@/api/nudges';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Query keys
export const nudgeKeys = {
  all: ['nudges'] as const,
  lists: () => [...nudgeKeys.all, 'list'] as const,
  list: (userId?: string) => [...nudgeKeys.lists(), userId] as const,
  details: () => [...nudgeKeys.all, 'detail'] as const,
  detail: (id: number) => [...nudgeKeys.details(), id] as const,
  userNudges: (userId: string) => [...nudgeKeys.all, 'user', userId] as const,
};

// Hooks
export const useNudges = (userId?: string) => {
  return useQuery({
    queryKey: nudgeKeys.list(userId),
    queryFn: () => nudgesApi.getNudges(userId),
  });
};

export const useNudge = (id: number, userId?: string) => {
  return useQuery({
    queryKey: nudgeKeys.detail(id),
    queryFn: () => nudgesApi.getNudge(id, userId),
    enabled: !!id,
  });
};

export const useUserNudges = (userId: string) => {
  return useQuery({
    queryKey: nudgeKeys.userNudges(userId),
    queryFn: () => nudgesApi.getUserNudges(userId),
    enabled: !!userId,
  });
};

export const useCreateNudge = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: nudgesApi.createNudge,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: nudgeKeys.lists() });
    },
  });
};

export const useUpdateNudge = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: nudgesApi.updateNudge,
    onSuccess: (data) => {
      queryClient.setQueryData(nudgeKeys.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: nudgeKeys.lists() });
    },
  });
};

export const useDeleteNudge = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: nudgesApi.deleteNudge,
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: nudgeKeys.lists() });
      queryClient.removeQueries({ queryKey: nudgeKeys.detail(deletedId) });
    },
  });
};

export const useUpvoteNudge = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: nudgesApi.upvoteNudge,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: nudgeKeys.lists() });
    },
  });
};

export const useRemoveUpvote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: nudgesApi.removeUpvote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: nudgeKeys.lists() });
    },
  });
};
