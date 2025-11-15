import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Contact, ContactWithProfile, CreateContactDto, UpdateContactDto } from './types';
import { supabase } from '@/utils/supabase';

// API functions
export const contactsApi = {
  getContacts: async (userId: string): Promise<ContactWithProfile[]> => {
    const { data, error } = await supabase
      .from('contacts')
      .select(
        `
        *,
        linked_profile:profiles!contacts_linked_user_id_fkey(first_name, last_name)
      `
      )
      .eq('owner_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  getContact: async (id: string): Promise<ContactWithProfile> => {
    const { data, error } = await supabase
      .from('contacts')
      .select(
        `
        *,
        linked_profile:profiles!contacts_linked_user_id_fkey(first_name, last_name)
      `
      )
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  createContact: async (dto: CreateContactDto): Promise<Contact> => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('contacts')
      .insert({
        ...dto,
        owner_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  updateContact: async ({ id, ...dto }: UpdateContactDto & { id: string }): Promise<Contact> => {
    const { data, error } = await supabase
      .from('contacts')
      .update({ ...dto, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  deleteContact: async (id: string): Promise<void> => {
    const { error } = await supabase.from('contacts').delete().eq('id', id);

    if (error) throw error;
  },
};

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
