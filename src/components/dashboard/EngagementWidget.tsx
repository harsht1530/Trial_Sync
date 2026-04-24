import { useEffect, useState } from "react";
import { MessageSquare, Phone, Mail, TrendingUp, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from "@/lib/api";

const iconMap: Record<string, any> = {
  "Chatbot": Bot,
  "Voice Calls": Phone,
  "SMS": MessageSquare,
  "Email": Mail,
};



export function EngagementWidget() {
  const [recentEngagements, setRecentEngagements] = useState<any[]>([]);
  const [engagementStats, setEngagementStats] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/dashboard/activity`)
      .then(res => res.json())
      .then(data => setRecentEngagements(data))
      .catch(err => console.error(err));

    fetch(`${API_BASE_URL}/api/dashboard/engagement`)
      .then(res => res.json())
      .then(data => {
        const mappedData = data.map((item: any) => ({ ...item, icon: iconMap[item.channel] || Bot }));
        setEngagementStats(mappedData);
      })
      .catch(err => console.error(err));
  }, []);
  return (
    <div className="h-full rounded-xl bg-card shadow-card overflow-hidden animate-slide-up" style={{ animationDelay: "400ms" }}>
      <div className="p-4 sm:p-6 border-b border-border">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h3 className="text-base sm:text-lg font-semibold">Subject Engagement</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">AI-powered communication</p>
          </div>
          <Button variant="gradient" size="sm" className="h-8 sm:h-9 text-xs">
            <Bot className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
            Launch
          </Button>
        </div>
      </div>

      {/* Channel Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 p-4 sm:p-6 border-b border-border">
        {engagementStats.map((stat) => (
          <div
            key={stat.channel}
            className="p-3 sm:p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
          >
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
              <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10">
                <stat.icon className="h-3.5 w-3.5 sm:h-4 w-4 text-primary" />
              </div>
              <span className="font-medium text-xs sm:text-sm truncate">{stat.channel}</span>
            </div>
            <div className="flex items-end justify-between gap-1">
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-bold truncate">{stat.interactions.toLocaleString()}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">interactions</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs sm:text-sm font-medium">{stat.response}</p>
                <p className={cn(
                  "text-[10px] sm:text-xs",
                  (stat.trend || "").startsWith("+") ? "text-success" : "text-destructive"
                )}>
                  {stat.trend || "0%"}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="p-3 sm:p-4">
        <p className="px-2 mb-2 sm:mb-3 text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Recent Activity
        </p>
        <div className="space-y-1 sm:space-y-2">
          {recentEngagements.map((engagement, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 sm:p-3 rounded-lg hover:bg-secondary/30 transition-colors"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-secondary flex items-center justify-center">
                  <span className="text-[10px] sm:text-xs font-medium">{engagement.initials}</span>
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium">{engagement.patient}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">{engagement.type}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={cn(
                  "text-[10px] sm:text-xs font-medium capitalize",
                  engagement.outcome === "completed" && "text-success",
                  engagement.outcome === "delivered" && "text-primary",
                  engagement.outcome === "pending" && "text-warning"
                )}>
                  {engagement.outcome}
                </p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">{engagement.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
