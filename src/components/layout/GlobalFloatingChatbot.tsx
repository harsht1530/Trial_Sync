import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  Bot, Send, Mic, MicOff, Volume2, VolumeX, User, Sparkles, Clock,
  CheckCircle2, AlertCircle, Pill, Activity, Calendar, MessageSquare, Phone,
  Maximize2, Minimize2, X, ClipboardList, ShieldAlert, ListFilter
} from "lucide-react";
import { cn } from "@/lib/utils";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  type?: "text" | "symptom-check" | "medication" | "appointment" | "alert";
}

export const GlobalFloatingChatbot = ({ className }: { className?: string }) => {
  const { toast } = useToast();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{
    id: "sys-start",
    role: "assistant",
    content: "Hello! I'm your AI Health Assistant. How can I help you today?",
    timestamp: new Date(),
    type: "text"
  }]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isMicActive, setIsMicActive] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Context-aware agent routing
  const isDataRoute = location.pathname.includes('/symptoms') || location.pathname.includes('/analytics');
  const agentId = isDataRoute 
    ? import.meta.env.VITE_AI_DATA_AGENT_ID 
    : import.meta.env.VITE_AI_INSIGHT_AGENT_ID;
  
  const getQuickResponses = (path: string) => {
    if (path === '/' || path === '') {
      return [
        { label: "Trial Overview", icon: Activity, message: "Can you show me a summary of active trials?" },
        { label: "Enrolled Count", icon: User, message: "How many subjects are enrolled in total?" },
        { label: "Recent Actions", icon: Clock, message: "What is the most recent activity on the site?" }
      ];
    }
    if (path.startsWith('/subject') && !path.includes('/subjects/')) {
      return [
        { label: "High Risk List", icon: ShieldAlert, message: "List all subjects with high risk level." },
        { label: "Low Compliance", icon: AlertCircle, message: "Which subjects have less than 80% compliance?" },
        { label: "Phase Distribution", icon: ListFilter, message: "Show me the subject count by phase." }
      ];
    }
    if (path.includes('/subjects/')) {
      return [
        { label: "Symptom Log", icon: Activity, message: "What symptoms has this patient reported?" },
        { label: "Allergies & History", icon: Pill, message: "Show this subject's medical history and allergies." },
        { label: "Reminders", icon: Calendar, message: "What reminders are scheduled for this patient?" }
      ];
    }
    if (path.includes('/validation')) {
      return [
        { label: "Pending Flags", icon: Clock, message: "Show me all pending validation flags." },
        { label: "Critical Issues", icon: ShieldAlert, message: "List the critical data issues." },
        { label: "Audit Summary", icon: MessageSquare, message: "Provide a summary of recent resolved logs." }
      ];
    }
    if (path.includes('/epro')) {
      return [
        { label: "Average Score", icon: ClipboardList, message: "What is the average ePRO completion score?" },
        { label: "Form Details", icon: MessageSquare, message: "Which ePRO form has the most submissions?" },
        { label: "Completion Rate", icon: CheckCircle2, message: "What is the current ePRO compliance rate?" }
      ];
    }
    if (path.includes('/communications')) {
      return [
        { label: "Call Log Summary", icon: Phone, message: "Show me a summary of recent call statuses." },
        { label: "WhatsApp Reminders", icon: MessageSquare, message: "How many reminders are active?" },
        { label: "Outreach Status", icon: User, message: "List the outbound calls made today." }
      ];
    }
    if (path.includes('/analytics')) {
      return [
        { label: "Dropout Risk", icon: ShieldAlert, message: "Which subjects are flagged with high dropout risk?" },
        { label: "Vitals Summary", icon: Activity, message: "Give me an analysis of wearable heart rate trends." },
        { label: "Compliance Analysis", icon: ClipboardList, message: "Show compliance stats grouped by trial." }
      ];
    }
    return [
      { label: "General Info", icon: Bot, message: "What can you help me with?" },
      { label: "Active Subjects", icon: User, message: "How many active subjects do we have?" },
      { label: "Contact Info", icon: Phone, message: "Show contact info for emergency query." }
    ];
  };

  const quickResponses = getQuickResponses(location.pathname);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    const tempUserMessage: Message = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
      type: "text"
    };

    setMessages(prev => [...prev, tempUserMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      const chatHistory = messages
        .filter(m => m.id !== "sys-start" && m.role !== "system")
        .map(m => ({ role: m.role, content: m.content }));

      const response = await fetch(`${API_BASE_URL}/api/agent/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: content.trim(), 
          page: location.pathname,
          history: chatHistory
        })
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      const botMessage: Message = {
        id: `msg-${Date.now()}`,
        role: "assistant",
        content: data.content,
        timestamp: new Date(),
        type: "text"
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Assistant Offline",
        description: err?.message || "Could not connect to the AI service.",
        variant: "destructive"
      });
      setMessages(prev => [...prev, {
        id: `err-${Date.now()}`,
        role: "assistant",
        content: `Error: ${err?.message || "Failed to process request."}`,
        timestamp: new Date(),
        type: "alert"
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  const toggleMic = () => {
    setIsMicActive(!isMicActive);
    if (!isMicActive) {
      toast({ title: "Voice Input Active", description: "Speak your message. Click again to stop." });
    } else {
      toast({ title: "Voice Input Stopped", description: "Processing your speech..." });
      setTimeout(() => { setInputValue("What is the latest status?"); }, 1000);
    }
  };

  const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <Card className={cn(
          "flex flex-col transition-all duration-300 w-[350px] sm:w-[420px] h-[500px] sm:h-[600px] max-h-[calc(100vh-120px)] shadow-2xl rounded-2xl overflow-hidden border border-border bg-background/95 backdrop-blur-md animate-in slide-in-from-bottom-5 duration-200 mb-4",
          isExpanded ? "fixed inset-4 z-50 h-[calc(100vh-32px)] w-[calc(100vw-32px)] sm:w-[calc(100vw-32px)] min-h-0 lg:min-h-0" : "",
          className
        )}>
          <CardHeader className="flex flex-row items-center justify-between border-b py-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="p-2 rounded-full bg-gradient-to-br from-primary to-accent">
                  <Bot className="h-5 w-5 text-primary-foreground animate-pulse" />
                </div>
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-success border-2 border-background" />
              </div>
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  AI Health Assistant
                  <Badge variant="outline" className="text-[10px] font-normal px-1 py-0">
                    <Sparkles className="h-2 w-2 mr-1 text-primary animate-spin" style={{ animationDuration: '3s' }} />
                    {isDataRoute ? "Data Agent" : "Insight Agent"}
                  </Badge>
                </CardTitle>
                <p className="text-[10px] text-muted-foreground font-medium">Always Online</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsSoundEnabled(!isSoundEnabled)}>
                {isSoundEnabled ? <Volume2 className="h-3 w-3" /> : <VolumeX className="h-3 w-3" />}
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsExpanded(!isExpanded)}>
                {isExpanded ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 bg-[#f0f4f9] space-y-4 min-h-0" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={cn("flex gap-3", message.role === "user" && "justify-end", message.role === "system" && "justify-center")}>
                  {message.role === "assistant" && (
                    <div className="flex-shrink-0">
                      <div className="p-1.5 rounded-full bg-gradient-to-br from-primary/20 to-accent/20">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                  )}
                  <div className={cn(
                    "px-4 py-2.5 rounded-2xl shadow-sm max-w-[82%]",
                    message.role === "system" && "max-w-full rounded-lg bg-muted/50 text-muted-foreground text-center text-xs py-2",
                    message.role === "user"
                      ? "bg-[#0058AB] text-white rounded-br-sm ml-auto"
                      : message.role === "assistant"
                        ? "bg-white text-slate-800 rounded-tl-sm border border-slate-100"
                        : ""
                  )}>
                    {message.role !== "system" && (
                      <div className="text-[12px] leading-relaxed break-words text-left">
                        <MarkdownContent text={message.content} />
                      </div>
                    )}
                    {message.role === "system" && (
                      <div className="flex items-center justify-center gap-2"><Clock className="h-3 w-3" />{message.content}</div>
                    )}
                    {message.role !== "system" && (
                      <div className={cn("flex items-center gap-1 mt-1.5 text-[9px]", message.role === "user" ? "text-primary-foreground/75 justify-end" : "text-slate-400")}>
                        <Clock className="h-3 w-3" />
                        {formatTime(message.timestamp)}
                        {message.role === "user" && <CheckCircle2 className="h-3 w-3 ml-1" />}
                      </div>
                    )}
                  </div>
                  {message.role === "user" && (
                    <div className="flex-shrink-0">
                      <div className="p-1.5 rounded-full bg-primary"><User className="h-4 w-4 text-primary-foreground" /></div>
                    </div>
                  )}
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="p-1.5 rounded-full bg-gradient-to-br from-primary/20 to-accent/20"><Bot className="h-4 w-4 text-primary" /></div>
                  </div>
                  <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 border border-slate-100 shadow-sm flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0058AB]/50 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0058AB]/50 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0058AB]/50 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="px-4 py-2 border-t flex gap-2 overflow-x-auto scrollbar-hide">
            {quickResponses.map((quick) => (
              <Button key={quick.label} variant="outline" size="sm" className="flex-shrink-0 gap-1.5 text-xs py-1 h-7" onClick={() => sendMessage(quick.message)}>
                <quick.icon className="h-3 w-3" />{quick.label}
              </Button>
            ))}
          </div>

          <CardContent className="p-4 border-t">
            <div className="flex items-center gap-2">
              <Button variant={isMicActive ? "destructive" : "outline"} size="icon" className="flex-shrink-0" onClick={toggleMic}>
                {isMicActive ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              <Input ref={inputRef} value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyPress={handleKeyPress} placeholder="Type your message..." className="flex-1 text-sm h-10" disabled={isMicActive} />
              <Button variant="default" size="icon" onClick={() => sendMessage(inputValue)} disabled={!inputValue.trim() || isTyping}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground text-center mt-2">
              <MessageSquare className="h-3 w-3 inline mr-1" />
              Powered by Multiplier AI
            </p>
          </CardContent>
        </Card>
      )}

      {/* Floating Action Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        size="lg"
        className={cn(
          "h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 flex items-center justify-center p-0 transition-transform hover:scale-105 duration-200 active:scale-95 relative",
          isOpen && "rotate-90"
        )}
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <>
            <Bot className="h-6 w-6 text-white animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-success"></span>
            </span>
          </>
        )}
      </Button>
    </div>
  );
}

// ─── Custom Markdown Parser ───
function renderInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**"))
      return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
    if (part.startsWith("*") && part.endsWith("*"))
      return <em key={i}>{part.slice(1, -1)}</em>;
    return <span key={i}>{part}</span>;
  });
}

function parseTable(lines: string[]): { headers: string[]; rows: string[][] } | null {
  if (lines.length < 2) return null;
  const clean = (s: string) => s.replace(/^\||\|$/g, "").split("|").map(c => c.trim());
  const headers = clean(lines[0]);
  const rows = lines.slice(2).map(clean);
  return { headers, rows };
}

function MarkdownContent({ text }: { text: string }) {
  const rawLines = text.split("\n");
  const blocks: React.ReactNode[] = [];
  let i = 0;
  let listBuffer: { type: "ul" | "ol"; items: string[] } | null = null;
  let tableBuffer: string[] = [];

  const flushList = () => {
    if (!listBuffer) return;
    const Tag = listBuffer.type === "ul" ? "ul" : "ol";
    blocks.push(
      <Tag key={blocks.length} className={`my-1 space-y-0.5 ${listBuffer.type === "ul" ? "list-disc" : "list-decimal"} pl-4`}>
        {listBuffer.items.map((item, idx) => (
          <li key={idx} className="text-[12px] leading-relaxed">{renderInline(item)}</li>
        ))}
      </Tag>
    );
    listBuffer = null;
  };

  const flushTable = () => {
    if (tableBuffer.length === 0) return;
    const parsed = parseTable(tableBuffer);
    tableBuffer = [];
    if (!parsed) return;
    blocks.push(
      <div key={blocks.length} className="my-2 overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-[10px] border-collapse">
          <thead>
            <tr className="bg-[#0058AB]/10">
              {parsed.headers.map((h, idx) => (
                <th key={idx} className="px-2.5 py-1.5 text-left font-semibold text-[#00395d] border-b border-slate-200 whitespace-nowrap">
                  {renderInline(h)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {parsed.rows.map((row, ridx) => {
              if (row.every(cell => /^[-:|]*$/.test(cell))) return null;
              return (
                <tr key={ridx} className={ridx % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                  {row.map((cell, cidx) => (
                    <td key={cidx} className="px-2.5 py-1.5 text-slate-700 border-b border-slate-100 align-top">
                      {renderInline(cell)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  while (i < rawLines.length) {
    const line = rawLines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      flushList();
      tableBuffer.push(trimmed);
      i++;
      continue;
    } else if (tableBuffer.length > 0) {
      flushTable();
    }

    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      flushList();
      blocks.push(<hr key={blocks.length} className="my-1.5 border-slate-200" />);
      i++;
      continue;
    }

    const h3 = trimmed.match(/^### (.+)/);
    const h2 = trimmed.match(/^## (.+)/);
    const h1 = trimmed.match(/^# (.+)/);
    if (h3) { flushList(); blocks.push(<p key={blocks.length} className="text-[11px] font-bold text-[#0058AB] uppercase tracking-wider mt-2 mb-0.5">{renderInline(h3[1])}</p>); i++; continue; }
    if (h2) { flushList(); blocks.push(<p key={blocks.length} className="text-xs font-bold text-slate-800 mt-2 mb-0.5">{renderInline(h2[1])}</p>); i++; continue; }
    if (h1) { flushList(); blocks.push(<p key={blocks.length} className="text-xs font-bold text-slate-800 mt-1 mb-0.5">{renderInline(h1[1])}</p>); i++; continue; }

    const bulletMatch = trimmed.match(/^[-*•] (.+)/);
    if (bulletMatch) {
      if (!listBuffer || listBuffer.type !== "ul") { flushList(); listBuffer = { type: "ul", items: [] }; }
      listBuffer.items.push(bulletMatch[1]);
      i++; continue;
    }

    const numMatch = trimmed.match(/^\d+\. (.+)/);
    if (numMatch) {
      if (!listBuffer || listBuffer.type !== "ol") { flushList(); listBuffer = { type: "ol", items: [] }; }
      listBuffer.items.push(numMatch[1]);
      i++; continue;
    }

    if (listBuffer && !bulletMatch && !numMatch) flushList();

    if (!trimmed) { blocks.push(<div key={blocks.length} className="h-1" />); i++; continue; }

    blocks.push(
      <p key={blocks.length} className="text-[12px] leading-relaxed mb-2 last:mb-0">{renderInline(trimmed)}</p>
    );
    i++;
  }

  flushList();
  flushTable();
  return <div className="space-y-0.5">{blocks}</div>;
}
