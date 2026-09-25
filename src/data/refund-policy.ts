export const refundPolicy = {
  name: "Standard refund policy",
  version: "2026.1",
  rules: [
    { id: "window", title: "30-day return window", detail: "Request must be made within 30 calendar days of delivery." },
    { id: "delivered", title: "Delivered orders only", detail: "Only orders with delivered status can be refunded through this workflow." },
    { id: "eligible-product", title: "Eligible products", detail: "Digital products, gift cards, personalized products, and final-sale items are non-refundable." },
    { id: "condition", title: "Product condition", detail: "Items must be unused and resellable, except eligible defective-product claims." },
    { id: "single-refund", title: "One refund per order", detail: "An order that has already been refunded cannot be refunded again." },
    { id: "ownership", title: "Order ownership", detail: "The order must belong to the selected customer account." },
    { id: "threshold", title: "Manual review threshold", detail: "Refunds over $250 require manual review." },
    { id: "risk", title: "Account risk review", detail: "High-risk accounts or accounts with 4+ previous refunds are escalated." },
  ],
} as const;
