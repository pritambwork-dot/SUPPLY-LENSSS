"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Sparkles,
  X,
  Send,
  Maximize2,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Check,
  Building2,
  ShieldCheck,
  ChevronDown,
  ExternalLink,
  Bot,
  User,
  ArrowRight,
  Info,
} from "lucide-react";
import { api } from "@/services/api";

interface MessageItem {
  id: string;
  sender: "user" | "assistant" | "system";
  role: string;
  text: string;
  suggested_actions?: Array<{ label: string; action: string; prompt?: string }>;
  referenced_supplier_ids?: string[];
  tokens_used?: number;
  created_at?: string;
}

export const FloatingAIAssistant: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversationsList, setConversationsList] = useState<any[]>([]);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [inputText, setInputText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingStatus, setStreamingStatus] = useState<string | null>(null);
  const [suggestedActions, setSuggestedActions] = useState<any[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<Record<string, number>>({});
  const [isConversationsDropdownOpen, setIsConversationsDropdownOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingStatus]);

  // Extract active entity ID if on vendor page (/vendors/[id])
  const activeEntityId = pathname.startsWith("/vendors/")
    ? pathname.replace("/vendors/", "").split("/")[0]
    : null;

  // Initialize or fetch conversation on open
  useEffect(() => {
    if (isOpen && !conversationId) {
      initConversation();
    }
  }, [isOpen]);

  const initConversation = async (title = "Sourcing Consultation") => {
    try {
      // Fetch existing conversations
      const listRes = await api.assistant.listConversations();
      const existing = listRes?.conversations || [];
      setConversationsList(existing);

      if (existing.length > 0) {
        // Load latest
        const latestId = existing[0].id;
        setConversationId(latestId);
        loadConversationHistory(latestId);
      } else {
        // Create new
        const newConv = await api.assistant.createConversation({
          title,
          active_route: pathname,
        });
        setConversationId(newConv.id);
        if (newConv.initial_message) {
          setMessages([
            {
              id: newConv.initial_message.id,
              sender: "assistant",
              role: "assistant",
              text: newConv.initial_message.text,
              suggested_actions: newConv.initial_message.suggested_actions,
            },
          ]);
          setSuggestedActions(newConv.initial_message.suggested_actions || []);
        }
      }
    } catch (err) {
      console.error("Failed to init AI conversation:", err);
    }
  };

  const loadConversationHistory = async (id: string) => {
    try {
      const data = await api.assistant.getConversation(id);
      if (data?.messages) {
        setMessages(data.messages);
        const lastMsg = data.messages[data.messages.length - 1];
        if (lastMsg?.suggested_actions) {
          setSuggestedActions(lastMsg.suggested_actions);
        }
      }
    } catch (err) {
      console.error("Failed to load conversation history:", err);
    }
  };

  const handleStartNewChat = async () => {
    try {
      setMessages([]);
      setSuggestedActions([]);
      const newConv = await api.assistant.createConversation({
        title: "New Sourcing Consultation",
        active_route: pathname,
      });
      setConversationId(newConv.id);
      if (newConv.initial_message) {
        setMessages([
          {
            id: newConv.initial_message.id,
            sender: "assistant",
            role: "assistant",
            text: newConv.initial_message.text,
            suggested_actions: newConv.initial_message.suggested_actions,
          },
        ]);
        setSuggestedActions(newConv.initial_message.suggested_actions || []);
      }
      setIsConversationsDropdownOpen(false);
    } catch (err) {
      console.error("Error creating new chat:", err);
    }
  };

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputText;
    if (!textToSend.trim() || isStreaming || !conversationId) return;

    const userMsgId = `temp-user-${Date.now()}`;
    const userMsg: MessageItem = {
      id: userMsgId,
      sender: "user",
      role: "user",
      text: textToSend.trim(),
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setInputText("");
    setIsStreaming(true);
    setStreamingStatus("Analyzing requirement...");

    const asstTempId = `temp-asst-${Date.now()}`;
    const initialAsstMsg: MessageItem = {
      id: asstTempId,
      sender: "assistant",
      role: "assistant",
      text: "",
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, initialAsstMsg]);

    try {
      await api.assistant.streamMessage(
        conversationId,
        {
          text: textToSend.trim(),
          active_route: pathname,
          active_entity_id: activeEntityId || undefined,
        },
        {
          onStatus: (status) => {
            setStreamingStatus(status);
          },
          onChunk: (delta) => {
            setStreamingStatus(null);
            setMessages((prev) =>
              prev.map((m) =>
                m.id === asstTempId ? { ...m, text: m.text + delta } : m
              )
            );
          },
          onComplete: (meta) => {
            setIsStreaming(false);
            setStreamingStatus(null);
            if (meta.suggested_actions) {
              setSuggestedActions(meta.suggested_actions);
            }
            if (meta.referenced_supplier_ids) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === asstTempId
                    ? {
                        ...m,
                        text: meta.full_text || m.text,
                        referenced_supplier_ids: meta.referenced_supplier_ids,
                        suggested_actions: meta.suggested_actions,
                      }
                    : m
                )
              );
            }
          },
          onError: (err) => {
            console.error("Streaming error:", err);
            setIsStreaming(false);
            setStreamingStatus(null);
            setMessages((prev) =>
              prev.map((m) =>
                m.id === asstTempId
                  ? {
                      ...m,
                      text:
                        m.text ||
                        "I encountered an issue connecting to the sourcing intelligence engine. Please try again or verify your connection.",
                    }
                  : m
              )
            );
          },
        }
      );
    } catch (err: any) {
      setIsStreaming(false);
      setStreamingStatus(null);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleFeedback = async (messageId: string, rating: number) => {
    try {
      await api.assistant.submitFeedback(messageId, { rating });
      setFeedbackSubmitted((prev) => ({ ...prev, [messageId]: rating }));
    } catch (err) {
      console.error("Feedback error:", err);
    }
  };

  const renderMarkdown = (content: string) => {
    // Basic Markdown formatting helper for tables, bolding, lists, and headers
    const lines = content.split("\n");
    const formatted: React.ReactNode[] = [];
    let inTable = false;
    let tableRows: string[][] = [];

    const flushTable = (keyIndex: number) => {
      if (tableRows.length > 0) {
        const headers = tableRows[0];
        const bodyRows = tableRows.slice(2); // Skip separator row
        formatted.push(
          <div key={`table-${keyIndex}`} className="my-3 overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100 font-semibold text-slate-800">
                <tr>
                  {headers.map((h, i) => (
                    <th key={i} className="px-3 py-2 border-b border-slate-200">
                      {h.trim()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {bodyRows.map((row, ri) => (
                  <tr key={ri} className="hover:bg-slate-50/80 transition-colors">
                    {row.map((cell, ci) => (
                      <td key={ci} className="px-3 py-2">
                        {cell.trim().replace(/\*\*(.*?)\*\*/g, "$1")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        tableRows = [];
      }
      inTable = false;
    };

    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
        inTable = true;
        const cols = trimmed.slice(1, -1).split("|");
        tableRows.push(cols);
        return;
      } else if (inTable) {
        flushTable(idx);
      }

      if (trimmed.startsWith("### ")) {
        formatted.push(
          <h4 key={idx} className="text-sm font-bold text-slate-900 mt-3 mb-1">
            {trimmed.replace("### ", "")}
          </h4>
        );
      } else if (trimmed.startsWith("#### ")) {
        formatted.push(
          <h5 key={idx} className="text-xs font-bold uppercase tracking-wider text-slate-700 mt-2.5 mb-1">
            {trimmed.replace("#### ", "")}
          </h5>
        );
      } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        formatted.push(
          <div key={idx} className="flex items-start space-x-2 my-0.5 text-xs text-slate-700">
            <span className="text-cyan-600 font-bold mt-0.5">•</span>
            <span dangerouslySetInnerHTML={{ __html: formatInline(trimmed.substring(2)) }} />
          </div>
        );
      } else if (trimmed === "---") {
        formatted.push(<hr key={idx} className="my-2 border-slate-200" />);
      } else if (trimmed.length > 0) {
        formatted.push(
          <p
            key={idx}
            className="text-xs leading-relaxed text-slate-700 my-1"
            dangerouslySetInnerHTML={{ __html: formatInline(trimmed) }}
          />
        );
      }
    });

    if (inTable) flushTable(lines.length);

    return formatted;
  };

  const formatInline = (str: string) => {
    return str
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-slate-900">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic text-slate-800">$1</em>')
      .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-slate-100 text-cyan-800 text-[11px] font-mono border border-slate-200">$1</code>');
  };

  return (
    <>
      {/* 1. FLOATING LAUNCHER PILL BUTTON */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center space-x-2.5 px-4 py-3 bg-white/95 hover:bg-white text-slate-800 rounded-full shadow-2xl hover:shadow-cyan-500/20 border border-slate-200/90 backdrop-blur-xl transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] group"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 text-white flex items-center justify-center shadow-md shadow-cyan-500/30">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div className="flex flex-col text-left">
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-semibold tracking-tight text-slate-900">
                AI Sourcing Consultant
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
            </div>
            <span className="text-[10px] text-slate-500">Ask suppliers, MOQ & landed cost</span>
          </div>
        </button>
      )}

      {/* 2. FLOATING CHAT SHEET / MODAL */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[420px] sm:w-[460px] max-w-[calc(100vw-32px)] h-[620px] max-h-[calc(100vh-80px)] bg-white/95 backdrop-blur-2xl border border-slate-200/90 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-300">
          
          {/* HEADER */}
          <div className="px-4 py-3.5 border-b border-slate-200/80 bg-white/80 backdrop-blur-md flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 text-white flex items-center justify-center shadow-sm">
                <Bot className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center space-x-1.5">
                  <h3 className="text-xs font-bold text-slate-900">SupplyLens AI</h3>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-cyan-50 text-cyan-700 border border-cyan-200/60">
                    <ShieldCheck className="w-2.5 h-2.5 mr-0.5 text-cyan-600" />
                    Verified Sourcing
                  </span>
                </div>
                {streamingStatus ? (
                  <span className="text-[10px] text-cyan-600 font-medium flex items-center animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-600 mr-1" />
                    {streamingStatus}
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-500 flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1" />
                    Ready · Gemini Grounded
                  </span>
                )}
              </div>
            </div>

            {/* ACTION CONTROLS */}
            <div className="flex items-center space-x-1">
              <button
                onClick={handleStartNewChat}
                title="Start new consultation"
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => router.push("/assistant")}
                title="Expand full screen"
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close"
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ACTIVE ROUTE CONTEXT PILL */}
          <div className="px-4 py-1.5 bg-slate-50/80 border-b border-slate-200/50 flex items-center justify-between text-[11px] text-slate-600">
            <span className="flex items-center truncate">
              <span className="font-semibold text-slate-800 mr-1">Active Page:</span>
              <code className="text-cyan-700 truncate">{pathname}</code>
            </span>
            {activeEntityId && (
              <span className="text-[10px] bg-cyan-100/80 text-cyan-800 px-1.5 py-0.5 rounded font-mono ml-2 shrink-0">
                ID: {activeEntityId}
              </span>
            )}
          </div>

          {/* MESSAGES BODY */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-gradient-to-b from-white via-slate-50/30 to-slate-50/60">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === "user" ? "items-end" : "items-start"
                }`}
              >
                {/* BUBBLE */}
                <div
                  className={`max-w-[88%] rounded-2xl p-3.5 shadow-sm text-xs ${
                    msg.sender === "user"
                      ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-tr-xs"
                      : "bg-white border border-slate-200/80 text-slate-800 rounded-tl-xs"
                  }`}
                >
                  {msg.sender === "user" ? (
                    <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>
                  ) : (
                    <div>{renderMarkdown(msg.text)}</div>
                  )}

                  {/* REFERENCED SUPPLIERS CHIPS */}
                  {msg.referenced_supplier_ids && msg.referenced_supplier_ids.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                      {msg.referenced_supplier_ids.map((sid) => (
                        <button
                          key={sid}
                          onClick={() => router.push(`/vendors/${sid}`)}
                          className="inline-flex items-center space-x-1 px-2 py-1 rounded-md bg-slate-100 hover:bg-cyan-50 hover:text-cyan-800 text-[10px] font-medium text-slate-700 border border-slate-200/60 transition-colors"
                        >
                          <Building2 className="w-2.5 h-2.5 text-cyan-600" />
                          <span>Supplier: {sid}</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* ASSISTANT MESSAGE ACTIONS (Copy, Feedback) */}
                {msg.sender === "assistant" && msg.text && (
                  <div className="flex items-center space-x-2 mt-1 px-1 text-[10px] text-slate-400">
                    <button
                      onClick={() => handleCopy(msg.text, msg.id)}
                      className="hover:text-slate-600 flex items-center space-x-0.5 transition-colors"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-600">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                    <span>·</span>
                    <button
                      onClick={() => handleFeedback(msg.id, 1)}
                      className={`hover:text-emerald-600 transition-colors ${
                        feedbackSubmitted[msg.id] === 1 ? "text-emerald-600 font-semibold" : ""
                      }`}
                    >
                      <ThumbsUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleFeedback(msg.id, -1)}
                      className={`hover:text-rose-600 transition-colors ${
                        feedbackSubmitted[msg.id] === -1 ? "text-rose-600 font-semibold" : ""
                      }`}
                    >
                      <ThumbsDown className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* SUGGESTION CHIPS STRIP */}
          {suggestedActions && suggestedActions.length > 0 && !isStreaming && (
            <div className="px-3 py-2 border-t border-slate-100 bg-white/70 overflow-x-auto no-scrollbar flex items-center space-x-1.5">
              {suggestedActions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(s.prompt || s.label)}
                  className="whitespace-nowrap px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100/80 hover:bg-cyan-50 hover:text-cyan-800 hover:border-cyan-200 text-slate-700 border border-slate-200/80 transition-all shadow-2xs shrink-0"
                >
                  ✨ {s.label}
                </button>
              ))}
            </div>
          )}

          {/* INPUT BAR */}
          <div className="p-3 bg-white border-t border-slate-200/80">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center space-x-2 relative"
            >
              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Ask about suppliers, MOQ, landed cost..."
                rows={1}
                disabled={isStreaming}
                className="flex-1 resize-none max-h-24 px-3.5 py-2.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all placeholder:text-slate-400"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isStreaming}
                className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 disabled:opacity-40 text-white flex items-center justify-center shadow-sm hover:opacity-95 transition-all shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
            <div className="flex items-center justify-between mt-1 px-1">
              <span className="text-[10px] text-slate-400">
                Grounds answers in verified MCA & registry data.
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                Enter ↵
              </span>
            </div>
          </div>

        </div>
      )}
    </>
  );
};
