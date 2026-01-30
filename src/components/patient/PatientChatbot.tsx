import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

const initialMessages: Message[] = [
  {
    id: "sys-1",
    role: "system",
    content: "Conversation started with AI Health Assistant",
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    type: "text"
  },
  {
    id: "bot-1",
    role: "assistant",
    content: "Hello Sarah! I'm your AI Health Assistant for the clinical trial. How are you feeling today? I'm here to help with medication reminders, symptom tracking, and answering any questions about your treatment.",
    timestamp: new Date(Date.now() - 1000 * 60 * 29),
    type: "text"
  },
  {
    id: "user-1",
    role: "user",
    content: "Hi! I've been having some mild headaches the past couple of days.",
    timestamp: new Date(Date.now() - 1000 * 60 * 28),
    type: "text"
  },
  {
    id: "bot-2",
    role: "assistant",
    content: "Thank you for letting me know about the headaches. I'd like to ask a few questions to better understand your symptoms:\n\n1. On a scale of 1-10, how would you rate the pain?\n2. When do the headaches typically occur?\n3. Have you noticed any other symptoms alongside the headaches?",
    timestamp: new Date(Date.now() - 1000 * 60 * 27),
    type: "symptom-check",
    metadata: { severity: "low", followUp: true }
  },
  {
    id: "user-2",
    role: "user",
    content: "The pain is about a 4. They usually happen in the afternoon, and sometimes I feel a bit tired too.",
    timestamp: new Date(Date.now() - 1000 * 60 * 25),
    type: "text"
  },
  {
    id: "bot-3",
    role: "assistant",
    content: "I've logged your symptoms: mild headache (4/10) and fatigue, occurring in afternoons. This information has been recorded in your trial records.\n\n✅ Symptoms logged\n📋 Added to your health record\n👨‍⚕️ Care team notified\n\nFor mild headaches, ensure you're staying hydrated. If symptoms worsen or persist beyond 3 days, please contact your care team. Would you like me to schedule a follow-up call?",
    timestamp: new Date(Date.now() - 1000 * 60 * 24),
    type: "symptom-check",
    metadata: { severity: "low", action: "logged", followUp: true }
  }
];

const quickResponses = [
  { label: "Symptom Check", icon: Activity, message: "I'd like to report some symptoms" },
  { label: "Medication", icon: Pill, message: "Question about my medication" },
  { label: "Schedule Visit", icon: Calendar, message: "I need to schedule a visit" },
  { label: "Emergency", icon: AlertCircle, message: "I'm experiencing a serious issue" }
];

export const PatientChatbot = ({ patientId, patientName }: PatientChatbotProps) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isMicActive, setIsMicActive] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const generateBotResponse = (userMessage: string): Message => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes("medication") || lowerMessage.includes("pill") || lowerMessage.includes("dose")) {
      return {
        id: `bot-${Date.now()}`,
        role: "assistant",
        content: "Your current medication schedule:\n\n💊 **Trial Medication (ABC-123)**\n• Morning: 1 tablet at 8:00 AM\n• Evening: 1 tablet at 8:00 PM\n\n⏰ Next dose: Today at 8:00 PM\n\nRemember to take medication with food. Would you like me to set up a reminder?",
        timestamp: new Date(),
        type: "medication"
      };
    }
    
    if (lowerMessage.includes("symptom") || lowerMessage.includes("feeling") || lowerMessage.includes("pain")) {
      return {
        id: `bot-${Date.now()}`,
        role: "assistant",
        content: "I'm here to help track your symptoms. Please describe what you're experiencing, and rate any discomfort on a scale of 1-10.\n\nCommon areas to report:\n• Pain or discomfort\n• Energy levels\n• Sleep quality\n• Appetite changes\n• Mood changes\n\nYour responses will be securely logged and shared with your care team.",
        timestamp: new Date(),
        type: "symptom-check",
        metadata: { followUp: true }
      };
    }
    
    if (lowerMessage.includes("visit") || lowerMessage.includes("appointment") || lowerMessage.includes("schedule")) {
      return {
        id: `bot-${Date.now()}`,
        role: "assistant",
        content: "I can help you with scheduling. Here are your options:\n\n📅 **Next Scheduled Visit**\nJanuary 25, 2024 at 10:00 AM\nNew York Clinical Center\n\n**Available Actions:**\n• Confirm your attendance\n• Request to reschedule\n• Ask about visit preparation\n\nWould you like me to send you a reminder the day before?",
        timestamp: new Date(),
        type: "appointment"
      };
    }
    
    if (lowerMessage.includes("emergency") || lowerMessage.includes("serious") || lowerMessage.includes("urgent")) {
      return {
        id: `bot-${Date.now()}`,
        role: "assistant",
        content: "🚨 **I understand this may be urgent.**\n\nIf you're experiencing a medical emergency, please:\n1. Call 911 immediately\n2. Contact your study coordinator: (555) 123-4567\n\nWould you like me to:\n• Connect you with the on-call nurse?\n• Alert your care team immediately?\n• Log this as an adverse event?\n\nPlease describe what you're experiencing so I can help appropriately.",
        timestamp: new Date(),
        type: "alert",
        metadata: { severity: "high", followUp: true }
      };
    }
    
    return {
      id: `bot-${Date.now()}`,
      role: "assistant",
      content: `Thank you for your message. I'm here to help with:\n\n• 📊 Symptom tracking and reporting\n• 💊 Medication reminders and questions\n• 📅 Visit scheduling and reminders\n• ❓ General trial questions\n\nHow can I assist you today, ${patientName.split(" ")[0]}?`,
      timestamp: new Date(),
      type: "text"
    };
  };

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
      type: "text"
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate typing delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    const botResponse = generateBotResponse(content);
    setMessages(prev => [...prev, botResponse]);
    setIsTyping(false);

    if (isSoundEnabled) {
      // Would play notification sound here
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
              For {patientName} • Patient ID: {patientId}
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
