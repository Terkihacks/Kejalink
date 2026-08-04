import { ApiError } from '@/lib/api'

/** Maps backend error codes (see API reference) to renter-facing copy. */
export const ERROR_MESSAGES: Record<string, string> = {
  INVALID_OTP:            'That code is incorrect. Please try again.',
  OTP_EXPIRED:            'This code has expired. Request a new one.',
  OTP_ATTEMPTS_EXCEEDED:  'Too many incorrect attempts. Request a new code.',
  OTP_REQUEST_RATE_LIMIT: 'Too many attempts. Please wait a few minutes and try again.',
  INVALID_CREDENTIALS:    'Incorrect email or password.',
  INVALID_TOTP:           'That authentication code is incorrect.',
  SESSION_EXPIRED:        'Your session expired. Please start again.',
  TOKEN_EXPIRED:          'Your session has expired. Please log in again.',
  INVALID_TOKEN:          'Your session is invalid. Please log in again.',
  SESSION_REVOKED:        'Your session was revoked for security reasons. Please log in again.',
  ACCOUNT_SUSPENDED:      'This account has been suspended.',
  ACCOUNT_DEACTIVATED:    'This account has been deactivated.',
  INSUFFICIENT_ROLE:      "You don't have permission to do that.",
  NOT_FOUND:              'We couldn’t find that.',
  DUPLICATE_RESOURCE:     'That already exists.',
  MAGIC_LINK_INVALID:     'This link is invalid or has expired.',
  MAGIC_LINK_REVOKED:     'This link is no longer active.',
  BAD_REQUEST:            'Please check your details and try again.',
  INTERNAL_ERROR:         'Something went wrong on our end. Please try again.',
}

const FALLBACK_MESSAGE = 'Something went wrong. Please try again.'

/** Resolves any thrown error into user-facing copy, preferring the code table over raw message text. */
export function getErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.code && ERROR_MESSAGES[err.code]) return ERROR_MESSAGES[err.code]
    if (err.message) return err.message
  }
  if (err instanceof Error && err.message) return err.message
  return FALLBACK_MESSAGE
}
