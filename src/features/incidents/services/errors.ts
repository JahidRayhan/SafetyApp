import { AppError } from "@/shared/errors";

export type IncidentErrorCode =
  | "INCIDENTS_LIST_FAILED"
  | "INCIDENTS_CREATE_FAILED";

export class IncidentServiceError extends AppError {
  constructor(message: string, code: IncidentErrorCode, cause?: unknown) {
    super(message, code, cause);
    this.name = "IncidentServiceError";
  }
}
