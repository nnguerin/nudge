import {
  NudgeTargetWithContacts,
  CreateNudgeTargetDto,
  UpdateNudgeTargetDto,
  NudgeTarget,
} from './types';
import { supabase } from '@/utils/supabase';
import { AuthenticationError, unwrapResult, throwIfError } from './errors';

// API functions
export const nudgeTargetsApi = {
  getTargets: async (userId: string): Promise<NudgeTargetWithContacts[]> => {
    const { data, error } = await supabase
      .from('nudge_targets')
      .select(`*, nudge_target_contacts(contact:contacts(*))`)
      .eq('owner_id', userId)
      .order('created_at', { ascending: false });

    const targets = unwrapResult(data, error);

    return targets.map((target) => ({
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

    const target = unwrapResult(data, error);

    return {
      ...target,
      contacts: target.nudge_target_contacts.map((ntc: any) => ntc.contact),
      is_group: target.nudge_target_contacts.length > 1,
    };
  },

  createTarget: async (dto: CreateNudgeTargetDto): Promise<NudgeTarget> => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new AuthenticationError();

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

    const createdTarget = unwrapResult(target, targetError);

    // Add contacts to the target
    if (contact_ids.length > 0) {
      const { error: contactsError } = await supabase.from('nudge_target_contacts').insert(
        contact_ids.map((contact_id) => ({
          nudge_target_id: createdTarget.id,
          contact_id,
        }))
      );

      throwIfError(contactsError);
    }

    return createdTarget;
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

    return unwrapResult(data, error);
  },

  deleteTarget: async (id: string): Promise<void> => {
    const { error } = await supabase.from('nudge_targets').delete().eq('id', id);
    throwIfError(error);
  },

  addContactToTarget: async (target_id: string, contact_id: string): Promise<void> => {
    const { error } = await supabase.from('nudge_target_contacts').insert({
      nudge_target_id: target_id,
      contact_id,
    });

    throwIfError(error);
  },

  removeContactFromTarget: async (target_id: string, contact_id: string): Promise<void> => {
    const { error } = await supabase
      .from('nudge_target_contacts')
      .delete()
      .eq('nudge_target_id', target_id)
      .eq('contact_id', contact_id);

    throwIfError(error);
  },
};