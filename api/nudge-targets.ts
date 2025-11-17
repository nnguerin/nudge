import {
  NudgeTargetWithContacts,
  CreateNudgeTargetDto,
  UpdateNudgeTargetDto,
  NudgeTarget,
} from './types';
import { supabase } from '@/utils/supabase';

// API functions
export const nudgeTargetsApi = {
  getTargets: async (userId: string): Promise<NudgeTargetWithContacts[]> => {
    const { data, error } = await supabase
      .from('nudge_targets')
      .select(`*, nudge_target_contacts(contact:contacts(*))`)
      .eq('owner_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map((target) => ({
      ...target,
      contacts: target.nudge_target_contacts.map((ntc: any) => ntc.contact),
      is_group: target.nudge_target_contacts.length > 1,
    }));
  },

  getTarget: async (id: string): Promise<NudgeTargetWithContacts> => {
    const { data, error } = await supabase
      .from('nudge_targets')
      .select(`*, nudge_target_contacts(contact:contacts(*))`)
      .eq('id', id)
      .single();

    if (error) throw error;

    return {
      ...data,
      contacts: data.nudge_target_contacts.map((ntc: any) => ntc.contact),
      is_group: data.nudge_target_contacts.length > 1,
    };
  },

  createTarget: async (dto: CreateNudgeTargetDto): Promise<NudgeTarget> => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { contact_ids, ...targetData } = dto;

    // Create the target
    const { data: target, error: targetError } = await supabase
      .from('nudge_targets')
      .insert({
        ...targetData,
        owner_id: user.id,
      })
      .select()
      .single();

    if (targetError) throw targetError;

    // Add contacts to the target
    if (contact_ids.length > 0) {
      const { error: contactsError } = await supabase.from('nudge_target_contacts').insert(
        contact_ids.map((contact_id) => ({
          nudge_target_id: target.id,
          contact_id,
        }))
      );

      if (contactsError) throw contactsError;
    }

    return target;
  },

  updateTarget: async ({
    id,
    ...dto
  }: UpdateNudgeTargetDto & { id: string }): Promise<NudgeTarget> => {
    const { data, error } = await supabase
      .from('nudge_targets')
      .update({ ...dto, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  deleteTarget: async (id: string): Promise<void> => {
    const { error } = await supabase.from('nudge_targets').delete().eq('id', id);

    if (error) throw error;
  },

  addContactToTarget: async (target_id: string, contact_id: string): Promise<void> => {
    const { error } = await supabase.from('nudge_target_contacts').insert({
      nudge_target_id: target_id,
      contact_id,
    });

    if (error) throw error;
  },

  removeContactFromTarget: async (target_id: string, contact_id: string): Promise<void> => {
    const { error } = await supabase
      .from('nudge_target_contacts')
      .delete()
      .eq('nudge_target_id', target_id)
      .eq('contact_id', contact_id);

    if (error) throw error;
  },
};