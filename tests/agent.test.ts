import assert from "node:assert/strict";
import test from "node:test";
import { customers } from "@/data/customers";
import { orders } from "@/data/orders";
import { refundPolicy } from "@/data/refund-policy";
import { refundConfig } from "@/data/refund-config";
import { amountFor, handleChat, processRefund, validateEligibility } from "@/server/agent";
import { refunds } from "@/server/store";

const order = (id: string) => orders.find((item) => item.orderId === id)!;
const fixedToday = new Date();

test("seed data contains at least 15 distinct customer profiles and policy rules", () => {
  assert.ok(customers.length >= 15);
  assert.equal(new Set(customers.map((item) => item.customerId)).size, customers.length);
  assert.ok(refundPolicy.rules.length >= 8);
});

test("eligible order passes deterministic policy checks", () => {
  assert.deepEqual(validateEligibility(order("ORD-1001"), "CUS-1001", fixedToday), []);
});

test("eligible refund request is approved and processed", async () => {
  const result = await handleChat({ customerId: "CUS-1001", message: "I want a refund for order ORD-1001" });
  assert.equal(result.decision, "approved");
  assert.equal(result.amount, 129.99);
  assert.ok(result.events.some((item) => item.title === "Refund processed"));
});

test("outside-window order is denied", async () => {
  assert.match(validateEligibility(order("ORD-1010"), "CUS-1010", fixedToday)[0], /30-day return window/);
  const result = await handleChat({ customerId: "CUS-1010", message: "I need a refund for ORD-1010" });
  assert.equal(result.decision, "denied");
  assert.match(result.response, /30-day return window/);
});

test("non-refundable product is denied", () => {
  assert.match(validateEligibility(order("ORD-1004"), "CUS-1004", fixedToday)[0], /excluded from refunds/);
});

test("already-refunded order is denied", () => {
  assert.match(validateEligibility(order("ORD-1006"), "CUS-1006", fixedToday)[0], /already been processed/);
});

test("invalid order returns a safe not-found result", async () => {
  const result = await handleChat({ customerId: "CUS-1001", message: "Refund ORD-9999 please" });
  assert.equal(result.decision, "error");
  assert.match(result.response, /couldn't find ORD-9999/);
});

test("high refund activity escalates instead of automatic approval", async () => {
  const result = await handleChat({ customerId: "CUS-1005", message: "Please refund ORD-1016" });
  assert.equal(result.decision, "escalated");
  assert.equal(result.amount, undefined);
});

test("refund processing is idempotent", () => {
  const candidate = order("ORD-1014");
  const first = processRefund(candidate, candidate.customerId);
  const second = processRefund(candidate, candidate.customerId);
  assert.equal(first.success, true);
  assert.deepEqual(second, { success: false, reason: "REFUND_ALREADY_PROCESSED" });
  assert.equal(refunds.filter((refund) => refund.orderId === candidate.orderId).length, 1);
});

test("refund service refuses policy-ineligible orders even if called directly", () => {
  const result = processRefund(order("ORD-1010"), "CUS-1010");
  assert.deepEqual(result, { success: false, reason: "POLICY_NOT_ELIGIBLE" });
});

test("refund amount uses cents precision", () => {
  assert.equal(amountFor(order("ORD-1001")), 129.99);
});

test("orders cannot be checked under another customer account", () => {
  assert.match(validateEligibility(order("ORD-1001"), "CUS-1002", fixedToday)[0], /not associated/);
});

test("policy constants centralize window and review thresholds", () => {
  assert.equal(refundConfig.returnWindowDays, 30);
  assert.equal(refundConfig.manualReviewThreshold, 250);
  assert.ok(refundPolicy.rules.some((rule) => rule.id === "window"));
});
