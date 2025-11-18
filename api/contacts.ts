import { Contact, CreateContactDto, UpdateContactDto } from './types';
import { supabase } from '@/utils/supabase';
import { AuthenticationError, unwrapResult, throwIfError } from './errors';

// API functions
export const contactsApi = {
  getContacts: async (userId: string): Promise<Contact[]> => {
    const { data, error } = await supabase
      .from('contacts')
      .select(`*`)
      .eq('owner_id', userId)
      .order('created_at', { ascending: false });

    return unwrapResult(data, error);
  },

  getContact: async (id: string): Promise<Contact> => {
    const { data, error } = await supabase.from('contacts').select(`*`).eq('id', id).single();

    return unwrapResult(data, error);
  },

  createContact: async (dto: CreateContactDto): Promise<Contact> => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new AuthenticationError();

    const { data, error } = await supabase
      .from('contacts')
      .insert({
        ...dto,
        owner_id: user.id,
      })
      .select()
      .single();

    return unwrapResult(data, error);
  },

  updateContact: async ({ id, ...dto }: UpdateContactDto & { id: string }): Promise<Contact> => {
    const { data, error } = await supabase
      .from('contacts')
      .update({ ...dto, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    return unwrapResult(data, error);
  },

  deleteContact: async (id: string): Promise<void> => {
    const { error } = await supabase.from('contacts').delete().eq('id', id);
    throwIfError(error);
  },
};