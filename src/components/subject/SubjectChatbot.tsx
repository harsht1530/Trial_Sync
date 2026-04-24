import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { API_BASE_URL } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bot,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  User,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
  Pill,
  Activity,
  Calendar,
  MessageSquare,
  Phone,
  Maximize2,
  Minimize2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  type?: "text" | "symptom-check" | "medication" | "appointment" | "alert";
  metadata?: {
    severity?: "low" | "medium" | "high";
    action?: string;
    followUp?: boolean;
  };
}

interface PatientChatbotProps {
  patientId: string;
  patientName: string;
}

// History will be fetched from the backend

const quickResponses = [
  { label: "Symptom Check", icon: Activity, message: "I'd like to report some symptoms" },
  { label: "Medication", icon: Pill, message: "Question about my medication" },
  { label: "Schedule Visit", icon: Calendar, message: "I need to schedule a visit" },
  { label: "Emergency", icon: AlertCircle, message: "I'm experiencing a serious issue" }
];

export const PatientChatbot = ({ patientId, patientName }: PatientChatbotProps) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isMicActive, setIsMicActive] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Fetch History
    fetch(`${API_BASE_URL}/api/communications/chat/history?patientId=${patientId}`)
      .then(res => res.json())
      .then(data => {
        if (data.length === 0) {
          // Add a welcome message if no history exists
          setMessages([{
            id: "sys-start",
            role: "assistant",
            content: `Hello ${(patientName || "Subject").split(" ")[0]}! I'm your AI Health Assistant for the clinical trial. How are you feeling today?`,
            timestamp: new Date(),
            type: "text"
          }]);
        } else {
          setMessages((data || []).map((m: any) => ({
            ...m,
            id: m._id,
            timestamp: new Date(m.timestamp)
          })));
        }
      })
      .catch(console.error);
  }, [patientId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Note: generateBotResponse is replaced by backend AI logic

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
      const response = await fetch(`${API_BASE_URL}/api/communications/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId,
          message: content.trim()
        })
      });

      const data = await response.json();
      
      const botMessage: Message = {
        id: data._id,
        role: "assistant",
        content: data.content,
        timestamp: new Date(data.timestamp),
        type: data.metadata?.clinicalExtraction?.isAdverseEvent ? "alert" : 
              data.metadata?.clinicalExtraction?.symptom ? "symptom-check" : "text",
        metadata: data.metadata?.clinicalExtraction ? {
          severity: data.metadata.clinicalExtraction.severity >= 7 ? "high" : 
                    data.metadata.clinicalExtraction.severity >= 4 ? "medium" : "low"
        } : undefined
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      console.error(err);
      toast({
        title: "Assistant Offline",
        description: "Could not connect to the AI service.",
        variant: "destructive"
      });
    } finally {
      setIsTyping(false);
    }

    if (isSoundEnabled) {
      // Notification sound logic
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
      toast({
        title: "Voice Input Active",
        description: "Speak your message. Click again to stop."
      });
    } else {
      toast({
        title: "Voice Input Stopped",
        description: "Processing your speech..."
      });
      // Simulate voice to text
      setTimeout(() => {
        setInputValue("I wanted to ask about my next medication dose.");
      }, 1000);
    }
  };

  const initiateVoiceCall = () => {
    toast({
      title: "Voice Call Starting",
      description: "Connecting to AI voice assistant..."
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getMessageStyle = (message: Message) => {
    if (message.role === "system") return "bg-muted/50 text-muted-foreground text-center text-xs py-2";
    if (message.role === "user") return "bg-primary text-primary-foreground ml-auto";

    switch (message.type) {
      case "alert":
        return "bg-destructive/10 border border-destructive/20";
      case "symptom-check":
        return "bg-accent/10 border border-accent/20";
      case "medication":
        return "bg-success/10 border border-success/20";
      case "appointment":
        return "bg-primary/10 border border-primary/20";
      default:
        return "bg-secondary";
    }
  };

  return (
    <Card className={cn(
      "flex flex-col transition-all duration-300",
      isExpanded ? "fixed inset-4 z-50" : "h-[600px]"
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
              <Badge variant="outline" className="text-xs font-normal">
                <Sparkles className="h-3 w-3 mr-1" />
                Online
              </Badge>
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              For {patientName} • Subject ID: {patientId}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={initiateVoiceCall}
          >
            <Phone className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsSoundEnabled(!isSoundEnabled)}
          >
            {isSoundEnabled ? (
              <Volume2 className="h-4 w-4" />
            ) : (
              <VolumeX className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                message.role === "user" && "justify-end",
                message.role === "system" && "justify-center"
              )}
            >
              {message.role === "assistant" && (
                <div className="flex-shrink-0">
                  <div className="p-1.5 rounded-full bg-gradient-to-br from-primary/20 to-accent/20">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                </div>
              )}

              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-3",
                  message.role === "system" && "max-w-full rounded-lg",
                  getMessageStyle(message)
                )}
              >
                {message.role !== "system" && (
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {message.content}
                  </div>
                )}
                {message.role === "system" && (
                  <div className="flex items-center justify-center gap-2">
                    <Clock className="h-3 w-3" />
                    {message.content}
                  </div>
                )}
                {message.role !== "system" && (
                  <div className={cn(
                    "flex items-center gap-1 mt-2 text-xs",
                    message.role === "user" ? "text-primary-foreground/70 justify-end" : "text-muted-foreground"
                  )}>
                    <Clock className="h-3 w-3" />
                    {formatTime(message.timestamp)}
                    {message.role === "user" && (
                      <CheckCircle2 className="h-3 w-3 ml-1" />
                    )}
                  </div>
                )}
              </div>

              {message.role === "user" && (
                <div className="flex-shrink-0">
                  <div className="p-1.5 rounded-full bg-primary">
                    <User className="h-4 w-4 text-primary-foreground" />
                  </div>
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="p-1.5 rounded-full bg-gradient-to-br from-primary/20 to-accent/20">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
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
      </ScrollArea>

      {/* Quick Responses */}
      <div className="px-4 py-2 border-t flex gap-2 overflow-x-auto">
        {quickResponses.map((quick) => (
          <Button
            key={quick.label}
            variant="outline"
            size="sm"
            className="flex-shrink-0 gap-1.5 text-xs"
            onClick={() => sendMessage(quick.message)}
          >
            <quick.icon className="h-3 w-3" />
            {quick.label}
          </Button>
        ))}
      </div>

      {/* Input Area */}
      <CardContent className="p-4 border-t">
        <div className="flex items-center gap-2">
          <Button
            variant={isMicActive ? "destructive" : "outline"}
            size="icon"
            className="flex-shrink-0"
            onClick={toggleMic}
          >
            {isMicActive ? (
              <MicOff className="h-4 w-4" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </Button>
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1"
            disabled={isMicActive}
          />
          <Button
            variant="gradient"
            size="icon"
            onClick={() => sendMessage(inputValue)}
            disabled={!inputValue.trim() || isTyping}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-2">
          <MessageSquare className="h-3 w-3 inline mr-1" />
          All conversations are encrypted and logged for your care team
        </p>
      </CardContent>
    </Card>
  );
};
