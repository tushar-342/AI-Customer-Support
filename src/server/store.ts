import { customers } from "@/data/customers";
import { orders } from "@/data/orders";
import type { Conversation, RefundRecord } from "@/data/types";

const runtime = globalThis as typeof globalThis & { refundStore?: RefundRecord[]; conversationStore?: Conversation[] };
export const refunds = runtime.refundStore ?? (runtime.refundStore = []);
export const conversations = runtime.conversationStore ?? (runtime.conversationStore = []);

export function getCustomer(customerId: string) { return customers.find((customer) => customer.customerId === customerId); }
export function getOrder(orderId: string) { return orders.find((order) => order.orderId.toUpperCase() === orderId.toUpperCase()); }
export function getCustomerOrders(customerId: string) { return orders.filter((order) => order.customerId === customerId); }
