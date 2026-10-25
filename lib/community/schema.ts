import { z } from "zod";

export const communitySchema = z.object({
  kind: z.enum(["register", "incident", "whistleblower", "donation"]),
  name: z.string().trim().max(120), email: z.string().trim().max(254).refine(v => !v || z.email().safeParse(v).success, "Enter a valid email address."),
  phone: z.string().trim().max(40), area: z.string().trim().max(120),
  message: z.string().trim().min(20, "Please give at least 20 characters of detail.").max(2800),
  anonymous: z.boolean(), consent: z.literal("yes", { error: "Please confirm how your submission will be used." }),
  interest: z.string().trim().max(120), fulfilment: z.enum(["", "collection", "drop-off", "discuss"]),
  address: z.string().trim().max(160), town: z.string().trim().max(80), postcode: z.string().trim().max(9),
  incidentCategory: z.enum(["", "noise", "waste", "parking", "property_condition", "fire_safety", "overcrowding", "antisocial", "harassment", "violence", "other"]),
  occurredOn: z.string().max(10).refine(v => !v || (/^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v)) && v <= new Date().toISOString().slice(0, 10)), "Choose a valid date that is not in the future."),
}).superRefine((data, ctx) => {
  if (data.kind === "register" || data.kind === "donation") {
    if (!data.name) ctx.addIssue({ code: "custom", path: ["name"], message: "Please enter your name." });
    if (!data.email) ctx.addIssue({ code: "custom", path: ["email"], message: "Please enter an email so the team can reply." });
    if (!data.area) ctx.addIssue({ code: "custom", path: ["area"], message: "Please enter your town or postcode area." });
  }
  if (data.kind === "donation" && !data.fulfilment) ctx.addIssue({ code: "custom", path: ["fulfilment"], message: "Choose collection, drop-off or discuss arrangements." });
  if (data.kind === "register" && !data.interest) ctx.addIssue({ code: "custom", path: ["interest"], message: "Choose how you would like to get involved." });
  if (data.kind === "incident") {
    if (data.address.length < 3 || data.town.length < 2 || !/^[A-Z0-9 ]{5,9}$/i.test(data.postcode)) ctx.addIssue({ code: "custom", path: ["address"], message: "Enter the incident's street, town and UK postcode." });
    if (!data.incidentCategory) ctx.addIssue({ code: "custom", path: ["incidentCategory"], message: "Choose the type of incident." });
  }
  if ((data.kind === "whistleblower" || data.kind === "incident") && !data.anonymous && !data.email) ctx.addIssue({ code: "custom", path: ["email"], message: "Enter an email for a reply, or submit without contact details." });
}).transform(data => {
  const anonymous = (data.kind === "incident" || data.kind === "whistleblower") && data.anonymous;
  return { ...data, anonymous, name: anonymous ? "" : data.name, email: anonymous ? "" : data.email, phone: anonymous ? "" : data.phone,
    area: data.kind === "register" || data.kind === "donation" ? data.area : "",
    interest: data.kind === "register" ? data.interest : "",
    fulfilment: data.kind === "donation" ? data.fulfilment : "" as const };
});
export type CommunityData = z.infer<typeof communitySchema>;
