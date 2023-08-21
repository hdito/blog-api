export const supportedRoles = ["admin", "author", "user"] as const;

export type SupportedRole = (typeof supportedRoles)[number];
