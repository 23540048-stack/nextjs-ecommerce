"use client";

import { useState } from "react";
import { X, Send } from "lucide-react";
import { api } from "@/lib/api";

function KonohaIcon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeWidth="7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M 90,15 C 80,22 70,22 54,22 C 36,22 24,34 24,52 C 24,70 36,82 54,82 C 72,82 82,68 82,50 C 82,34 70,24 54,24 C 38,24 28,36 28,52 C 28,64 38,72 52,72 C 64,72 70,64 70,52 C 70,42 62,36 52,36 C 44,36 40,42 40,48" />
      <path d="M 24,52 L 24,82 L 52,82 Z" />
    </svg>
  );
}

export const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<
    { sender: "user" | "bot"; text: string }[]
  >([
    {
      sender: "bot",
      text: "Chào mừng bạn đến với Làng Lá! Hãy để Naruto giúp bạn tham quan nha! 🍥",
    },
  ]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const text = input;
    setInput("");
    setMessages((prev) => [...prev, { sender: "user", text }]);
    setLoading(true);

    try {
      const res = await api.post("/chatbot/message", { message: text });
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: res.data.reply || res.data },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Có lỗi rồi, thử lại sau nhé!" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative bg-blue-600 hover:bg-blue-700 text-white p-3.5 rounded-full shadow-[0_0_20px_rgba(37,99,235,0.6)] hover:shadow-[0_0_25px_rgba(37,99,235,0.9)] transition-all duration-300 flex items-center justify-center hover:scale-110 border-2 border-white/20 cursor-pointer"
          aria-label="Mở Chatbot Làng Lá"
        >
          <KonohaIcon className="w-8 h-8 group-hover:rotate-12 transition-transform duration-300" />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-cyan-400 rounded-full border-2 border-slate-900 animate-pulse shadow-[0_0_8px_#22d3ee]" />
        </button>
      ) : (
        <div className="bg-white w-80 h-96 rounded-2xl shadow-2xl flex flex-col border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="bg-blue-600 text-white p-3 flex justify-between items-center font-bold">
            <div className="flex items-center gap-2">
              <KonohaIcon className="w-5 h-5 text-white" />
              <span>Naruto Assistant</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:opacity-80"
              type="button"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 p-3 overflow-y-auto space-y-2 text-sm">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`p-2.5 rounded-xl max-w-[85%] ${
                  m.sender === "user"
                    ? "bg-blue-600 text-white ml-auto"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {m.text}
              </div>
            ))}
            {loading && (
              <div className="text-gray-400 italic text-xs">
                Naruto đang suy nghĩ...
              </div>
            )}
          </div>

          {/* Dùng thẻ form bọc input để submit chuẩn xác */}
          <form
            onSubmit={handleSend}
            className="p-2 border-t flex gap-1 bg-gray-50"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Hỏi Naruto về sản phẩm..."
              className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-blue-600"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
