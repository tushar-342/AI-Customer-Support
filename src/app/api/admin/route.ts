import { NextResponse } from "next/server";
import { customers } from "@/data/customers";
import { orders } from "@/data/orders";
import { conversations, refunds } from "@/server/store";

export async function GET() {
  const approved = conversations.filter((item) => item.decision === "approved");
  return NextResponse.json({ customers, orders, conversations, refunds, metrics: {
    totalConversations: conversations.length,
    refundRequests: conversations.filter((item) => item.orderId && /refund|return|money back/i.test(item.message)).length,
    approved: approved.length,
    denied: conversations.filter((item) => item.decision === "denied").length,
    escalated: conversations.filter((item) => item.decision === "escalated").length,
    totalRefundAmount: refunds.reduce((sum, refund) => sum + refund.amount, 0),
  } });
}
