import { Profile, UpdateProfileDto } from './types';
import { supabase } from '@/utils/supabase';

// API functions
export const profileApi = {
  getProfile: async (userId: string): Promise<Profile> => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();

    if (error) throw error;
    return data;
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

    if (error) throw error;
    return data;
  },
};
