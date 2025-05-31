// types/roles.ts
export const knownRoles = [
  'admin',
  'teacher',
  'student',
  'librarian',
  'medical',
  'academics',
] as const;

// Infer literal union from the array
export type KnownUserRoles = (typeof knownRoles)[number];

// Allow any string role in addition to the known ones
export type UserRole = KnownUserRoles | (string & {});
