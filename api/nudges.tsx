import { Nudge, NudgeWithDetails, CreateNudgeDto, UpdateNudgeDto } from './types';
import { supabase } from '@/utils/supabase';

// API functions
export const nudgesApi = {
  getNudges: async (userId?: string): Promise<NudgeWithDetails[]> => {
    console.log('querying for nudges!');
    const { data, error } = await supabase
      .from('nudges')
      .select(`*, creator_profile:profiles!nudges_created_by_fkey(first_name, last_name)`)
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
        // supabase should have inferred that this is a many-to-one relationship
        // this is a workaround
        creator_profile: nudge.creator_profile[0],
        user_has_upvoted: upvotedNudgeIds.has(nudge.id),
      }));
    }

    return data.map((nudge) => ({
      ...nudge,
      user_has_upvoted: false,
      // supabase should have inferred that this is a many-to-one relationship
      // this is a workaround
      creator_profile: nudge.creator_profile[0],
    }));
  },

  getNudge: async (id: number, userId?: string): Promise<NudgeWithDetails> => {
    const { data, error } = await supabase
      .from('nudges')
      .select(`*, creator_profile:profiles!nudges_created_by_fkey(first_name, last_name)`)
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
        // supabase should have inferred that this is a many-to-one relationship
        // this is a workaround
        creator_profile: data.creator_profile[0],
        user_has_upvoted: !!upvote,
      };
    }

    return {
      ...data,
      // supabase should have inferred that this is a many-to-one relationship
      // this is a workaround
      creator_profile: data.creator_profile[0],
      user_has_upvoted: false,
    };
  },

  getUserNudges: async (userId: string): Promise<NudgeWithDetails[]> => {
    const { data, error } = await supabase
      .from('nudges')
      .select(`*,creator_profile:profiles!nudges_created_by_fkey(first_name, last_name)`)
      .eq('created_by', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map((nudge) => ({
      ...nudge,
      // supabase should have inferred that this is a many-to-one relationship
      // this is a workaround
      creator_profile: nudge.creator_profile[0],
    }));
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
