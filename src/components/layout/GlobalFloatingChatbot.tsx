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
  Maximize2, Minimize2, X
} from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

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
  
  const quickResponses = isDataRoute ? [
    { label: "Analyze Trends", icon: Activity, message: "Can you analyze the latest data trends?" },
    { label: "Check Records", icon: Calendar, message: "Show me recent symptom reports." },
    { label: "Data Summary", icon: MessageSquare, message: "Give me a summary of the analytics." }
  ] : [
    { label: "General Info", icon: Bot, message: "What can you help me with?" },
    { label: "Medication", icon: Pill, message: "Question about my medication." },
    { label: "Emergency", icon: AlertCircle, message: "I'm experiencing an issue." }
  ];

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
      const response = await fetch(`${API_BASE_URL}/api/agent/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content.trim(), agentId })
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

  const getMessageStyle = (message: Message) => {
    if (message.role === "system") return "bg-muted/50 text-muted-foreground text-center text-xs py-2";
    if (message.role === "user") return "bg-primary text-primary-foreground ml-auto";
    switch (message.type) {
      case "alert": return "bg-destructive/10 border border-destructive/20";
      case "symptom-check": return "bg-accent/10 border border-accent/20";
      case "medication": return "bg-success/10 border border-success/20";
      case "appointment": return "bg-primary/10 border border-primary/20";
      default: return "bg-secondary";
    }
  };

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
                  <Bot className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-success border-2 border-background" />
              </div>
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  AI Health Assistant
                  <Badge variant="outline" className="text-[10px] font-normal px-1 py-0">
                    <Sparkles className="h-2 w-2 mr-1" />
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

          <div className="flex-1 overflow-y-auto p-4" ref={scrollRef}>
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
                  <div className={cn("max-w-[80%] rounded-2xl px-4 py-3", message.role === "system" && "max-w-full rounded-lg", getMessageStyle(message))}>
                    {message.role !== "system" && (
                      <div className="text-sm leading-relaxed">
                        <ReactMarkdown
                          components={{
                            p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                            ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-2" {...props} />,
                            ol: ({node, ...props}) => <ol className="list-decimal pl-4 mb-2" {...props} />,
                            li: ({node, ...props}) => <li className="mb-1" {...props} />,
                            strong: ({node, ...props}) => <strong className="font-semibold" {...props} />,
                            a: ({node, ...props}) => <a className="text-primary underline underline-offset-2" {...props} />
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    )}
                    {message.role === "system" && (
                      <div className="flex items-center justify-center gap-2"><Clock className="h-3 w-3" />{message.content}</div>
                    )}
                    {message.role !== "system" && (
                      <div className={cn("flex items-center gap-1 mt-2 text-[10px]", message.role === "user" ? "text-primary-foreground/70 justify-end" : "text-muted-foreground")}>
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
                  <div className="bg-secondary rounded-2xl px-4 py-3">
                    <div className="flex gap-1">
                      <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
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
