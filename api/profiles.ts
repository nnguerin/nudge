import { Profile, UpdateProfileDto } from '@/types';
import { supabase } from '@/utils/supabase';
import { unwrapResult } from './errors';

// API functions
export const profileApi = {
  getProfile: async (userId: string): Promise<Profile> => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();

    return unwrapResult(data, error);
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

    return unwrapResult(data, error);
  },
};
