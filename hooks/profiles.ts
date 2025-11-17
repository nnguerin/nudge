import { profileApi } from "@/api/profiles";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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
