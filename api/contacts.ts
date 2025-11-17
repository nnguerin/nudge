import { Contact, CreateContactDto, UpdateContactDto } from './types';
import { supabase } from '@/utils/supabase';

// API functions
export const contactsApi = {
  getContacts: async (userId: string): Promise<Contact[]> => {
    const { data, error } = await supabase
      .from('contacts')
      .select(`*`)
      .eq('owner_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  getContact: async (id: string): Promise<Contact> => {
    const { data, error } = await supabase.from('contacts').select(`*`).eq('id', id).single();

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