"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/navigation";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Send,
  Plus,
  Trash2,
  Download,
  Building2,
  ShieldCheck,
  Bot,
  User,
  ArrowLeft,
  Search,
  ExternalLink,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  Gauge,
  HelpCircle,
  FileText,
} from "lucide-react";
import { api } from "@/services/api";
import { AuthGuard } from "@/components/auth/AuthGuard";

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

export default function AssistantPage() {
  const router = useRouter();

  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [inputText, setInputText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingStatus, setStreamingStatus] = useState<string | null>(null);
  const [suggestedActions, setSuggestedActions] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [limits, setLimits] = useState<any>(null);
  const [businessContext, setBusinessContext] = useState<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingStatus]);

  const loadInitialData = async () => {
    try {
      // 1. Fetch conversations
      const listRes = await api.assistant.listConversations();
      const list = listRes?.conversations || [];
      setConversations(list);

      if (list.length > 0) {
        setActiveConversationId(list[0].id);
        loadConversation(list[0].id);
      } else {
        startNewConversation();
      }

      // 2. Fetch Limits
      const lim = await api.assistant.getLimits();
      setLimits(lim);

      // 3. Fetch Context
      const ctx = await api.assistant.getContext();
      setBusinessContext(ctx?.context?.business || null);
    } catch (err) {
      console.error("Error loading assistant page:", err);
    }
  };

  const loadConversation = async (id: string) => {
    setActiveConversationId(id);
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
      console.error("Error fetching conversation details:", err);
    }
  };

  const startNewConversation = async () => {
    try {
      const newConv = await api.assistant.createConversation({
        title: "New Sourcing Consultation",
        active_route: "/assistant",
      });
      setActiveConversationId(newConv.id);
      setConversations((prev) => [
        {
          id: newConv.id,
          title: newConv.title,
          message_count: 1,
          updated_at: new Date().toISOString(),
        },
        ...prev,
      ]);

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
    } catch (err) {
      console.error("Error creating conversation:", err);
    }
  };

  const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.assistant.deleteConversation(id);
      const remaining = conversations.filter((c) => c.id !== id);
      setConversations(remaining);
      if (activeConversationId === id) {
        if (remaining.length > 0) {
          loadConversation(remaining[0].id);
        } else {
          startNewConversation();
        }
      }
    } catch (err) {
      console.error("Failed to delete conversation:", err);
    }
  };

  const handleSendMessage = async (textOverride?: string) => {
    const textToSend = textOverride || inputText;
    if (!textToSend.trim() || isStreaming || !activeConversationId) return;

    const userMsg: MessageItem = {
      id: `usr-${Date.now()}`,
      sender: "user",
      role: "user",
      text: textToSend.trim(),
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textOverride) setInputText("");
    setIsStreaming(true);
    setStreamingStatus("Analyzing requirement...");

    const asstTempId = `asst-${Date.now()}`;
    const initialAsst: MessageItem = {
      id: asstTempId,
      sender: "assistant",
      role: "assistant",
      text: "",
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, initialAsst]);

    try {
      await api.assistant.streamMessage(
        activeConversationId,
        {
          text: textToSend.trim(),
          active_route: "/assistant",
        },
        {
          onStatus: (status) => setStreamingStatus(status),
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
          onError: () => {
            setIsStreaming(false);
            setStreamingStatus(null);
          },
        }
      );
    } catch (err) {
      setIsStreaming(false);
      setStreamingStatus(null);
    }
  };

  const handleExport = () => {
    const chatContent = messages
      .map(
        (m) =>
          `### ${m.sender.toUpperCase()} (${m.created_at || "N/A"})\n\n${m.text}\n\n`
      )
      .join("---\n\n");
    const blob = new Blob([chatContent], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `SupplyLens_Consultation_${activeConversationId || "export"}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderMarkdown = (content: string) => {
    const lines = content.split("\n");
    const formatted: React.ReactNode[] = [];
    let inTable = false;
    let tableRows: string[][] = [];

    const flushTable = (keyIndex: number) => {
      if (tableRows.length > 0) {
        const headers = tableRows[0];
        const bodyRows = tableRows.slice(2);
        formatted.push(
          <div key={`table-${keyIndex}`} className="my-3 overflow-x-auto rounded-xl border border-slate-200 shadow-sm bg-white">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100 font-semibold text-slate-800">
                <tr>
                  {headers.map((h, i) => (
                    <th key={i} className="px-3.5 py-2.5 border-b border-slate-200">
                      {h.trim()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {bodyRows.map((row, ri) => (
                  <tr key={ri} className="hover:bg-slate-50/80 transition-colors">
                    {row.map((cell, ci) => (
                      <td key={ci} className="px-3.5 py-2.5">
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
          <div key={idx} className="flex items-start space-x-2 my-1 text-xs text-slate-700">
            <span className="text-cyan-600 font-bold mt-0.5">•</span>
            <span dangerouslySetInnerHTML={{ __html: formatInline(trimmed.substring(2)) }} />
          </div>
        );
      } else if (trimmed === "---") {
        formatted.push(<hr key={idx} className="my-2.5 border-slate-200" />);
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

  const filteredConversations = conversations.filter((c) =>
    (c.title || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AuthGuard>
      <div className="flex h-screen bg-slate-50 font-sans text-slate-800 antialiased overflow-hidden">
      
      {/* 1. LEFT SIDEBAR: THREADS & TOKEN METER */}
      <aside className="w-80 bg-white border-r border-slate-200/90 flex flex-col h-full shrink-0">
        
        {/* TOP BRAND & NEW CHAT */}
        <div className="p-4 border-b border-slate-200/80">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center space-x-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </button>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          <button
            onClick={startNewConversation}
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium text-xs rounded-xl shadow-sm transition-all active:scale-[0.99]"
          >
            <Plus className="w-4 h-4" />
            <span>New Sourcing Consultation</span>
          </button>
        </div>

        {/* SEARCH CONVERSATIONS */}
        <div className="px-4 py-2 border-b border-slate-100">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-cyan-500 placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* CONVERSATION THREADS LIST */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-400">
              No conversations found.
            </div>
          ) : (
            filteredConversations.map((c) => (
              <div
                key={c.id}
                onClick={() => loadConversation(c.id)}
                className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer text-xs transition-all ${
                  activeConversationId === c.id
                    ? "bg-cyan-50/80 text-cyan-900 font-semibold border border-cyan-200/60 shadow-2xs"
                    : "hover:bg-slate-50 text-slate-700"
                }`}
              >
                <div className="flex flex-col truncate pr-2">
                  <span className="truncate">{c.title || "Consultation"}</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    {c.message_count || 1} turns
                  </span>
                </div>
                <button
                  onClick={(e) => handleDeleteConversation(c.id, e)}
                  title="Delete thread"
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 transition-opacity"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* TOKEN BUDGET & LIMITS METER */}
        {limits && (
          <div className="p-4 border-t border-slate-200/80 bg-slate-50/70">
            <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5">
              <span className="flex items-center space-x-1 font-medium">
                <Gauge className="w-3.5 h-3.5 text-cyan-600" />
                <span>Daily Token Quota</span>
              </span>
              <span className="font-semibold text-slate-900">
                {Math.round(
                  ((limits.daily_tokens_consumed || 0) /
                    (limits.daily_token_budget || 150000)) *
                    100
                )}
                %
              </span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mb-2">
              <div
                className="bg-gradient-to-r from-cyan-500 to-blue-600 h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(
                    100,
                    ((limits.daily_tokens_consumed || 0) /
                      (limits.daily_token_budget || 150000)) *
                      100
                  )}%`,
                }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>{limits.daily_tokens_remaining?.toLocaleString()} tokens left</span>
              <span>Resets at midnight UTC</span>
            </div>
          </div>
        )}
      </aside>

      {/* 2. MAIN CHAT PANE */}
      <main className="flex-1 flex flex-col h-full bg-white relative">
        
        {/* HEADER BAR */}
        <header className="px-6 py-4 border-b border-slate-200/90 flex items-center justify-between bg-white/80 backdrop-blur-md">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 text-white flex items-center justify-center shadow-sm">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-sm font-bold text-slate-900">
                  SupplyLens AI Sourcing Consultant
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="w-3 h-3 mr-1 text-emerald-600" />
                  Grounded in Verified Data
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {businessContext ? (
                  <span>
                    Consulting for <strong>{businessContext.name}</strong> ({businessContext.location || "India"})
                  </span>
                ) : (
                  "Industrial sourcing, BOM validation, and price optimization"
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleExport}
              title="Export Consultation"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs text-slate-600 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Report</span>
            </button>
          </div>
        </header>

        {/* MESSAGES THREAD */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 max-w-4xl mx-auto w-full">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.sender === "user" ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-4 shadow-xs text-xs leading-relaxed ${
                  msg.sender === "user"
                    ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-tr-xs"
                    : "bg-slate-50/80 border border-slate-200 text-slate-800 rounded-tl-xs"
                }`}
              >
                {msg.sender === "user" ? (
                  <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>
                ) : (
                  <div>{renderMarkdown(msg.text)}</div>
                )}

                {/* REFERENCED SUPPLIERS */}
                {msg.referenced_supplier_ids &&
                  msg.referenced_supplier_ids.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex flex-wrap gap-2">
                      {msg.referenced_supplier_ids.map((sid) => (
                        <button
                          key={sid}
                          onClick={() => router.push(`/vendors/${sid}`)}
                          className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-white hover:bg-cyan-50 hover:text-cyan-800 text-slate-700 text-[11px] font-medium border border-slate-200 shadow-2xs transition-colors"
                        >
                          <Building2 className="w-3 h-3 text-cyan-600" />
                          <span>View Verified Dossier: {sid}</span>
                          <ExternalLink className="w-3 h-3 opacity-60" />
                        </button>
                      ))}
                    </div>
                  )}
              </div>

              {/* ASSISTANT COPY ACTION */}
              {msg.sender === "assistant" && msg.text && (
                <div className="flex items-center space-x-2 mt-1 px-1 text-[11px] text-slate-400">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(msg.text);
                      setCopiedId(msg.id);
                      setTimeout(() => setCopiedId(null), 2000);
                    }}
                    className="hover:text-slate-600 flex items-center space-x-1"
                  >
                    {copiedId === msg.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-600">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Response</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          ))}
          {streamingStatus && (
            <div className="flex items-center space-x-2 text-xs text-cyan-600 font-medium animate-pulse">
              <span className="w-2 h-2 rounded-full bg-cyan-600" />
              <span>{streamingStatus}</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* BOTTOM INPUT & ACTION CHIPS */}
        <div className="p-4 bg-white border-t border-slate-200/90 max-w-4xl mx-auto w-full">
          
          {/* SUGGESTION CHIPS */}
          {suggestedActions && suggestedActions.length > 0 && !isStreaming && (
            <div className="mb-3 flex flex-wrap gap-2">
              {suggestedActions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(s.prompt || s.label)}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 hover:bg-cyan-50 hover:text-cyan-800 text-slate-700 border border-slate-200/80 transition-colors"
                >
                  ✨ {s.label}
                </button>
              ))}
            </div>
          )}

          {/* INPUT FORM */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center space-x-3"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask anything about suppliers, landed costs, MOQ, or procurement strategies..."
              disabled={isStreaming}
              className="flex-1 px-4 py-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isStreaming}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 disabled:opacity-40 text-white font-medium text-xs flex items-center space-x-2 shadow-sm transition-all hover:opacity-95"
            >
              <Send className="w-4 h-4" />
              <span>Consult AI</span>
            </button>
          </form>

          <p className="mt-2 text-[11px] text-slate-400 text-center">
            SupplyLens AI connects directly to verified supplier databases. Prices and MOQs reflect verified registry and audit records.
          </p>
        </div>

      </main>
    </div>
    </AuthGuard>
  );
}
