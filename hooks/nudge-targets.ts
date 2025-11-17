import { nudgeTargetsApi } from '@/api/nudge-targets';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Query keys
export const targetKeys = {
  all: ['nudge-recipients'] as const,
  lists: () => [...targetKeys.all, 'list'] as const,
  list: (userId: string) => [...targetKeys.lists(), userId] as const,
  details: () => [...targetKeys.all, 'detail'] as const,
  detail: (id: string) => [...targetKeys.details(), id] as const,
};

// Hooks
export const useNudgeTargets = (userId: string) => {
  return useQuery({
    queryKey: targetKeys.list(userId),
    queryFn: () => nudgeTargetsApi.getTargets(userId),
    enabled: !!userId,
  });
};

export const useNudgeTarget = (id: string) => {
  return useQuery({
    queryKey: targetKeys.detail(id),
    queryFn: () => nudgeTargetsApi.getTarget(id),
    enabled: !!id,
  });
};

export const useCreateNudgeTarget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: nudgeTargetsApi.createTarget,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: targetKeys.lists() });
    },
  });
};

export const useUpdateNudgeTarget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: nudgeTargetsApi.updateTarget,
    onSuccess: (data) => {
      queryClient.setQueryData(targetKeys.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: targetKeys.lists() });
    },
  });
};

export const useDeleteNudgeTarget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: nudgeTargetsApi.deleteTarget,
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: targetKeys.lists() });
      queryClient.removeQueries({ queryKey: targetKeys.detail(deletedId) });
    },
  });
};

export const useAddContactToTarget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ recipient_id, contact_id }: { recipient_id: string; contact_id: string }) =>
      nudgeTargetsApi.addContactToTarget(recipient_id, contact_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: targetKeys.all });
    },
  });
};

export const useRemoveContactFromTarget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ recipient_id, contact_id }: { recipient_id: string; contact_id: string }) =>
      nudgeTargetsApi.removeContactFromTarget(recipient_id, contact_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: targetKeys.all });
    },
  });
};
