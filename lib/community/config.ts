export const communityPages = {
  register: { href: "/register-with-us", title: "Register With Us", action: "Get involved", description: "Join in, volunteer your skills and help with local community projects.", intro: "Tell us how you would like to get involved. This is a registration request; the team will contact you about the next steps." },
  incident: { href: "/report-an-incident", title: "Report an Incident", action: "Make a report", description: "Share a local concern directly with the incident review team, without leaving SYLP.", intro: "Report what you saw or heard. Your report is sent to our incident review service for checking. Reports are not published automatically." },
  whistleblower: { href: "/whistleblower-information", title: "Whistleblower Information", action: "Share information privately", description: "Share information for review. Choose whether to leave contact details.", intro: "Use this private form to share information you believe needs looking into. Only the authorised SYLP owner can access this inbox. You can leave your identifying details blank." },
  donation: { href: "/help-the-homeless", title: "Help the Homeless", action: "Offer items", description: "Offer sleeping bags, tents or warm clothing and request collection or drop-off.", intro: "Help people experiencing homelessness in our local communities. Tell us what you can offer, its condition and quantity. The team will agree arrangements with you before any collection or drop-off." },
} as const;
export type CommunityKind = keyof typeof communityPages;
export const COMMUNITY_PREFIX = "Community: ";
export const incidentCategories = {
  noise: "Noise", waste: "Rubbish / waste", parking: "Parking", property_condition: "Property condition",
  fire_safety: "Fire safety", overcrowding: "Overcrowding", antisocial: "Antisocial behaviour",
  harassment: "Harassment", violence: "Violence or threats", other: "Other",
} as const;
export function isCommunityPath(path: string) {
  return Object.values(communityPages).some(p => path === p.href) || path.startsWith("/community/");
}
