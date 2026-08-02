import { supabase } from "@/core/database/client";
import { AppError, DomainError } from "@/shared/errors";
import type { CreateSafeZoneInput } from "../domain/types";

export const governmentRequestService = {
  /**
   * Approving a zone request creates an active safe zone.
   * Mirrors the existing behavior of GovernmentRequests.tsx.
   */
  async approveZoneRequest(input: CreateSafeZoneInput, currentStatus: string): Promise<void> {
    if (currentStatus !== "pending") {
      throw new DomainError(
        "Only pending zone requests can be approved or rejected",
        "INVALID_ZONE_REQUEST_TRANSITION"
      );
    }

    const { error } = await supabase.from("safe_zones").insert({
      name: input.name,
      description: input.description,
      center_lat: input.centerLat,
      center_lng: input.centerLng,
      radius_meters: input.radiusMeters,
      zone_type: input.zoneType,
      created_by: input.createdBy,
      is_active: true,
    });

    if (error) throw new AppError(error.message, "ZONE_REQUEST_APPROVE_FAILED", error);
  },

  validateStatusTransition(currentStatus: string): void {
    if (currentStatus !== "pending") {
      throw new DomainError(
        "Only pending requests can be approved or rejected",
        "INVALID_REQUEST_TRANSITION"
      );
    }
  },
};
