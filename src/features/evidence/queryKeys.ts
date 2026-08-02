export const evidenceQueryKeys = {
  all: ["evidence"] as const,
  forIncident: (incidentId: string) =>
    [...evidenceQueryKeys.all, "incident", incidentId] as const,
};
