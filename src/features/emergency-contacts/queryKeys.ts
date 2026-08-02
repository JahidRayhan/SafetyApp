export const contactsQueryKeys = {
  all: ["emergency-contacts"] as const,
  list: () => [...contactsQueryKeys.all, "list"] as const,
};
