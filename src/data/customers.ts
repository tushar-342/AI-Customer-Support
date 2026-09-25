import type { Customer } from "./types";

export const customers: Customer[] = [
  ["CUS-1001", "Olivia Bennett", "olivia.bennett@example.com", "Silver", 12, 1840, 1, "low"],
  ["CUS-1002", "Noah Williams", "noah.williams@example.com", "Gold", 24, 4260, 0, "low"],
  ["CUS-1003", "Emma Chen", "emma.chen@example.com", "Platinum", 38, 8920, 2, "low"],
  ["CUS-1004", "Liam Patel", "liam.patel@example.com", "Member", 4, 390, 0, "low"],
  ["CUS-1005", "Ava Thompson", "ava.thompson@example.com", "Gold", 21, 3150, 5, "high"],
  ["CUS-1006", "Ethan Rivera", "ethan.rivera@example.com", "Silver", 9, 1220, 1, "low"],
  ["CUS-1007", "Sophia Kim", "sophia.kim@example.com", "Platinum", 47, 11080, 3, "medium"],
  ["CUS-1008", "Mason Garcia", "mason.garcia@example.com", "Member", 3, 245, 0, "low"],
  ["CUS-1009", "Isabella Moore", "isabella.moore@example.com", "Silver", 15, 2075, 2, "low"],
  ["CUS-1010", "Lucas Anderson", "lucas.anderson@example.com", "Gold", 27, 5080, 1, "low"],
  ["CUS-1011", "Mia Wilson", "mia.wilson@example.com", "Member", 6, 710, 4, "high"],
  ["CUS-1012", "James Taylor", "james.taylor@example.com", "Silver", 11, 1490, 1, "low"],
  ["CUS-1013", "Amelia Davis", "amelia.davis@example.com", "Gold", 19, 3720, 2, "medium"],
  ["CUS-1014", "Benjamin Lee", "benjamin.lee@example.com", "Member", 5, 560, 0, "low"],
  ["CUS-1015", "Charlotte Martin", "charlotte.martin@example.com", "Platinum", 52, 13400, 2, "low"],
].map(([customerId, name, email, loyaltyTier, totalOrders, totalSpent, refundHistory, riskLevel], i) => ({
  customerId: String(customerId), name: String(name), email: String(email),
  phone: `+1 (555) 01${String(i + 1).padStart(2, "0")}-${String(1000 + i).slice(-4)}`,
  accountCreatedAt: new Date(Date.UTC(2020 + (i % 5), i % 12, 5 + i)).toISOString().slice(0, 10),
  loyaltyTier: loyaltyTier as Customer["loyaltyTier"], totalOrders: Number(totalOrders), totalSpent: Number(totalSpent),
  refundHistory: Number(refundHistory), riskLevel: riskLevel as Customer["riskLevel"],
}));
