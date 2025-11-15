import { Database, Tables } from '@/database.types';

// Re-export Supabase types for convenience
export type Profile = Tables<'profiles'>;
export type Contact = Tables<'contacts'>;
export type NudgeRecipient = Tables<'nudge_recipients'>;
export type Nudge = Tables<'nudges'>;
export type NudgeUpvote = Tables<'nudge_upvotes'>;
export type NudgeSend = Tables<'nudge_sends'>;

// Insert types (for creating new records)
export type InsertProfile = Database['public']['Tables']['profiles']['Insert'];
export type InsertContact = Database['public']['Tables']['contacts']['Insert'];
export type InsertNudgeRecipient = Database['public']['Tables']['nudge_recipients']['Insert'];
export type InsertNudge = Database['public']['Tables']['nudges']['Insert'];

// Update types (for updating records)
export type UpdateProfile = Database['public']['Tables']['profiles']['Update'];
export type UpdateContact = Database['public']['Tables']['contacts']['Update'];
export type UpdateNudgeRecipient = Database['public']['Tables']['nudge_recipients']['Update'];
export type UpdateNudge = Database['public']['Tables']['nudges']['Update'];

// Custom types for API responses with joins
export interface ContactWithProfile extends Contact {
  linked_profile?: Pick<Profile, 'first_name' | 'last_name'> | null;
}

export interface NudgeRecipientWithContacts extends NudgeRecipient {
  contacts: Contact[];
  is_group: boolean;
}

export interface NudgeWithDetails extends Nudge {
  user_has_upvoted?: boolean;
  creator_profile?: Pick<Profile, 'first_name' | 'last_name'> | null;
  recipient?: Pick<NudgeRecipient, 'id' | 'name'> | null;
}

// DTO types (what your API accepts)
export interface CreateContactDto {
  name: string;
  email?: string;
  phone?: string;
  linked_user_id?: string;
}

export interface UpdateContactDto {
  name?: string;
  email?: string;
  phone?: string;
  linked_user_id?: string;
}

export interface CreateNudgeRecipientDto {
  name: string;
  contact_ids: string[];
}

export interface UpdateNudgeRecipientDto {
  name?: string;
}

export interface CreateNudgeDto {
  nudge_recipient_id: string;
  text: string;
}

export interface UpdateNudgeDto {
  text?: string;
}

export interface UpdateProfileDto {
  email?: string;
  first_name?: string;
  last_name?: string;
}
