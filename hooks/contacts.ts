import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contactsApi } from '../api/contacts';

// Query keys
export const contactKeys = {
  all: ['contacts'] as const,
  lists: () => [...contactKeys.all, 'list'] as const,
  list: (userId: string) => [...contactKeys.lists(), userId] as const,
  details: () => [...contactKeys.all, 'detail'] as const,
  detail: (id: string) => [...contactKeys.details(), id] as const,
};

// Hooks
export const useContacts = (userId: string) => {
  return useQuery({
    queryKey: contactKeys.list(userId),
    queryFn: () => contactsApi.getContacts(userId),
    enabled: !!userId,
  });
};

export const useContact = (id: string) => {
  return useQuery({
    queryKey: contactKeys.detail(id),
    queryFn: () => contactsApi.getContact(id),
    enabled: !!id,
  });
};

export const useCreateContact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: contactsApi.createContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() });
    },
  });
};

export const useUpdateContact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: contactsApi.updateContact,
    onSuccess: (data) => {
      queryClient.setQueryData(contactKeys.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() });
    },
  });
};

export const useDeleteContact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: contactsApi.deleteContact,
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() });
      queryClient.removeQueries({ queryKey: contactKeys.detail(deletedId) });
    },
  });
};
