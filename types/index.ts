import { Database, Json, Tables } from '@/database.types';

// Re-export Supabase types for convenience
export type Profile = Tables<'profiles'>;
export type Contact = Tables<'contacts'>;
export type NudgeTarget = Tables<'nudge_targets'>;
export type Nudge = Tables<'nudges'>;
export type NudgeUpvote = Tables<'nudge_upvotes'>;
export type NudgeSend = Tables<'nudge_sends'>;

// Insert types (for creating new records)
export type InsertProfile = Database['public']['Tables']['profiles']['Insert'];
export type InsertContact = Database['public']['Tables']['contacts']['Insert'];
export type InsertNudgeTarget = Database['public']['Tables']['nudge_targets']['Insert'];
export type InsertNudge = Database['public']['Tables']['nudges']['Insert'];

// Update types (for updating records)
export type UpdateProfile = Database['public']['Tables']['profiles']['Update'];
export type UpdateContact = Database['public']['Tables']['contacts']['Update'];
export type UpdateNudgeTarget = Database['public']['Tables']['nudge_targets']['Update'];
export type UpdateNudge = Database['public']['Tables']['nudges']['Update'];

// Custom types for API responses with joins
export interface NudgeTargetWithContacts extends NudgeTarget {
  contacts: Contact[];
  is_group: boolean;
}

export interface NudgeWithDetails extends Nudge {
  user_has_upvoted?: boolean;
  creator_profile?: Pick<Profile, 'first_name' | 'last_name'> | null;
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

export interface CreateNudgeTargetDto {
  name: string;
  recurrence_pattern: Json | null;
  contact_ids: string[];
  image_uri?: string | null;
}

export interface UpdateNudgeTargetDto {
  name?: string;
  recurrence_pattern?: Json | null;
  image_uri?: string | null;
}

export interface CreateNudgeDto {
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
