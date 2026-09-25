import type { Order } from "./types";
import { refundConfig } from "./refund-config";

const base = [
  ["ORD-1001", "CUS-1001", "Everyday Carry Backpack", "Accessories", "2026-09-02", 129.99, "Visa ···· 4242", "delivered", "none", "Changed my mind", "Unused, original packaging", true],
  ["ORD-1002", "CUS-1002", "Ceramic Pour-over Set", "Home", "2026-09-05", 68.5, "Mastercard ···· 8102", "delivered", "none", "Arrived damaged", "Defective", true],
  ["ORD-1003", "CUS-1003", "Noise-cancelling Headphones", "Electronics", "2026-08-20", 249, "Visa ···· 1188", "delivered", "none", "Not as expected", "Unused", true],
  ["ORD-1004", "CUS-1004", "Digital Recipe Collection", "Digital", "2026-09-15", 24, "Amex ···· 9921", "delivered", "none", "Purchased by mistake", "Not applicable", false],
  ["ORD-1005", "CUS-1005", "Personalized Leather Journal", "Personalized", "2026-09-10", 74, "Visa ···· 7001", "delivered", "none", "No longer needed", "Unused", false],
  ["ORD-1006", "CUS-1006", "Linen Duvet Cover", "Home", "2026-09-01", 159, "Visa ···· 3170", "delivered", "processed", "Color did not match", "Unused", true],
  ["ORD-1007", "CUS-1007", "Trail Running Shoes", "Footwear", "2026-09-16", 118, "PayPal", "shipped", "none", "Wrong size", "Unopened", true],
  ["ORD-1008", "CUS-1008", "Insulated Water Bottle", "Outdoor", "2026-09-17", 38, "Visa ···· 2400", "cancelled", "none", "Order cancelled", "Unopened", true],
  ["ORD-1009", "CUS-1009", "Gift Card · $100", "Gift card", "2026-09-12", 100, "Mastercard ···· 4003", "delivered", "none", "Unused gift card", "Not applicable", false],
  ["ORD-1010", "CUS-1010", "Wool Blend Coat", "Apparel", "2026-08-01", 320, "Visa ···· 5562", "delivered", "none", "Changed my mind", "Unused, original packaging", true],
  ["ORD-1011", "CUS-1011", "At-home Skincare Set", "Beauty", "2026-09-10", 89, "Visa ···· 7810", "delivered", "none", "Skin sensitivity", "Opened and used", true],
  ["ORD-1012", "CUS-1012", "Wireless Charging Stand", "Electronics", "2026-09-04", 54.99, "Amex ···· 0192", "delivered", "none", "Defective on arrival", "Defective", true],
  ["ORD-1013", "CUS-1013", "Limited Edition Print", "Final sale", "2026-09-14", 145, "Visa ···· 8194", "delivered", "none", "Changed my mind", "Unused", false],
  ["ORD-1014", "CUS-1014", "Cotton Weekend Tote", "Accessories", "2026-09-08", 42, "Mastercard ···· 2018", "delivered", "none", "Strap is damaged", "Defective", true],
  ["ORD-1015", "CUS-1015", "Bluetooth Speaker", "Electronics", "2026-09-11", 179, "Visa ···· 1411", "delivered", "none", "No longer needed", "Unused", true],
  ["ORD-1016", "CUS-1005", "Cotton Bath Towel Set", "Home", "2026-09-06", 62, "Visa ···· 7001", "delivered", "none", "Do not need", "Unused", true],
  ["ORD-1017", "CUS-1011", "Seasonal Candle Trio", "Home", "2026-08-28", 48, "Visa ···· 7810", "delivered", "none", "Scent not suitable", "Unused", true],
  ["ORD-1018", "CUS-1002", "Bamboo Cutting Board", "Home", "2026-09-18", 44, "Mastercard ···· 8102", "delivered", "none", "Arrived cracked", "Defective", true],
  ["ORD-1019", "CUS-1003", "Monthly Wellness Membership", "Digital", "2026-09-01", 19.99, "Visa ···· 1188", "delivered", "none", "Cancelled subscription", "Not applicable", false],
  ["ORD-1020", "CUS-1015", "Travel Organizer Set", "Accessories", "2026-09-19", 76, "Visa ···· 1411", "shipped", "none", "Changed my mind", "Unopened", true],
];

export const orders: Order[] = base.map(([orderId, customerId, productName, productCategory, orderDate, amount, paymentMethod, orderStatus, refundStatus, returnReason, itemCondition, refundable], i) => {
  const demoDate = new Date();
  if (i === 0) demoDate.setUTCDate(demoDate.getUTCDate() - 5);
  if (i === 9) demoDate.setUTCDate(demoDate.getUTCDate() - 53);
  const demoOrderDate = new Date();
  if (i === 0) demoOrderDate.setUTCDate(demoOrderDate.getUTCDate() - 8);
  if (i === 9) demoOrderDate.setUTCDate(demoOrderDate.getUTCDate() - 60);
  const deliveryDate = orderStatus === "delivered" ? (i === 0 || i === 9 ? demoDate.toISOString().slice(0, 10) : new Date(Date.UTC(2026, 8, [20, 21, 20, 22, 22, 5, 21, 18, 24, 3, 23, 20, 23, 22, 24, 19, 10, 24, 20, 24][i])).toISOString().slice(0, 10)) : null;
  const normalizedOrderDate = i === 0 || i === 9 ? demoOrderDate.toISOString().slice(0, 10) : String(orderDate);
  return { orderId: String(orderId), customerId: String(customerId), productName: String(productName), productCategory: String(productCategory), orderDate: normalizedOrderDate, deliveryDate, amount: Number(amount), paymentMethod: String(paymentMethod), orderStatus: orderStatus as Order["orderStatus"], returnWindow: refundConfig.returnWindowDays, refundStatus: refundStatus as Order["refundStatus"], returnReason: String(returnReason), itemCondition: String(itemCondition), refundable: Boolean(refundable) };
});
