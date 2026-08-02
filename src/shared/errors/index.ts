/**
 * Lightweight typed error hierarchy for service / store boundaries.
 * Intentionally small — avoids enterprise error frameworks while still
 * giving callers something they can `instanceof`-narrow on.
 */

export class AppError extends Error {
  readonly code: string;
  readonly cause?: unknown;
  constructor(message: string, code = "APP_ERROR", cause?: unknown) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.cause = cause;
  }
}

/** Business-rule violation (e.g. illegal state transition). */
export class DomainError extends AppError {
  constructor(message: string, code = "DOMAIN_ERROR", cause?: unknown) {
    super(message, code, cause);
    this.name = "DomainError";
  }
}

/** Input validation failure — safe to surface to the user. */
export class ValidationError extends AppError {
  readonly field?: string;
  constructor(message: string, field?: string, cause?: unknown) {
    super(message, "VALIDATION_ERROR", cause);
    this.name = "ValidationError";
    this.field = field;
  }
}

export const isAppError = (e: unknown): e is AppError => e instanceof AppError;
export const isDomainError = (e: unknown): e is DomainError =>
  e instanceof DomainError;
export const isValidationError = (e: unknown): e is ValidationError =>
  e instanceof ValidationError;
