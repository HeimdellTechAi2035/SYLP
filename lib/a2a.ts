import { absUrl, siteUrl, SITE_NAME, LEGAL_NAME } from "@/lib/seo/site";

/** The A2A Agent Card describing this shop's agent (served at /.well-known/agent-card.json). */
export function agentCard() {
  return {
    protocolVersion: "0.3.0",
    name: `${SITE_NAME} Shop Assistant`,
    description:
      "Answers questions about Support Your Local Patriot (SYLP) merch: products, prices, sizes, availability, delivery, returns, FAQs and order status. Read-only; purchases are completed by the customer on the website.",
    url: `${siteUrl()}/api/a2a`,
    preferredTransport: "JSONRPC",
    version: "1.0.0",
    provider: { organization: `${SITE_NAME} (${LEGAL_NAME})`, url: siteUrl() },
    iconUrl: absUrl("/brand/icon-192.png"),
    documentationUrl: `${siteUrl()}/llms.txt`,
    capabilities: { streaming: false, pushNotifications: false, stateTransitionHistory: false },
    defaultInputModes: ["text/plain", "application/json"],
    defaultOutputModes: ["text/plain", "application/json"],
    skills: [
      {
        id: "product-search",
        name: "Find products",
        description: "Find products by division, type or keyword. Returns names, prices in GBP, sizes, availability and links.",
        tags: ["shopping", "catalogue", "merch", "hoodies", "t-shirts"],
        examples: ["Preston Patriots hoodie", "What does Southport sell?", "How much is the Merseyside mug?"],
      },
      {
        id: "divisions",
        name: "Divisions",
        description: "List the Support Your Local Patriot divisions and link to each one's range.",
        tags: ["divisions", "north west"],
        examples: ["Which divisions do you have?"],
      },
      {
        id: "store-info",
        name: "Delivery, returns and FAQs",
        description: "Delivery prices and times, free delivery threshold, returns, sizing and care.",
        tags: ["delivery", "returns", "faq", "sizing"],
        examples: ["How much is delivery?", "Can I return my order?", "What size should I order?"],
      },
      {
        id: "order-status",
        name: "Order status",
        description:
          "Check an order's status. Send a data part {\"orderNumber\": \"...\", \"email\": \"...\"} together with the question; both must match the order.",
        tags: ["orders", "tracking"],
        examples: ["Where is my order?"],
      },
    ],
  };
}
