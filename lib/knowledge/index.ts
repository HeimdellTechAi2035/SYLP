// Central server-side knowledge service. Every function here reads live
// application data at call time (no separate copy, no manual sync step) —
// an admin save is immediately reflected the next time any of these run.
// Reused by: the chatbot (lib/knowledge/chat.ts), and designed to be reused
// later by site search, an FAQ page, or a controlled /api/knowledge route.
export { getProductKnowledge, getProductKnowledgeBySlug, type PublicProductKnowledge } from "@/lib/knowledge/products";
export { getFaqKnowledge, type FaqKnowledge } from "@/lib/knowledge/faq";
export { getDeliveryKnowledge, type DeliveryKnowledge } from "@/lib/knowledge/delivery";
export { getPolicyKnowledge, getPolicyKnowledgeBySlug, type PolicyKnowledge } from "@/lib/knowledge/policy";
export { getStoreKnowledge, type StoreKnowledge } from "@/lib/knowledge/store";
export { searchKnowledge, type KnowledgeSearchResult } from "@/lib/knowledge/search";
export { getOrderKnowledgeForCustomer, getOrderKnowledgeForGuest, type OrderKnowledge } from "@/lib/knowledge/orders";
export { askChatbot, type ChatContext, type ChatResponse, type ChatLink } from "@/lib/knowledge/chat";
