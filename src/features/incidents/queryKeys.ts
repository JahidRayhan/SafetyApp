export const incidentsQueryKeys = {
  all: ["incident-reports"] as const,
  list: (filter?: string) =>
    [...incidentsQueryKeys.all, "list", filter ?? "all"] as const,
};
