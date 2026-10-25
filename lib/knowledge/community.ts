import { communityPages } from "@/lib/community/config";
import type { ChatResponse } from "@/lib/knowledge/chat";
import type { StoreKnowledge } from "@/lib/knowledge/store";

export const SUPPORT_URL = "https://buymeacoffee.com/sylp";
const link = (kind: keyof typeof communityPages) => ({ label: communityPages[kind].title, href: communityPages[kind].href });
const privacy = { label: "Community privacy", href: "/community/privacy" };
const answer = (text: string, links: ChatResponse["links"]): ChatResponse => ({ text, links, resolved: true });

/** Public, owner-approved information only. Never reads submissions or case files. */
export function answerCommunityQuestion(message: string, store: StoreKnowledge): ChatResponse | null {
  if (/\b(999|emergency|immediate danger|happening right now|being attacked)\b/.test(message)) {
    return answer("If someone is in immediate danger, call 999. SYLP's forms and chatbot are not emergency services and are not monitored around the clock.", [link("incident")]);
  }
  if (/\b(my|someone'?s|another|all|show|read|list|give)\b.*\b(incident reports?|whistleblow(?:er|ing)? (reports?|submissions?)|reporter details|private submissions?|case files?)\b|\b(status|track|reference)\b.*\b(report|case|submission)\b|\b(report|case|submission)\b.*\b(status|track|reference|SYLP-)\b/i.test(message)) {
    return answer("I cannot access private submissions, evidence, reporter identities or case progress. Keep your SYLP reference and contact the team through the contact page. Please do not paste confidential case details into this chat.", [{ label: "Contact the team", href: "/contact" }, privacy]);
  }
  if (/\b(charity|charitable|gift aid|tax deductible|percentage|percent|all (the )?(money|proceeds)|where.*(money|donations?).*go|how.*(money|donations?).*used)\b/.test(message)) {
    return answer("SYLP is operated by Heimdell Tech Ai Ltd. Voluntary support helps cover research, filming, travel and website running costs, alongside the community work described on the site. I do not have a confirmed fixed percentage allocation or a Gift Aid/tax-deductibility claim. Contact the team for a specific funding question.", [{ label: "Support our work", href: SUPPORT_URL }, { label: "Contact us", href: "/contact" }]);
  }
  if (/\b(whistle\s?blow(?:er|ers|ing)?|confidential|anonymous|anonymity|untraceable|encrypted|private information|share (some )?information|send (a )?tip)\b/.test(message)) {
    return answer(`${communityPages.whistleblower.intro} Incident reports can also be submitted without contact details. Submissions are reviewed privately and are not automatically published. This is not an untraceable or end-to-end encrypted channel; hosting services may process technical records, and your message or files can identify you. Use the dedicated form rather than this chat. Without contact details the team cannot reply.`, [link("whistleblower"), link("incident"), privacy]);
  }
  if (/\b(homeless(?:ness)?|sleeping bags?|tents?|warm cloth(?:es|ing)|rough sleep(?:ers|ing)|collection|collect (my|our|the|some)|drop[ -]?off|donate (items|clothes|clothing|bedding|a hoodie|a t[ -]?shirt|a tent|a sleeping bag))\b/.test(message)) {
    return answer(`${communityPages.donation.intro} Use Help the Homeless to offer items and request collection, drop-off or a discussion. Arrangements must be confirmed by the team first; do not travel or leave items without confirmation. I do not have a public drop-off address or guaranteed collection time.`, [link("donation")]);
  }
  if ((!/\b(hoodies?|t[ -]?shirts?|merchandise)\b/.test(message) || /\b(incident|hmo)\b/.test(message)) && /\b(incident|hmos?|antisocial|anti-social|noise|overcrowd(?:ing|ed)|fire safety|harassment|rubbish|report (a |an |something|concern|problem)|local concern|upload|photos?|videos?|evidence)\b/.test(message)) {
    return answer(`${communityPages.incident.intro} Fill in the incident form on SYLP; you stay on this site while it sends the report to our review service. You can upload up to 3 JPG, PNG, WebP, MP4 or WebM files, no more than 6 MB combined. Evidence stays in SYLP's private inbox; the review service receives its case reference. Keep the reference shown after submitting. A checked report may lead to a reviewer-written public summary; your original report and contact details are not automatically published. Use the dedicated form, not this chat.`, [link("incident"), privacy]);
  }
  if (/\b(volunteer(?:ing)?|join|register|registration|membership|get involved|help out|offer (my|our) skills|become a member)\b/.test(message)) {
    return answer(`${communityPages.register.intro} You can volunteer, join community activities, help with donations or offer your skills. This is a request to get involved, not automatic membership or approval, and it does not subscribe you to marketing.`, [link("register")]);
  }
  if (/\b(donat(?:e|ion|ions)|buy ?me ?a ?coffee|buy (you|us) (a )?coffee|coffee|support (you|us|your work|the cause)|contribut(?:e|ion)|fundrais(?:e|ing))\b/.test(message)) {
    return answer("You can support Support Your Local Patriot through our Buy Me a Coffee page. Contributions help keep our research, filming, travel and website running. For sleeping bags, tents and warm clothing, use Help the Homeless to arrange an offer with the team.", [{ label: "Buy us a coffee", href: SUPPORT_URL }, link("donation")]);
  }
  if (/\b(contact|email|phone|speak to|talk to (a |the )?(person|team|human)|customer service|human help)\b/.test(message)) {
    return answer(`Contact the team through Contact Us${store.supportEmail ? ` or email ${store.supportEmail}` : ""}${store.supportPhone ? `. The public contact number is ${store.supportPhone}` : ""}. Please use the dedicated reporting forms for sensitive information.`, [{ label: "Contact us", href: "/contact" }]);
  }
  if (/\b(where.*(based|located)|address|location|preston area)\b/.test(message)) {
    return answer("We are based in the Preston area. We do not publish a home address or a public walk-in/drop-off location. Contact the team to agree any arrangements.", [{ label: "Contact us", href: "/contact" }, link("donation")]);
  }
  if (/\b(log ?in|sign ?in|account|password|guest checkout)\b/.test(message)) {
    return answer("You do not need a customer login to use the community forms. You can use the shop and Track My Order without signing in; tracking needs your order number and checkout email. Admin access is separate and restricted to authorised staff.", [{ label: "Shop", href: "/shop" }, { label: "Track my order", href: "/track-order" }, { label: "Get involved", href: "/register-with-us" }]);
  }
  if (/\b(newsletter|mailing list|subscribe|updates)\b/.test(message)) {
    return answer("You can join the mailing list using the email form in the website footer for designs, drops and offers. Register With Us is a separate community involvement form and does not sign you up for marketing.", [{ label: "Website and newsletter", href: "/" }, link("register")]);
  }
  if (/\b(stripe|pay(?:ment|ments)?|credit card|debit card|secure checkout)\b/.test(message)) {
    return answer("Merchandise payments go through Stripe checkout. Your order total includes postage before payment, with the current delivery charge and any free-postage offer shown at checkout. The separate Buy Me a Coffee link is for voluntary support, not payment for merchandise. Never send card details in chat.", [{ label: "Your basket", href: "/cart" }, { label: "Support our work", href: SUPPORT_URL }]);
  }
  if (/\b(who are you|what (do you do|is sylp|is support your local patriot)|your cause|your mission|what.*stand for|what.*all about|about (sylp|you|us)|community|forms|investigat(?:e|ion|ions|ing)|documentar(?:y|ies)|research|filming|local people|heimdell|run this|runs this)\b/.test(message)) {
    return answer("Support Your Local Patriot (SYLP) brings local people together through community action and independent reporting. We raise awareness of local issues, review concerns shared by the public and help organise practical support for people experiencing homelessness. You can register to get involved, report an incident, share whistleblower information, offer useful items or support the work financially. We also sell SYLP merchandise. The site is operated by Heimdell Tech Ai Ltd. Reports are checked before any public summary; I cannot confirm allegations or promise an investigation outcome.", [{ label: "Our community work", href: "/#community" }, link("register"), link("incident"), link("donation"), { label: "Shop merchandise", href: "/shop" }, { label: "Support our work", href: SUPPORT_URL }]);
  }
  if (/^(hi|hello|hey|help|help me|what can you (do|help with))[!?.\s]*$/.test(message)) {
    return answer("Hello! I can help with SYLP's cause, merchandise, delivery, returns, volunteering, incident reporting, whistleblower information, homeless donations and financial support. What would you like to know?", [{ label: "Shop", href: "/shop" }, { label: "Community", href: "/#community" }, { label: "Support our work", href: SUPPORT_URL }]);
  }
  return null;
}
