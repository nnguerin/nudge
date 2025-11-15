import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Nudge, NudgeWithDetails, CreateNudgeDto, UpdateNudgeDto } from './types';
import { supabase } from '@/utils/supabase';

// API functions
export const nudgesApi = {
  getNudges: async (userId?: string): Promise<NudgeWithDetails[]> => {
    const { data, error } = await supabase
      .from('nudges')
      .select(
        `
        *,
        creator_profile:profiles!nudges_created_by_fkey(first_name, last_name),
        recipient:nudge_recipients(id, name)
      `
      )
      .order('created_at', { ascending: false });

    if (error) throw error;

    // If userId provided, check which nudges they've upvoted
    if (userId) {
      const { data: upvotes, error: upvotesError } = await supabase
        .from('nudge_upvotes')
        .select('nudge_id')
        .eq('user_id', userId);

      if (upvotesError) throw upvotesError;

      const upvotedNudgeIds = new Set(upvotes.map((u) => u.nudge_id));

      return data.map((nudge) => ({
        ...nudge,
        user_has_upvoted: upvotedNudgeIds.has(nudge.id),
      }));
    }

    return data.map((nudge) => ({ ...nudge, user_has_upvoted: false }));
  },

  getNudge: async (id: number, userId?: string): Promise<NudgeWithDetails> => {
    const { data, error } = await supabase
      .from('nudges')
      .select(
        `
        *,
        creator_profile:profiles!nudges_created_by_fkey(first_name, last_name),
        recipient:nudge_recipients(id, name)
      `
      )
      .eq('id', id)
      .single();

    if (error) throw error;

    // Check if user has upvoted
    if (userId) {
      const { data: upvote } = await supabase
        .from('nudge_upvotes')
        .select('id')
        .eq('nudge_id', id)
        .eq('user_id', userId)
        .maybeSingle();

      return {
        ...data,
        user_has_upvoted: !!upvote,
      };
    }

    return { ...data, user_has_upvoted: false };
  },

  getUserNudges: async (userId: string): Promise<NudgeWithDetails[]> => {
    const { data, error } = await supabase
      .from('nudges')
      .select(
        `
        *,
        creator_profile:profiles!nudges_created_by_fkey(first_name, last_name),
        recipient:nudge_recipients(id, name)
      `
      )
      .eq('created_by', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  createNudge: async (dto: CreateNudgeDto): Promise<Nudge> => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: nudge, error: nudgeError } = await supabase
      .from('nudges')
      .insert({
        ...dto,
        created_by: user.id,
        upvotes_count: 0,
      })
      .select()
      .single();

    if (nudgeError) throw nudgeError;

    // Get contacts from the recipient
    const { data: recipientContacts, error: contactsError } = await supabase
      .from('nudge_recipient_contacts')
      .select('contact_id')
      .eq('nudge_recipient_id', dto.nudge_recipient_id);

    if (contactsError) throw contactsError;

    // Create nudge_sends for each contact
    if (recipientContacts.length > 0) {
      const { error: sendsError } = await supabase.from('nudge_sends').insert(
        recipientContacts.map((rc) => ({
          nudge_id: nudge.id,
          contact_id: rc.contact_id,
        }))
      );

      if (sendsError) throw sendsError;
    }

    return nudge;
  },

  updateNudge: async ({ id, ...dto }: UpdateNudgeDto & { id: number }): Promise<Nudge> => {
    const { data, error } = await supabase
      .from('nudges')
      .update({ ...dto, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  deleteNudge: async (id: number): Promise<void> => {
    const { error } = await supabase.from('nudges').delete().eq('id', id);

    if (error) throw error;
  },

  upvoteNudge: async (nudgeId: number): Promise<void> => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase.from('nudge_upvotes').insert({
      nudge_id: nudgeId,
      user_id: user.id,
    });

    if (error) throw error;
  },

  removeUpvote: async (nudgeId: number): Promise<void> => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('nudge_upvotes')
      .delete()
      .eq('nudge_id', nudgeId)
      .eq('user_id', user.id);

    if (error) throw error;
  },
};

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
