import { Nudge, NudgeWithDetails, CreateNudgeDto, UpdateNudgeDto } from '@/types';
import { supabase } from '@/utils/supabase';
import { AuthenticationError, unwrapResult, throwIfError } from './errors';

// API functions
export const nudgesApi = {
  getNudges: async (userId?: string): Promise<NudgeWithDetails[]> => {
    const { data, error } = await supabase
      .from('nudges')
      .select(`*, creator_profile:profiles!nudges_created_by_fkey(first_name, last_name)`)
      .order('created_at', { ascending: false });

    const nudges = unwrapResult(data, error);

    // If userId provided, check which nudges they've upvoted
    if (userId) {
      const { data: upvotes, error: upvotesError } = await supabase
        .from('nudge_upvotes')
        .select('nudge_id')
        .eq('user_id', userId);

      const upvoteData = unwrapResult(upvotes, upvotesError);
      const upvotedNudgeIds = new Set(upvoteData.map((u) => u.nudge_id));

      return nudges.map((nudge) => ({
        ...nudge,
        user_has_upvoted: upvotedNudgeIds.has(nudge.id),
      }));
    }

    return nudges.map((nudge) => ({
      ...nudge,
      user_has_upvoted: false,
    }));
  },

  getNudge: async (id: number, userId?: string): Promise<NudgeWithDetails> => {
    const { data, error } = await supabase
      .from('nudges')
      .select(`*, creator_profile:profiles!nudges_created_by_fkey(first_name, last_name)`)
      .eq('id', id)
      .single();

    const nudge = unwrapResult(data, error);

    // Check if user has upvoted
    if (userId) {
      const { data: upvote } = await supabase
        .from('nudge_upvotes')
        .select('id')
        .eq('nudge_id', id)
        .eq('user_id', userId)
        .maybeSingle();

      return {
        ...nudge,
        user_has_upvoted: !!upvote,
      };
    }

    return {
      ...nudge,
      user_has_upvoted: false,
    };
  },

  getUserNudges: async (userId: string): Promise<NudgeWithDetails[]> => {
    const { data, error } = await supabase
      .from('nudges')
      .select(`*,creator_profile:profiles!nudges_created_by_fkey(first_name, last_name)`)
      .eq('created_by', userId)
      .order('created_at', { ascending: false });

    const nudges = unwrapResult(data, error);
    return nudges;
  },

  createNudge: async (dto: CreateNudgeDto): Promise<Nudge> => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new AuthenticationError();

    const { data: nudge, error: nudgeError } = await supabase
      .from('nudges')
      .insert({
        ...dto,
        created_by: user.id,
        upvotes_count: 0,
      })
      .select()
      .single();

    return unwrapResult(nudge, nudgeError);
  },

  updateNudge: async ({ id, ...dto }: UpdateNudgeDto & { id: number }): Promise<Nudge> => {
    const { data, error } = await supabase
      .from('nudges')
      .update({ ...dto, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    return unwrapResult(data, error);
  },

  deleteNudge: async (id: number): Promise<void> => {
    const { error } = await supabase.from('nudges').delete().eq('id', id);
    throwIfError(error);
  },

  upvoteNudge: async (nudgeId: number): Promise<void> => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new AuthenticationError();

    const { error } = await supabase.from('nudge_upvotes').insert({
      nudge_id: nudgeId,
      user_id: user.id,
    });

    throwIfError(error);
  },

  removeUpvote: async (nudgeId: number): Promise<void> => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new AuthenticationError();

    const { error } = await supabase
      .from('nudge_upvotes')
      .delete()
      .eq('nudge_id', nudgeId)
      .eq('user_id', user.id);

    throwIfError(error);
  },
};
