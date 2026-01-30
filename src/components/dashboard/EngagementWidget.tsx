import { MessageSquare, Phone, Mail, TrendingUp, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const engagementStats = [
  { channel: "Chatbot", icon: Bot, interactions: 1847, response: "98%", trend: "+12%" },
  { channel: "Voice Calls", icon: Phone, interactions: 423, response: "94%", trend: "+8%" },
  { channel: "SMS", icon: MessageSquare, interactions: 2156, response: "87%", trend: "+5%" },
  { channel: "Email", icon: Mail, interactions: 892, response: "72%", trend: "-2%" },
];

const recentEngagements = [
  { patient: "John M.", type: "Symptom Check", time: "5 min ago", status: "completed" },
  { patient: "Emily W.", type: "Reminder Sent", time: "15 min ago", status: "delivered" },
  { patient: "Robert C.", type: "Voice Follow-up", time: "1 hour ago", status: "completed" },
  { patient: "Maria G.", type: "Alert Response", time: "2 hours ago", status: "pending" },
];

export function EngagementWidget() {
  return (
    <div className="rounded-xl bg-card shadow-card overflow-hidden animate-slide-up" style={{ animationDelay: "400ms" }}>
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Patient Engagement</h3>
            <p className="text-sm text-muted-foreground">AI-powered communication channels</p>
          </div>
          <Button variant="gradient" size="sm">
            <Bot className="h-4 w-4 mr-1" />
            Launch Bot
          </Button>
        </div>
      </div>

      {/* Channel Stats */}
      <div className="grid grid-cols-2 gap-4 p-6 border-b border-border">
        {engagementStats.map((stat) => (
          <div
            key={stat.channel}
            className="p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <stat.icon className="h-4 w-4 text-primary" />
              </div>
              <span className="font-medium text-sm">{stat.channel}</span>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-bold">{stat.interactions.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">interactions</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{stat.response}</p>
                <p className={cn(
                  "text-xs",
                  stat.trend.startsWith("+") ? "text-success" : "text-destructive"
                )}>
                  {stat.trend}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="p-4">
        <p className="px-2 mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Recent Activity
        </p>
        <div className="space-y-2">
          {recentEngagements.map((engagement, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                  <span className="text-xs font-medium">{engagement.patient.split(" ")[0][0]}</span>
                </div>
                <div>
                  <p className="text-sm font-medium">{engagement.patient}</p>
                  <p className="text-xs text-muted-foreground">{engagement.type}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={cn(
                  "text-xs font-medium capitalize",
                  engagement.status === "completed" && "text-success",
                  engagement.status === "delivered" && "text-primary",
                  engagement.status === "pending" && "text-warning"
                )}>
                  {engagement.status}
                </p>
                <p className="text-xs text-muted-foreground">{engagement.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
