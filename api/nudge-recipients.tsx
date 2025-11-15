import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  NudgeRecipient,
  NudgeRecipientWithContacts,
  CreateNudgeRecipientDto,
  UpdateNudgeRecipientDto,
} from './types';
import { supabase } from '@/utils/supabase';

// API functions
export const nudgeRecipientsApi = {
  getRecipients: async (userId: string): Promise<NudgeRecipientWithContacts[]> => {
    const { data, error } = await supabase
      .from('nudge_recipients')
      .select(
        `
        *,
        nudge_recipient_contacts(
          contact:contacts(*)
        )
      `
      )
      .eq('owner_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map((recipient) => ({
      ...recipient,
      contacts: recipient.nudge_recipient_contacts.map((nrc: any) => nrc.contact),
      is_group: recipient.nudge_recipient_contacts.length > 1,
      nudge_recipient_contacts: undefined,
    }));
  },

  getRecipient: async (id: string): Promise<NudgeRecipientWithContacts> => {
    const { data, error } = await supabase
      .from('nudge_recipients')
      .select(
        `
        *,
        nudge_recipient_contacts(
          contact:contacts(*)
        )
      `
      )
      .eq('id', id)
      .single();

    if (error) throw error;

    return {
      ...data,
      contacts: data.nudge_recipient_contacts.map((nrc: any) => nrc.contact),
      is_group: data.nudge_recipient_contacts.length > 1,
      nudge_recipient_contacts: undefined,
    };
  },

  createRecipient: async (dto: CreateNudgeRecipientDto): Promise<NudgeRecipient> => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { contact_ids, ...recipientData } = dto;

    // Create the recipient
    const { data: recipient, error: recipientError } = await supabase
      .from('nudge_recipients')
      .insert({
        ...recipientData,
        owner_id: user.id,
      })
      .select()
      .single();

    if (recipientError) throw recipientError;

    // Add contacts to the recipient
    if (contact_ids.length > 0) {
      const { error: contactsError } = await supabase.from('nudge_recipient_contacts').insert(
        contact_ids.map((contact_id) => ({
          nudge_recipient_id: recipient.id,
          contact_id,
        }))
      );

      if (contactsError) throw contactsError;
    }

    return recipient;
  },

  updateRecipient: async ({
    id,
    ...dto
  }: UpdateNudgeRecipientDto & { id: string }): Promise<NudgeRecipient> => {
    const { data, error } = await supabase
      .from('nudge_recipients')
      .update({ ...dto, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  deleteRecipient: async (id: string): Promise<void> => {
    const { error } = await supabase.from('nudge_recipients').delete().eq('id', id);

    if (error) throw error;
  },

  addContactToRecipient: async (recipient_id: string, contact_id: string): Promise<void> => {
    const { error } = await supabase.from('nudge_recipient_contacts').insert({
      nudge_recipient_id: recipient_id,
      contact_id,
    });

    if (error) throw error;
  },

  removeContactFromRecipient: async (recipient_id: string, contact_id: string): Promise<void> => {
    const { error } = await supabase
      .from('nudge_recipient_contacts')
      .delete()
      .eq('nudge_recipient_id', recipient_id)
      .eq('contact_id', contact_id);

    if (error) throw error;
  },
};

// Query keys
export const recipientKeys = {
  all: ['nudge-recipients'] as const,
  lists: () => [...recipientKeys.all, 'list'] as const,
  list: (userId: string) => [...recipientKeys.lists(), userId] as const,
  details: () => [...recipientKeys.all, 'detail'] as const,
  detail: (id: string) => [...recipientKeys.details(), id] as const,
};

// Hooks
export const useNudgeRecipients = (userId: string) => {
  return useQuery({
    queryKey: recipientKeys.list(userId),
    queryFn: () => nudgeRecipientsApi.getRecipients(userId),
    enabled: !!userId,
  });
};

export const useNudgeRecipient = (id: string) => {
  return useQuery({
    queryKey: recipientKeys.detail(id),
    queryFn: () => nudgeRecipientsApi.getRecipient(id),
    enabled: !!id,
  });
};

export const useCreateNudgeRecipient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: nudgeRecipientsApi.createRecipient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recipientKeys.lists() });
    },
  });
};

export const useUpdateNudgeRecipient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: nudgeRecipientsApi.updateRecipient,
    onSuccess: (data) => {
      queryClient.setQueryData(recipientKeys.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: recipientKeys.lists() });
    },
  });
};

export const useDeleteNudgeRecipient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: nudgeRecipientsApi.deleteRecipient,
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: recipientKeys.lists() });
      queryClient.removeQueries({ queryKey: recipientKeys.detail(deletedId) });
    },
  });
};

export const useAddContactToRecipient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ recipient_id, contact_id }: { recipient_id: string; contact_id: string }) =>
      nudgeRecipientsApi.addContactToRecipient(recipient_id, contact_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recipientKeys.all });
    },
  });
};

export const useRemoveContactFromRecipient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ recipient_id, contact_id }: { recipient_id: string; contact_id: string }) =>
      nudgeRecipientsApi.removeContactFromRecipient(recipient_id, contact_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recipientKeys.all });
    },
  });
};
