"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Activity, ArrowDownLeft, ArrowUpRight, Bot, Check, ChevronDown, CircleHelp, Clock3, Command, LayoutDashboard, LoaderCircle, MessageCircle, MoreHorizontal, Package, Plus, Search, Send, ShieldCheck, Sparkles, Users, WalletCards, X } from "lucide-react";
import type { AgentEvent, Conversation, Customer, Decision, Order, RefundRecord } from "@/data/types";

type AdminData = { customers: Customer[]; orders: Order[]; conversations: Conversation[]; refunds: RefundRecord[]; metrics: { totalConversations: number; refundRequests: number; approved: number; denied: number; escalated: number; totalRefundAmount: number } };
type ChatMessage = { id: string; role: "assistant" | "user"; text: string; decision?: Decision; orderId?: string };
const scenarios = [{ label: "Approve a refund", orderId: "ORD-1001", customerId: "CUS-1001", icon: ArrowDownLeft }, { label: "Check an order", orderId: "ORD-1002", customerId: "CUS-1002", icon: Package }, { label: "Outside return window", orderId: "ORD-1010", customerId: "CUS-1010", icon: Clock3 }];
const initialMessage: ChatMessage = { id: "welcome", role: "assistant", text: "Hi Olivia, I’m here to help with your order. I can check a return, look up an order, or explain our refund policy. What can I help you with?" };
const timeLabel = (date: string) => new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
const currency = (amount: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(amount);
function mergeAdminData(incoming: AdminData, current: AdminData | null): AdminData {
  const conversationMap = new Map((current?.conversations ?? []).map((item) => [item.id, item]));
  incoming.conversations.forEach((item) => conversationMap.set(item.id, item));
  const mergedConversations = [...conversationMap.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const refundMap = new Map((current?.refunds ?? []).map((item) => [item.orderId, item]));
  incoming.refunds.forEach((item) => refundMap.set(item.orderId, item));
  const mergedRefunds = [...refundMap.values()];
  return {
    ...incoming,
    conversations: mergedConversations,
    refunds: mergedRefunds,
    metrics: {
      totalConversations: mergedConversations.length,
      refundRequests: mergedConversations.filter((item) => item.orderId && /refund|return|money back/i.test(item.message)).length,
      approved: mergedConversations.filter((item) => item.decision === "approved").length,
      denied: mergedConversations.filter((item) => item.decision === "denied").length,
      escalated: mergedConversations.filter((item) => item.decision === "escalated").length,
      totalRefundAmount: mergedRefunds.reduce((sum, refund) => sum + refund.amount, 0),
    },
  };
}

export default function Home() {
  const [data, setData] = useState<AdminData | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState("CUS-1001");
  const [messages, setMessages] = useState<ChatMessage[]>([initialMessage]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [toast, setToast] = useState("");
  const [view, setView] = useState("Overview");

  const refresh = useCallback(async () => {
    try { const response = await fetch("/api/admin", { cache: "no-store" }); if (response.ok) { const incoming: AdminData = await response.json(); setData((current) => mergeAdminData(incoming, current)); } }
    catch { setToast("Could not refresh dashboard data."); }
  }, []);
  useEffect(() => { void refresh(); const timer = window.setInterval(() => void refresh(), 2500); return () => window.clearInterval(timer); }, [refresh]);

  const customer = useMemo(() => data?.customers.find((item) => item.customerId === selectedCustomer), [data, selectedCustomer]);
  const sendMessage = async (text = input, customerOverride?: string) => {
    const trimmed = text.trim(); if (!trimmed || loading) return;
    const requestCustomerId = customerOverride ?? selectedCustomer;
    if (customerOverride && customerOverride !== selectedCustomer) switchCustomer(customerOverride);
    setMessages((current) => [...current, { id: crypto.randomUUID(), role: "user", text: trimmed }]); setInput(""); setLoading(true);
    try {
      const response = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ customerId: requestCustomerId, message: trimmed }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "The agent could not process this request.");
      const conversation = result as Conversation; setActiveConversation(conversation);
      setData((current) => {
        if (!current) return current;
        const localRefund = conversation.decision === "approved" && conversation.orderId && conversation.amount !== undefined
          ? [{ orderId: conversation.orderId, customerId: conversation.customerId, amount: conversation.amount, processedAt: conversation.events.find((item) => item.title === "Refund processed")?.at ?? conversation.createdAt }]
          : [];
        return mergeAdminData({ ...current, conversations: [conversation, ...current.conversations], refunds: [...localRefund, ...current.refunds] }, current);
      });
      setMessages((current) => [...current, { id: conversation.id, role: "assistant", text: conversation.response, decision: conversation.decision, orderId: conversation.orderId }]);
      await refresh();
    } catch (error) {
      setMessages((current) => [...current, { id: crypto.randomUUID(), role: "assistant", text: error instanceof Error ? error.message : "Something went wrong. Please try again." }]);
    } finally { setLoading(false); }
  };
  const switchCustomer = (id: string) => { setSelectedCustomer(id); const next = data?.customers.find((item) => item.customerId === id); if (next) setMessages([{ ...initialMessage, id: crypto.randomUUID(), text: `Hi ${next.name.split(" ")[0]}, I’m here to help with your order. I can check a return, look up an order, or explain our refund policy. What can I help you with?` }]); setActiveConversation(null); };
  const newestEvents = activeConversation?.events ?? data?.conversations[0]?.events ?? [];
  const activeOrder = data?.orders.find((order) => order.orderId === activeConversation?.orderId);
  const statusLabel = (decision?: Decision) => decision === "approved" ? "Refund approved" : decision === "denied" ? "Not eligible" : decision === "escalated" ? "Needs review" : "";
  const directoryRows = useMemo(() => {
    if (!data) return [];
    if (view === "Customers") return data.customers.map((item) => ({ primary: item.name, secondary: `${item.customerId} · ${item.email}`, status: `${item.loyaltyTier} · ${item.riskLevel} risk`, right: `${item.totalOrders} orders` }));
    if (view === "Orders") return data.orders.map((item) => ({ primary: `${item.orderId} · ${item.productName}`, secondary: `${item.customerId} · ${item.deliveryDate ? `Delivered ${item.deliveryDate}` : item.orderStatus}`, status: item.refundStatus === "processed" ? "Refunded" : item.orderStatus, right: currency(item.amount) }));
    if (view === "Refunds") return data.refunds.map((item) => ({ primary: item.orderId, secondary: `${item.customerId} · ${new Date(item.processedAt).toLocaleString()}`, status: "Processed", right: currency(item.amount) }));
    if (view === "Conversations") return data.conversations.map((item) => ({ primary: item.customerName, secondary: item.message, status: statusLabel(item.decision) || "Answered", right: timeLabel(item.createdAt) }));
    if (view === "Agent logs") return data.conversations.flatMap((conversation) => conversation.events.map((item) => ({ primary: item.title, secondary: `${conversation.customerName} · ${item.detail ?? conversation.orderId ?? "Support request"}`, status: item.status, right: timeLabel(item.at) })));
    return [];
  }, [data, view]);

  return <main className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><Sparkles size={18} fill="currentColor" /></div><span>refund<span className="brand-light">ai</span></span><span className="workspace-tag">WORKSPACE</span></div>
      <div className="workspace-select"><div className="store-avatar">N</div><div className="workspace-copy"><strong>Northstar Goods</strong><small>Support workspace</small></div><ChevronDown size={14} /></div>
      <div className="nav-label">WORKSPACE</div>
      <nav className="nav-list">{[{ title: "Overview", icon: LayoutDashboard }, { title: "Conversations", icon: MessageCircle, count: "4" }, { title: "Customers", icon: Users }, { title: "Orders", icon: Package }, { title: "Refunds", icon: WalletCards }, { title: "Agent logs", icon: Activity }].map(({ title, icon: Icon, count }) => <button key={title} onClick={() => setView(title)} className={`nav-item ${view === title ? "active" : ""}`}><Icon size={17} strokeWidth={1.8} /><span>{title}</span>{count && <span className="nav-count">{data?.metrics.escalated ?? 0}</span>}</button>)}</nav>
      <div className="sidebar-bottom"><div className="plan-card"><div className="plan-icon"><ShieldCheck size={16} /></div><strong>All systems healthy</strong><p>Your AI agent is online and ready to help.</p><div className="health-row"><span className="health-dot" /> Agent operational <span>·</span> 99.9%</div></div><button className="nav-item"><CircleHelp size={17} /><span>Help & support</span></button><div className="profile-row"><div className="profile-avatar">JD</div><div className="workspace-copy"><strong>Jordan Davis</strong><small>Workspace admin</small></div><MoreHorizontal size={18} /></div></div>
    </aside>
    <section className="main-panel">
      <header className="topbar"><div className="breadcrumbs">Workspace <span>/</span> <strong>{view}</strong><span className="live-indicator"><i /> Live</span></div><div className="top-actions"><button className="icon-button" aria-label="Search"><Search size={17} /></button><div className="top-divider" /><button className="icon-button" aria-label="Notifications"><div className="notification-dot" /><Activity size={17} /></button><div className="profile-avatar small">JD</div></div></header>
      <div className="content-scroll"><div className="page-heading"><div><div className="eyebrow">{new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }).format(new Date()).toUpperCase()} <span className="eyebrow-dot">·</span> YOUR WORKSPACE</div><h1>Good afternoon, Jordan <span className="wave">✳</span></h1><p>Here’s what’s happening with your support operations today.</p></div><button className="primary-button" onClick={() => { setMessages([initialMessage]); setActiveConversation(null); setToast("A fresh demo conversation is ready."); window.setTimeout(() => setToast(""), 2600); }}><Plus size={17} /> New conversation</button></div>
      {view !== "Overview" && <section className="panel-card directory-panel"><div className="section-heading"><div><h2>{view}</h2><p>Live workspace records from the demo support system.</p></div><span className="directory-total">{directoryRows.length} records</span></div><div className="directory-list">{directoryRows.slice(0, 30).map((row, index) => <div className="directory-row" key={`${row.primary}-${index}`}><div className="directory-copy"><strong>{row.primary}</strong><span>{row.secondary}</span></div><span className={`directory-status ${row.status.toLowerCase().replaceAll(" ", "-")}`}>{row.status}</span><time>{row.right}</time></div>)}{directoryRows.length === 0 && <div className="list-empty">No {view.toLowerCase()} records yet.</div>}</div></section>}
      <div className="metrics-grid">{[
        { label: "Total conversations", value: data?.metrics.totalConversations ?? 0, icon: MessageCircle, change: "+12.8%", tone: "blue", caption: "vs. last week" },
        { label: "Refund requests", value: data?.metrics.refundRequests ?? 0, icon: WalletCards, change: "Live", tone: "violet", caption: "requests handled" },
        { label: "Approved refunds", value: data?.metrics.approved ?? 0, icon: Check, change: "Live", tone: "green", caption: "processed successfully" },
        { label: "Denied refunds", value: data?.metrics.denied ?? 0, icon: X, change: "Live", tone: "red", caption: "policy ineligible" },
        { label: "Manual reviews", value: data?.metrics.escalated ?? 0, icon: Clock3, change: "Live", tone: "amber", caption: "awaiting support review" },
        { label: "Total refunded", value: currency(data?.metrics.totalRefundAmount ?? 0), icon: ArrowUpRight, change: "Live", tone: "amber", caption: "across all refunds" },
      ].map(({ label, value, icon: Icon, change, tone, caption }) => <article className="metric-card" key={label}><div className={`metric-icon ${tone}`}><Icon size={17} /></div><div className="metric-top"><span>{label}</span><MoreHorizontal size={17} /></div><div className="metric-value">{value}</div><div className="metric-foot"><span className={`metric-change ${tone}`}>{change}</span><span>{caption}</span></div></article>)}</div>
      <section className="workspace-grid">
        <article className="chat-card panel-card"><div className="card-header"><div><div className="card-title-row"><h2>Live agent preview</h2><span className="demo-pill"><i /> DEMO MODE</span></div><p>See how your AI agent handles a customer conversation.</p></div><button className="icon-button" aria-label="More chat options"><MoreHorizontal size={19} /></button></div>
          <div className="chat-toolbar"><div className="customer-select-wrap"><div className="customer-avatar">{customer?.name.split(" ").map((part) => part[0]).join("") ?? "CU"}</div><div className="customer-select-copy"><small>CONVERSATION WITH</small><div className="select-line"><select value={selectedCustomer} onChange={(e) => switchCustomer(e.target.value)} aria-label="Select demo customer">{data?.customers.map((person) => <option key={person.customerId} value={person.customerId}>{person.name} · {person.customerId}</option>)}</select><ChevronDown size={13} /></div></div><span className="customer-status"><i /> Active</span></div><button className="toolbar-icon" aria-label="Conversation details"><MoreHorizontal size={18} /></button></div>
          <div className="chat-stream">{messages.map((message) => <div className={`message-row ${message.role}`} key={message.id}>{message.role === "assistant" && <div className="ai-avatar"><Sparkles size={14} /></div>}<div className="message-stack"><div className="message-bubble">{message.text}{message.decision && <div className={`decision-chip ${message.decision}`}><span />{statusLabel(message.decision)}</div>}</div><span className="message-time">{message.role === "assistant" ? "RefundAI" : customer?.name.split(" ")[0]} · {timeLabel(new Date().toISOString())}</span></div>{message.role === "user" && <div className="customer-avatar mini">{customer?.name.split(" ").map((part) => part[0]).join("")}</div>}</div>)}{loading && <div className="message-row assistant"><div className="ai-avatar"><Sparkles size={14} /></div><div className="typing-bubble"><i /><i /><i /><span>Checking policy and order details</span></div></div>}</div>
          <div className="quick-prompts"><span>TRY A SCENARIO</span>{scenarios.map(({ label, orderId, customerId, icon: Icon }) => <button key={orderId} onClick={() => void sendMessage(`I want a refund for order ${orderId}.`, customerId)} disabled={loading}><Icon size={13} />{label}</button>)}</div>
          <form className="composer" onSubmit={(e) => { e.preventDefault(); void sendMessage(); }}><input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about a refund, order, or policy..." aria-label="Message the support agent" maxLength={1200} /><div className="composer-bottom"><div><span className="composer-hint"><Command size={12} /> Enter to send</span><span className="composer-count">{input.length}/1200</span></div><button className="send-button" type="submit" aria-label="Send message" disabled={!input.trim() || loading}>{loading ? <LoaderCircle size={16} className="spin" /> : <Send size={16} />}</button></div></form><div className="chat-footnote"><ShieldCheck size={12} /> AI responses are checked against your refund policy before action.</div>
        </article>
        <aside className="trace-card panel-card"><div className="card-header trace-header"><div><div className="card-title-row"><div className="trace-title-icon"><Activity size={15} /></div><h2>Agent execution logs</h2></div><p>Safe decision trace · No private reasoning</p></div><button className="trace-live"><i /> LIVE</button></div>
          <div className="trace-context"><div className="trace-context-top"><span>{activeConversation ? "CURRENT REQUEST" : "LATEST ACTIVITY"}</span><span>{newestEvents.length ? "JUST NOW" : "WAITING"}</span></div><div className="trace-context-copy"><div className="trace-order-icon"><Package size={16} /></div><div><strong>{activeConversation?.orderId ?? data?.conversations[0]?.orderId ?? "Waiting for a request"}</strong><span>{activeOrder?.productName ?? data?.orders.find((order) => order.orderId === data?.conversations[0]?.orderId)?.productName ?? "Start a demo scenario to see the live trace"}</span></div><span className={`trace-status ${activeConversation?.decision ?? "info"}`}>{activeConversation ? activeConversation.decision.toUpperCase() : "READY"}</span></div></div>
          <div className="trace-timeline">{newestEvents.length ? newestEvents.map((item: AgentEvent, i) => <div className="trace-event" key={item.id}><div className={`trace-node ${item.status}`}>{item.status === "success" ? <Check size={11} /> : item.status === "failure" ? <X size={11} /> : item.status === "pending" ? <Clock3 size={11} /> : <span />}</div><div className="trace-event-body"><div className="trace-event-heading"><strong>{item.title}</strong><time>{timeLabel(item.at)}</time></div>{item.detail && <p className={item.status === "failure" ? "failure-text" : ""}>{item.detail}</p>}</div>{i < newestEvents.length - 1 && <div className={`trace-line ${item.status}`} />}</div>) : <div className="trace-empty"><div className="trace-empty-icon"><Bot size={21} /></div><strong>Your agent is standing by</strong><p>Start a demo scenario to watch the agent retrieve customer and order records, check policy rules, and log its decision here.</p></div>}</div>
          <div className="trace-footer"><span><span className="health-dot" /> Agent online</span><span>Deterministic policy checks</span></div>
        </aside>
      </section>
      <section className="bottom-grid"><article className="panel-card recent-card"><div className="section-heading"><div><h2>Recent conversations</h2><p>A live feed of customer support activity.</p></div><button className="text-button" onClick={() => setView("Conversations")}>View all <ArrowUpRight size={14} /></button></div><div className="conversation-list">{data?.conversations.slice(0, 4).map((item) => <button className="conversation-row" key={item.id} onClick={() => { setActiveConversation(item); setMessages([{ id: item.id + "u", role: "user", text: item.message }, { id: item.id, role: "assistant", text: item.response, decision: item.decision, orderId: item.orderId }]); }}><div className="customer-avatar row-avatar">{item.customerName.split(" ").map((part) => part[0]).join("")}</div><div className="conversation-info"><strong>{item.customerName}</strong><span>{item.message}</span></div><span className={`row-decision ${item.decision}`}>{statusLabel(item.decision) || "Answered"}</span><time>{timeLabel(item.createdAt)}</time></button>)}{(!data?.conversations.length) && <div className="list-empty"><MessageCircle size={16} /> Conversations from your demo will appear here.</div>}</div></article>
        <article className="panel-card policy-card"><div className="section-heading"><div><h2>Refund policy</h2><p>What the agent checks before every decision.</p></div><div className="policy-version">v2026.1</div></div><div className="policy-rules">{["30 days from delivery", "Delivered order required", "Eligible products only", "Unused or defective items", "Single refund per order", ">$250 or high risk → review"].map((rule, i) => <div className="policy-rule" key={rule}><span className="rule-check"><Check size={11} /></span>{rule}</div>)}</div><div className="policy-note"><ShieldCheck size={14} /><span>Policy enforcement happens in the server, independent of AI responses.</span></div></article></section>
      <footer className="app-footer"><span>RefundAI <span>·</span> AI-powered support, with a human touch.</span><span><i /> All systems operational <span className="footer-sep">·</span> Last synced just now</span></footer>
      {toast && <div className="toast"><Check size={15} />{toast}<button onClick={() => setToast("")}><X size={14} /></button></div>}
    </div></section>
  </main>;
}
