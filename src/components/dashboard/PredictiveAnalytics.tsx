import { Brain, TrendingUp, TrendingDown, AlertTriangle, Activity, Target } from "lucide-react";
import { cn } from "@/lib/utils";

const predictions = [
  {
    title: "Dropout Risk",
    value: "12.3%",
    trend: "down",
    change: "-2.1%",
    description: "Predicted patient dropout rate for next 30 days",
    icon: TrendingDown,
    color: "success",
    patients: 18,
  },
  {
    title: "Adverse Events",
    value: "5.7%",
    trend: "up",
    change: "+0.8%",
    description: "Probability of AE occurrence in active cohort",
    icon: AlertTriangle,
    color: "warning",
    patients: 8,
  },
  {
    title: "Efficacy Signal",
    value: "73.2%",
    trend: "up",
    change: "+3.5%",
    description: "Positive response prediction based on biomarkers",
    icon: Target,
    color: "primary",
    patients: 108,
  },
  {
    title: "Compliance Score",
    value: "89.4%",
    trend: "up",
    change: "+1.2%",
    description: "Expected protocol adherence for active patients",
    icon: Activity,
    color: "accent",
    patients: 132,
  },
];

const colorConfig = {
  success: "from-success/20 to-success/5 border-success/30",
  warning: "from-warning/20 to-warning/5 border-warning/30",
  primary: "from-primary/20 to-primary/5 border-primary/30",
  accent: "from-accent/20 to-accent/5 border-accent/30",
  destructive: "from-destructive/20 to-destructive/5 border-destructive/30",
};

const iconColors = {
  success: "text-success bg-success/10",
  warning: "text-warning bg-warning/10",
  primary: "text-primary bg-primary/10",
  accent: "text-accent bg-accent/10",
  destructive: "text-destructive bg-destructive/10",
};

export function PredictiveAnalytics() {
  return (
    <div className="rounded-xl bg-card shadow-card overflow-hidden animate-slide-up" style={{ animationDelay: "600ms" }}>
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-accent">
            <Brain className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Predictive Analytics</h3>
            <p className="text-sm text-muted-foreground">AI-powered trial insights and predictions</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 p-6">
        {predictions.map((prediction) => (
          <div
            key={prediction.title}
            className={cn(
              "relative p-5 rounded-xl border bg-gradient-to-br overflow-hidden transition-all hover:shadow-md",
              colorConfig[prediction.color as keyof typeof colorConfig]
            )}
          >
            {/* Background decoration */}
            <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-gradient-to-br from-background/20 to-transparent blur-xl" />
            
            <div className="relative">
              <div className="flex items-start justify-between mb-3">
                <div className={cn("p-2 rounded-lg", iconColors[prediction.color as keyof typeof iconColors])}>
                  <prediction.icon className="h-4 w-4" />
                </div>
                <div className={cn(
                  "flex items-center gap-1 text-xs font-medium",
                  prediction.trend === "up" 
                    ? prediction.color === "warning" || prediction.color === "destructive" 
                      ? "text-destructive" 
                      : "text-success"
                    : "text-success"
                )}>
                  {prediction.trend === "up" ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {prediction.change}
                </div>
              </div>

              <p className="text-sm font-medium text-muted-foreground mb-1">{prediction.title}</p>
              <p className="text-3xl font-bold mb-2">{prediction.value}</p>
              <p className="text-xs text-muted-foreground line-clamp-2">{prediction.description}</p>
              
              <div className="mt-3 pt-3 border-t border-border/50">
                <p className="text-xs">
                  <span className="font-semibold">{prediction.patients}</span>
                  <span className="text-muted-foreground"> patients affected</span>
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
