import type { IsoTimestamp, Uuid } from "@/shared/types";

export type ApprovalStatus = "pending" | "approved" | "rejected";
export type ApprovalRole = "admin" | "govt_admin";

export interface AdminApprovalRequest {
  id: Uuid;
  userId: Uuid;
  requestedRole: ApprovalRole;
  status: ApprovalStatus;
  requestedByEmail: string;
  approvedBy: Uuid | null;
  approvedAt: IsoTimestamp | null;
  rejectionReason: string | null;
  createdAt: IsoTimestamp;
}

export interface AdminRequestRecord {
  id: Uuid;
  adminId: Uuid;
  requestType: string;
  title: string;
  description: string;
  status: ApprovalStatus;
  requestData: unknown;
  createdAt: IsoTimestamp;
  updatedAt: IsoTimestamp;
  adminProfile?: { fullName: string } | null;
}

export interface ActivityLogEntry {
  id: Uuid;
  userId: Uuid;
  actionType: string;
  description: string;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string;
  createdAt: IsoTimestamp;
  userProfile?: { fullName: string; role: string } | null;
}

export type SosDeliveryStatus = "pending" | "sent" | "failed";

export interface SosAlertDelivery {
  id: Uuid;
  incidentId: Uuid;
  userId: Uuid;
  contactId: Uuid | null;
  channel: string;
  recipientEmail: string | null;
  recipientPhone: string | null;
  deliveryStatus: SosDeliveryStatus;
  providerMessageId: string | null;
  errorMessage: string | null;
  resentFromDeliveryId: Uuid | null;
  attemptNumber: number;
  attemptedAt: IsoTimestamp;
}

export interface SosIncidentSummary {
  incidentId: Uuid;
  userId: Uuid;
  triggeredAt: IsoTimestamp;
  status: string;
  locationLat: number | null;
  locationLng: number | null;
  userName: string;
  totalAttempts: number;
  sentCount: number;
  failedCount: number;
  latestAttemptAt: IsoTimestamp;
  deliveries: SosAlertDelivery[];
}

export interface ResendSosAlertInput {
  delivery: SosAlertDelivery;
}
