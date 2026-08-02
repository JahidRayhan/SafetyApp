import { supabase } from "@/core/database/client";
import { AppError, DomainError } from "@/shared/errors";
import { asIso, asUuid } from "@/shared/types";
import type { AdminRequestRecord } from "../domain/types";

interface AdminRequestRow {
  id: string;
  admin_id: string;
  request_type: string;
  title: string;
  description: string;
  status: string;
  request_data: unknown;
  created_at: string;
  updated_at: string;
  profiles?: { full_name: string } | null;
}

interface GovernmentRequestRow {
  id: string;
  government_admin_id: string;
  request_type: string;
  title: string;
  description: string;
  status: string;
  request_data: unknown;
  created_at: string;
  target_user_id?: string | null;
  profiles?: { full_name: string } | null;
}

export interface GovernmentRequestRecord {
  id: string;
  governmentAdminId: string;
  requestType: string;
  title: string;
  description: string;
  status: string;
  requestData: unknown;
  createdAt: string;
  targetUserId?: string | null;
  targetUserProfile?: { fullName: string } | null;
}

const toAdminRequest = (row: AdminRequestRow): AdminRequestRecord => ({
  id: asUuid(row.id),
  adminId: asUuid(row.admin_id),
  requestType: row.request_type,
  title: row.title,
  description: row.description,
  status: row.status as AdminRequestRecord["status"],
  requestData: row.request_data,
  createdAt: asIso(row.created_at),
  updatedAt: asIso(row.updated_at),
  adminProfile: row.profiles ? { fullName: row.profiles.full_name } : null,
});

const toGovernmentRequest = (row: GovernmentRequestRow): GovernmentRequestRecord => ({
  id: row.id,
  governmentAdminId: row.government_admin_id,
  requestType: row.request_type,
  title: row.title,
  description: row.description,
  status: row.status,
  requestData: row.request_data,
  createdAt: row.created_at,
  targetUserId: row.target_user_id,
  targetUserProfile: row.profiles ? { fullName: row.profiles.full_name } : null,
});

export const adminRequestService = {
  async listAdminRequests(): Promise<AdminRequestRecord[]> {
    const { data, error } = await supabase
      .from("admin_requests")
      .select(`*, profiles!admin_id ( full_name )`)
      .order("created_at", { ascending: false });
    if (error) throw new AppError(error.message, "ADMIN_REQUESTS_LIST_FAILED", error);
    return ((data as any[]) ?? []).map(toAdminRequest);
  },

  async listGovernmentRequests(): Promise<GovernmentRequestRecord[]> {
    const { data, error } = await supabase
      .from("government_requests")
      .select(`*, profiles!target_user_id ( full_name )`)
      .order("created_at", { ascending: false });
    if (error) throw new AppError(error.message, "GOVERNMENT_REQUESTS_LIST_FAILED", error);
    return ((data as any[]) ?? []).map(toGovernmentRequest);
  },

  async reviewAdminRequest(
    requestId: string,
    action: "approve" | "reject",
    reviewedBy: string,
    currentStatus: string
  ): Promise<void> {
    if (currentStatus !== "pending") {
      throw new DomainError(
        "Only pending admin requests can be approved or rejected",
        "INVALID_REQUEST_TRANSITION"
      );
    }

    const { error } = await supabase
      .from("admin_requests")
      .update({
        status: action === "approve" ? "approved" : "rejected",
        reviewed_by: reviewedBy,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", requestId);

    if (error) throw new AppError(error.message, "ADMIN_REQUEST_UPDATE_FAILED", error);
  },

  async reviewGovernmentRequest(
    requestId: string,
    action: "approve" | "reject",
    handledBy: string,
    currentStatus: string
  ): Promise<void> {
    if (currentStatus !== "pending") {
      throw new DomainError(
        "Only pending government requests can be approved or rejected",
        "INVALID_REQUEST_TRANSITION"
      );
    }

    const { error } = await supabase
      .from("government_requests")
      .update({
        status: action === "approve" ? "approved" : "rejected",
        handled_by: handledBy,
        handled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", requestId);

    if (error) throw new AppError(error.message, "GOVERNMENT_REQUEST_UPDATE_FAILED", error);
  },
};
