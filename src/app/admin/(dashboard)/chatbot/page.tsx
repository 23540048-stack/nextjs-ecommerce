"use client";

import React, { useState } from "react";
import {
  Bot,
  Send,
  Sliders,
  Database,
  MessageSquare,
  Zap,
  UserCheck,
  RefreshCw,
  Plus,
  Trash2,
  Shield,
  Sparkles,
  Search,
  AlertTriangle,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";

interface FAQItem {
  id: string;
  trigger: string;
  response: string;
  category: string;
}

interface ChatMessage {
  id: string;
  sender: "bot" | "user" | "admin";
  text: string;
  timestamp: string;
}

interface LiveSession {
  id: string;
  customerName: string;
  customerRank: string;
  status: "bot_handling" | "human_takeover" | "resolved";
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
}

const INITIAL_FAQS: FAQItem[] = [
  {
    id: "FAQ-01",
    category: "SHIPPING",
    trigger: "shipping time / delivery speed",
    response:
      "Standard Anbu dispatch takes 2-4 business days across all Hidden Leaf sectors. Express summon delivery arrives within 24 hours.",
  },
  {
    id: "FAQ-02",
    category: "RETURNS",
    trigger: "return policy / exchange gear",
    response:
      "Items can be exchanged within 14 days of receipt provided the chakra seal remains intact and original tactical packaging is undamaged.",
  },
  {
    id: "FAQ-03",
    category: "VIP MEMBERSHIP",
    trigger: "how to get S-Rank VIP",
    response:
      "Achieve lifetime spent over $2,000.00 or complete 15+ verified mission gear dispatches to automatically unlock S-RANK VIP perks.",
  },
];

const INITIAL_SESSIONS: LiveSession[] = [
  {
    id: "SESS-801",
    customerName: "Naruto Uzumaki",
    customerRank: "S-RANK VIP",
    status: "bot_handling",
    lastMessage: "Do you have the Sage Mode Hoodie in XL size?",
    timestamp: "10 mins ago",
    unreadCount: 1,
  },
  {
    id: "SESS-802",
    customerName: "Sasuke Uchiha",
    customerRank: "S-RANK VIP",
    status: "human_takeover",
    lastMessage: "I need discreet shipping for order #SHINOBI-8892.",
    timestamp: "2 mins ago",
    unreadCount: 0,
  },
  {
    id: "SESS-803",
    customerName: "Sakura Haruno",
    customerRank: "JONIN",
    status: "resolved",
    lastMessage: "Thank you for confirming the refund status!",
    timestamp: "1 hour ago",
    unreadCount: 0,
  },
];

export default function AdminChatbotPage() {
  const [activeTab, setActiveTab] = useState<
    "playground" | "knowledge" | "live" | "settings"
  >("playground");

  // Bot Playground State
  const [playgroundInput, setPlaygroundInput] = useState("");
  const [playgroundMessages, setPlaygroundMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      sender: "bot",
      text: "Greetings Shinobi! I am ANBU-AI v4.0. How can I assist your mission setup today?",
      timestamp: "12:00 PM",
    },
  ]);

  // Knowledge Base State
  const [faqs, setFaqs] = useState<FAQItem[]>(INITIAL_FAQS);
  const [isAddRuleModalOpen, setIsAddRuleModalOpen] = useState(false);
  const [deletingFaq, setDeletingFaq] = useState<FAQItem | null>(null);

  // New Rule Form Inputs
  const [newTrigger, setNewTrigger] = useState("");
  const [newResponse, setNewResponse] = useState("");
  const [newCategory, setNewCategory] = useState("GENERAL");

  // Live Sessions State
  const [sessions, setSessions] = useState<LiveSession[]>(INITIAL_SESSIONS);
  const [activeSessionId, setActiveSessionId] = useState<string>("SESS-801");
  const [liveChatInput, setLiveChatInput] = useState("");

  // Bot Settings State
  const [modelTemperature, setModelTemperature] = useState(0.7);
  const [botPersona, setBotPersona] = useState("TACTICAL_ASSISTANT");
  const [autoTakeoverThreshold, setAutoTakeoverThreshold] = useState(3);

  // Send message in Playground
  const handleSendPlaygroundMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playgroundInput.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: playgroundInput,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setPlaygroundMessages((prev) => [...prev, userMsg]);
    const currentInput = playgroundInput.toLowerCase();
    setPlaygroundInput("");

    setTimeout(() => {
      let matchedResponse =
        "I have recorded your request. Our Anbu squad will analyze this chakra pulse shortly.";
      const matchedFaq = faqs.find((f) =>
        currentInput.includes(f.trigger.toLowerCase()),
      );
      if (matchedFaq) {
        matchedResponse = matchedFaq.response;
      }

      const botReply: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: matchedResponse,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setPlaygroundMessages((prev) => [...prev, botReply]);
    }, 600);
  };

  // Add new FAQ Rule via Modal
  const handleAddFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrigger.trim() || !newResponse.trim()) return;

    const item: FAQItem = {
      id: `FAQ-0${faqs.length + 1}`,
      category: newCategory.toUpperCase(),
      trigger: newTrigger,
      response: newResponse,
    };

    setFaqs([...faqs, item]);
    setNewTrigger("");
    setNewResponse("");
    setIsAddRuleModalOpen(false);
  };

  // Confirm Delete Rule
  const handleConfirmDeleteFaq = () => {
    if (!deletingFaq) return;
    setFaqs(faqs.filter((f) => f.id !== deletingFaq.id));
    setDeletingFaq(null);
  };

  // Toggle Human Takeover
  const handleToggleTakeover = (sessionId: string) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              status:
                s.status === "human_takeover"
                  ? "bot_handling"
                  : "human_takeover",
            }
          : s,
      ),
    );
  };

  return (
    <div className="w-full min-h-screen bg-white text-brand-dark p-6 sm:p-8 font-mono space-y-8">
      {/* HEADER */}
      <div className="border-b border-brand-dark/15 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading tracking-wide uppercase flex items-center gap-2">
            <Bot className="text-orange-600" size={28} />
            SHINOBI AI CHATBOT COMMAND CENTER
          </h1>
          <p className="text-xs text-brand-dark/60 mt-1">
            Configure automated responses, monitor AI sessions, and train
            customer service models.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs font-bold uppercase">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            SYSTEM ONLINE
          </span>
          <span className="text-xs font-bold px-3 py-1 bg-brand-dark text-white uppercase">
            MODEL: ANBU-v4-TURBO
          </span>
        </div>
      </div>

      {/* QUICK METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="border border-brand-dark/15 p-4 bg-white space-y-1">
          <span className="text-[10px] font-bold text-brand-dark/50 uppercase">
            ACTIVE SESSIONS
          </span>
          <p className="text-2xl font-extrabold text-brand-dark">18 CHATS</p>
        </div>

        <div className="border border-brand-dark/15 p-4 bg-white space-y-1">
          <span className="text-[10px] font-bold text-brand-dark/50 uppercase">
            BOT RESOLUTION RATE
          </span>
          <p className="text-2xl font-extrabold text-emerald-600">89.4%</p>
        </div>

        <div className="border border-brand-dark/15 p-4 bg-white space-y-1">
          <span className="text-[10px] font-bold text-brand-dark/50 uppercase">
            AVG RESPONSE SPEED
          </span>
          <p className="text-2xl font-extrabold text-orange-600">0.45s</p>
        </div>

        <div className="border border-brand-dark/15 p-4 bg-white space-y-1">
          <span className="text-[10px] font-bold text-brand-dark/50 uppercase">
            HUMAN HANDOVERS
          </span>
          <p className="text-2xl font-extrabold text-amber-600">3 PENDING</p>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex flex-wrap border-b border-brand-dark/20 gap-2">
        {[
          { id: "playground", label: "PLAYGROUND & TESTER", icon: Zap },
          { id: "knowledge", label: "KNOWLEDGE BASE & FAQS", icon: Database },
          { id: "live", label: "LIVE CONVERSATIONS", icon: MessageSquare },
          { id: "settings", label: "MODEL CONFIGURATION", icon: Sliders },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <Button
              key={tab.id}
              variant={isActive ? "chakra" : "outline"}
              size="sm"
              icon={tab.icon}
              onClick={() => setActiveTab(tab.id as any)}
            >
              {tab.label}
            </Button>
          );
        })}
      </div>

      {/* TAB 1: PLAYGROUND & TESTER */}
      {activeTab === "playground" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 border border-brand-dark/20 bg-white flex flex-col h-[520px]">
            <div className="p-3 border-b border-brand-dark/15 bg-brand-dark/5 flex items-center justify-between">
              <span className="text-xs font-bold uppercase flex items-center gap-2">
                <Sparkles size={14} className="text-orange-500" /> AI BOT
                SIMULATOR
              </span>
              <Button
                variant="outline"
                size="sm"
                icon={RefreshCw}
                onClick={() =>
                  setPlaygroundMessages([
                    {
                      id: Date.now().toString(),
                      sender: "bot",
                      text: "Session reset. Enter prompt to test bot knowledge.",
                      timestamp: "Just now",
                    },
                  ])
                }
              >
                CLEAR CHAT
              </Button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-brand-dark/[0.02]">
              {playgroundMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.sender === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] p-3 text-xs leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-brand-dark text-white border border-brand-dark"
                        : "bg-white text-brand-dark border border-brand-dark/20 shadow-sm"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1 text-[9px] font-bold opacity-60 uppercase">
                      {msg.sender === "user" ? "ADMIN TESTER" : "ANBU-AI BOT"} •{" "}
                      {msg.timestamp}
                    </div>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <form
              onSubmit={handleSendPlaygroundMessage}
              className="p-3 border-t border-brand-dark/15 flex gap-2 items-end"
            >
              <Input
                placeholder="Type test query e.g. 'shipping time' or 'return policy'..."
                value={playgroundInput}
                onChange={(e) => setPlaygroundInput(e.target.value)}
                icon={Search}
              />
              <Button type="submit" variant="chakra" size="md" icon={Send}>
                SEND
              </Button>
            </form>
          </div>

          <div className="space-y-4">
            <div className="border border-brand-dark/15 p-4 bg-white space-y-3">
              <h3 className="text-xs font-bold uppercase border-b border-brand-dark/10 pb-2">
                TEST QUICK TRIGGERS
              </h3>
              <p className="text-[11px] text-brand-dark/60 leading-relaxed">
                Click any preset phrase below to instantly trigger trained
                response rules:
              </p>
              <div className="flex flex-col gap-2">
                {[
                  "What is your shipping time?",
                  "How to get S-Rank VIP?",
                  "Can I exchange my gear?",
                  "Unrecognized random prompt test",
                ].map((testQuery, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    size="sm"
                    className="w-full text-left justify-start"
                    onClick={() => setPlaygroundInput(testQuery)}
                  >
                    "{testQuery}"
                  </Button>
                ))}
              </div>
            </div>

            <div className="border border-brand-dark/15 p-4 bg-orange-500/5 space-y-2">
              <span className="text-[10px] font-bold text-orange-600 uppercase flex items-center gap-1">
                <Shield size={12} /> SAFEGUARD PROTOCOL ACTIVE
              </span>
              <p className="text-xs text-brand-dark/80 leading-relaxed">
                The bot enforces strict Shinobi Clan confidentiality. All
                unrecognized financial or sensitive queries automatically prompt
                human agent escalation.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: KNOWLEDGE BASE & FAQS */}
      {activeTab === "knowledge" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-brand-dark/5 p-4 border border-brand-dark/15">
            <div>
              <h2 className="text-xs font-bold uppercase">
                TRAINED BOT KNOWLEDGE RULES ({faqs.length})
              </h2>
              <p className="text-[10px] text-brand-dark/60 mt-0.5">
                Exact and fuzzy keyphrase matching configuration.
              </p>
            </div>
            <Button
              variant="chakra"
              size="md"
              icon={Plus}
              onClick={() => setIsAddRuleModalOpen(true)}
            >
              ADD NEW RULE
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {faqs.map((faq) => (
              <div
                key={faq.id}
                className="border border-brand-dark/15 p-4 bg-white space-y-3 hover:border-brand-dark/40 transition-colors flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold bg-brand-dark text-white px-2 py-0.5 uppercase">
                      {faq.category}
                    </span>
                    <span className="text-[10px] text-brand-dark/50 font-bold">
                      {faq.id}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-orange-600 flex items-center gap-1">
                    <HelpCircle size={12} /> Trigger: "{faq.trigger}"
                  </div>
                  <p className="text-xs text-brand-dark/80 bg-brand-dark/5 p-2.5 border-l-2 border-brand-dark leading-relaxed">
                    {faq.response}
                  </p>
                </div>

                <div className="flex justify-end pt-2 border-t border-brand-dark/10">
                  <Button
                    variant="danger"
                    size="sm"
                    icon={Trash2}
                    onClick={() => setDeletingFaq(faq)}
                  >
                    DELETE RULE
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: LIVE CONVERSATIONS */}
      {activeTab === "live" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="border border-brand-dark/15 bg-white p-4 space-y-3">
            <h2 className="text-xs font-bold uppercase border-b border-brand-dark/10 pb-2">
              ACTIVE CUSTOMER SESSIONS
            </h2>
            <div className="space-y-2">
              {sessions.map((sess) => (
                <div
                  key={sess.id}
                  onClick={() => setActiveSessionId(sess.id)}
                  className={`p-3 border cursor-pointer transition-colors ${
                    activeSessionId === sess.id
                      ? "border-brand-dark bg-brand-dark/5"
                      : "border-brand-dark/15 hover:bg-brand-dark/5"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs uppercase">
                      {sess.customerName}
                    </span>
                    <span className="text-[10px] text-brand-dark/50">
                      {sess.timestamp}
                    </span>
                  </div>

                  <p className="text-[11px] text-brand-dark/70 truncate mb-2">
                    "{sess.lastMessage}"
                  </p>

                  <div className="flex items-center justify-between">
                    {sess.status === "bot_handling" && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 bg-blue-500/10 text-blue-600 border border-blue-500/20 uppercase">
                        BOT HANDLING
                      </span>
                    )}
                    {sess.status === "human_takeover" && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 bg-amber-500/10 text-amber-600 border border-amber-500/20 uppercase">
                        HUMAN TAKEOVER
                      </span>
                    )}
                    {sess.status === "resolved" && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 uppercase">
                        RESOLVED
                      </span>
                    )}

                    <span className="text-[10px] font-bold text-amber-600">
                      {sess.customerRank}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 border border-brand-dark/15 bg-white flex flex-col h-[520px]">
            {(() => {
              const currentSess =
                sessions.find((s) => s.id === activeSessionId) || sessions[0];
              return (
                <>
                  <div className="p-3 border-b border-brand-dark/15 bg-brand-dark/5 flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold uppercase">
                        {currentSess.customerName}
                      </h3>
                      <p className="text-[10px] text-brand-dark/50">
                        SESSION ID: {currentSess.id}
                      </p>
                    </div>

                    <Button
                      variant={
                        currentSess.status === "human_takeover"
                          ? "danger"
                          : "chakra"
                      }
                      size="sm"
                      icon={UserCheck}
                      onClick={() => handleToggleTakeover(currentSess.id)}
                    >
                      {currentSess.status === "human_takeover"
                        ? "RELEASE TO BOT"
                        : "TAKE OVER CHAT"}
                    </Button>
                  </div>

                  <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-brand-dark/[0.02]">
                    <div className="flex flex-col items-start">
                      <div className="max-w-[80%] p-3 text-xs bg-white border border-brand-dark/20">
                        <span className="block text-[9px] font-bold text-brand-dark/50 mb-1">
                          CUSTOMER • 10:14 AM
                        </span>
                        {currentSess.lastMessage}
                      </div>
                    </div>

                    {currentSess.status === "human_takeover" && (
                      <div className="text-center my-2">
                        <span className="text-[10px] font-bold bg-amber-500/20 text-amber-700 px-3 py-1 uppercase">
                          HUMAN AGENT JOINED CONVERSATION
                        </span>
                      </div>
                    )}
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      setLiveChatInput("");
                    }}
                    className="p-3 border-t border-brand-dark/15 flex gap-2 items-end"
                  >
                    <Input
                      placeholder={
                        currentSess.status === "human_takeover"
                          ? "Type message as Human Agent..."
                          : "Click TAKE OVER CHAT to respond directly..."
                      }
                      disabled={currentSess.status !== "human_takeover"}
                      value={liveChatInput}
                      onChange={(e) => setLiveChatInput(e.target.value)}
                    />
                    <Button
                      type="submit"
                      variant="chakra"
                      size="md"
                      disabled={currentSess.status !== "human_takeover"}
                      icon={Send}
                    >
                      SEND
                    </Button>
                  </form>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* TAB 4: MODEL CONFIGURATION */}
      {activeTab === "settings" && (
        <div className="max-w-2xl border border-brand-dark/15 p-6 bg-white space-y-6">
          <h2 className="text-sm font-bold uppercase border-b border-brand-dark/10 pb-2 flex items-center gap-2">
            <Sliders size={16} className="text-orange-600" />
            AI MODEL PARAMETERS & PERSONA
          </h2>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold uppercase text-brand-dark mb-2">
                SYSTEM PERSONA
              </label>
              <select
                value={botPersona}
                onChange={(e) => setBotPersona(e.target.value)}
                className="w-full bg-brand-ivory border border-brand-dark/20 p-2.5 font-bold uppercase outline-none cursor-pointer focus:border-orange-500"
              >
                <option value="TACTICAL_ASSISTANT">
                  TACTICAL ANBU ASSISTANT (Professional & Direct)
                </option>
                <option value="FRIENDLY_NINJA">
                  FRIENDLY VILLAGE GUIDE (Casual & Welcoming)
                </option>
                <option value="STRICT_SECURITY">
                  STRICT SHADOW GUARD (High Security Focus)
                </option>
              </select>
            </div>

            <div>
              <div className="flex justify-between font-bold uppercase mb-1">
                <span>MODEL TEMPERATURE (CREATIVITY)</span>
                <span className="text-orange-600">{modelTemperature}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={modelTemperature}
                onChange={(e) =>
                  setModelTemperature(parseFloat(e.target.value))
                }
                className="w-full accent-brand-dark cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-brand-dark/50 mt-1">
                <span>0.1 (Strict & Precise)</span>
                <span>1.0 (Creative & Free)</span>
              </div>
            </div>

            <Input
              label="AUTO HUMAN TAKEOVER TRIGGER (FAILED UNKNOWN ATTEMPTS)"
              type="number"
              min={1}
              max={10}
              value={autoTakeoverThreshold}
              onChange={(e) =>
                setAutoTakeoverThreshold(parseInt(e.target.value) || 3)
              }
            />

            <div className="pt-4 border-t border-brand-dark/15 flex justify-end gap-3">
              <Button type="button" variant="outline" size="md">
                RESET DEFAULTS
              </Button>
              <Button
                type="button"
                variant="chakra"
                size="md"
                onClick={() =>
                  alert("Chatbot configuration updated successfully.")
                }
              >
                SAVE CONFIGURATION
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ADD NEW RULE MODAL */}
      <Modal
        isOpen={isAddRuleModalOpen}
        onClose={() => setIsAddRuleModalOpen(false)}
        title="ADD KNOWLEDGE BASE RULE"
        maxWidth="lg"
      >
        <form
          onSubmit={handleAddFaq}
          className="space-y-4 text-xs font-mono pt-2"
        >
          <div>
            <label className="block mb-2 font-bold text-brand-dark uppercase tracking-wider">
              CATEGORY
            </label>
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="w-full bg-brand-ivory border border-brand-dark/20 p-2.5 font-bold outline-none uppercase cursor-pointer focus:border-orange-500"
            >
              <option value="GENERAL">GENERAL</option>
              <option value="SHIPPING">SHIPPING</option>
              <option value="RETURNS">RETURNS</option>
              <option value="VIP MEMBERSHIP">VIP MEMBERSHIP</option>
            </select>
          </div>

          <Input
            label="KEYWORD / TRIGGER PHRASE"
            placeholder="e.g. shipping time, refund request"
            value={newTrigger}
            onChange={(e) => setNewTrigger(e.target.value)}
            icon={Search}
          />

          <div>
            <label className="block mb-2 font-bold text-brand-dark uppercase tracking-wider">
              AUTOMATED BOT RESPONSE
            </label>
            <textarea
              rows={4}
              placeholder="Enter exact response text for the bot..."
              value={newResponse}
              onChange={(e) => setNewResponse(e.target.value)}
              className="w-full bg-brand-ivory text-brand-dark border border-brand-dark/20 p-2.5 font-mono text-xs outline-none focus:border-orange-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-brand-dark/15">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setIsAddRuleModalOpen(false)}
            >
              CANCEL
            </Button>
            <Button type="submit" variant="chakra" size="md">
              SAVE RULE TO DATABASE
            </Button>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={!!deletingFaq}
        onClose={() => setDeletingFaq(null)}
        title="CONFIRM RULE DELETION"
        maxWidth="md"
      >
        {deletingFaq && (
          <div className="space-y-4 text-xs font-mono">
            <div className="flex items-center gap-2 text-rose-600 bg-rose-500/10 p-3 border border-rose-500/20">
              <AlertTriangle size={18} className="shrink-0" />
              <p className="font-bold uppercase">
                This action will permanently delete the AI rule.
              </p>
            </div>

            <div className="bg-brand-dark/5 p-3 border border-brand-dark/10 space-y-1">
              <p>
                Rule ID: <strong>{deletingFaq.id}</strong>
              </p>
              <p>
                Category: <strong>{deletingFaq.category}</strong>
              </p>
              <p>
                Trigger:{" "}
                <strong className="text-orange-600">
                  "{deletingFaq.trigger}"
                </strong>
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-brand-dark/15">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setDeletingFaq(null)}
              >
                CANCEL
              </Button>
              <Button
                type="button"
                variant="danger"
                size="md"
                icon={Trash2}
                onClick={handleConfirmDeleteFaq}
              >
                CONFIRM DELETE
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
