export const communityInboxes = {
  register: "Registrations",
  incident: "Incident Reports",
  whistleblower: "Whistleblower Information",
  donation: "Homeless Donations",
} as const;
export type CommunityInboxKind = keyof typeof communityInboxes;
export function isCommunityInboxKind(value: string): value is CommunityInboxKind {
  return Object.prototype.hasOwnProperty.call(communityInboxes, value);
}
