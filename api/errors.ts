import { PostgrestError } from '@supabase/supabase-js';

export class ApiError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: string;

  constructor(message: string, code: string = 'UNKNOWN_ERROR', statusCode: number = 500, details?: string) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

export class AuthenticationError extends ApiError {
  constructor(message: string = 'Not authenticated') {
    super(message, 'AUTH_ERROR', 401);
    this.name = 'AuthenticationError';
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string) {
    super(`${resource} not found`, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends ApiError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
  }
}

/**
 * Convert Supabase PostgrestError to ApiError
 */
export function handleSupabaseError(error: PostgrestError): never {
  const { message, code, details } = error;

  // Map common Supabase error codes
  switch (code) {
    case 'PGRST116': // No rows returned
      throw new NotFoundError('Resource');
    case '23505': // Unique violation
      throw new ApiError('Resource already exists', 'DUPLICATE', 409, details);
    case '23503': // Foreign key violation
      throw new ApiError('Referenced resource not found', 'FK_VIOLATION', 400, details);
    case '42501': // Insufficient privilege
      throw new ApiError('Permission denied', 'FORBIDDEN', 403, details);
    default:
      throw new ApiError(message, code, 500, details);
  }
}

/**
 * Wrapper to handle Supabase query results consistently
 */
export function unwrapResult<T>(data: T | null, error: PostgrestError | null): T {
  if (error) {
    handleSupabaseError(error);
  }
  if (data === null) {
    throw new NotFoundError('Resource');
  }
  return data;
}

/**
 * For void-returning operations (delete, insert without return)
 */
export function throwIfError(error: PostgrestError | null): void {
  if (error) {
    handleSupabaseError(error);
  }
}
