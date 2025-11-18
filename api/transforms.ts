import { Profile } from './types';

/**
 * Supabase returns arrays for joined relationships even when they're many-to-one.
 * These utilities safely extract the first element.
 */

type ProfileJoin = Pick<Profile, 'first_name' | 'last_name'>;

/**
 * Extract first element from Supabase array join result
 * Returns null if array is empty or undefined
 */
export function extractFirst<T>(arr: T[] | undefined | null): T | null {
  if (!arr || arr.length === 0) return null;
  return arr[0];
}

/**
 * Transform a nudge with array joins into proper object structure
 */
export function transformNudgeProfile<T extends { creator_profile: ProfileJoin[] }>(
  nudge: T
): Omit<T, 'creator_profile'> & { creator_profile: ProfileJoin | null } {
  return {
    ...nudge,
    creator_profile: extractFirst(nudge.creator_profile),
  };
}

/**
 * Transform an array of nudges with array joins
 */
export function transformNudgeProfiles<T extends { creator_profile: ProfileJoin[] }>(
  nudges: T[]
): (Omit<T, 'creator_profile'> & { creator_profile: ProfileJoin | null })[] {
  return nudges.map(transformNudgeProfile);
}
