export type LoyaltyTier = "Member" | "Silver" | "Gold" | "Platinum";
export type RiskLevel = "low" | "medium" | "high";
export type OrderStatus = "delivered" | "shipped" | "cancelled";
export type RefundStatus = "none" | "processed" | "pending";

export interface Customer {
  customerId: string; name: string; email: string; phone: string; accountCreatedAt: string;
  loyaltyTier: LoyaltyTier; totalOrders: number; totalSpent: number; refundHistory: number; riskLevel: RiskLevel;
}
export interface Order {
  orderId: string; customerId: string; productName: string; productCategory: string; orderDate: string;
  deliveryDate: string | null; amount: number; paymentMethod: string; orderStatus: OrderStatus;
  returnWindow: number; refundStatus: RefundStatus; returnReason: string; itemCondition: string;
  refundable: boolean;
}
export type Decision = "approved" | "denied" | "escalated" | "info" | "error";
export interface AgentEvent { id: string; at: string; title: string; detail?: string; status: "success" | "failure" | "pending" | "info"; }
export interface Conversation {
  id: string; customerId: string; customerName: string; message: string; response: string;
  orderId?: string; decision: Decision; amount?: number; createdAt: string; events: AgentEvent[];
}
export interface RefundRecord { orderId: string; customerId: string; amount: number; processedAt: string; }
