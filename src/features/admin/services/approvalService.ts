import { supabase } from "@/core/database/client";
import { AppError, DomainError } from "@/shared/errors";
import { asIso, asUuid } from "@/shared/types";
import type { AdminApprovalRequest, ApprovalRole } from "../domain/types";

interface ApprovalRow {
  id: string;
  user_id: string;
  requested_role: ApprovalRole;
  status: string;
  requested_by_email: string;
  approved_by: string | null;
  approved_at: string | null;
  rejection_reason: string | null;
  created_at: string;
}

const toDomain = (row: ApprovalRow): AdminApprovalRequest => ({
  id: asUuid(row.id),
  userId: asUuid(row.user_id),
  requestedRole: row.requested_role,
  status: row.status as AdminApprovalRequest["status"],
  requestedByEmail: row.requested_by_email,
  approvedBy: row.approved_by ? asUuid(row.approved_by) : null,
  approvedAt: row.approved_at ? asIso(row.approved_at) : null,
  rejectionReason: row.rejection_reason,
  createdAt: asIso(row.created_at),
});

export const approvalService = {
  async list(): Promise<AdminApprovalRequest[]> {
    const { data, error } = await supabase.rpc("get_admin_approvals_list" as any);
    if (error) throw new AppError(error.message, "APPROVALS_LIST_FAILED", error);
    return ((data as ApprovalRow[]) ?? []).map(toDomain);
  },

  async handle(
    approvalId: string,
    action: "approve" | "reject",
    approvedById: string,
    currentStatus: string,
    rejectionReason?: string
  ): Promise<void> {
    if (currentStatus !== "pending") {
      throw new DomainError(
        "Only pending approval requests can be approved or rejected",
        "INVALID_APPROVAL_TRANSITION"
      );
    }

    const { error } = await supabase.rpc("handle_admin_approval" as any, {
      approval_id: approvalId,
      action,
      approved_by_id: approvedById,
      rejection_reason: rejectionReason || null,
    });

    if (error) throw new AppError(error.message, "APPROVAL_UPDATE_FAILED", error);
  },
};
