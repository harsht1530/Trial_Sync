import { CheckCircle2, XCircle, AlertTriangle, Clock, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const validationData = [
  {
    category: "Data Completeness",
    passed: 1247,
    failed: 23,
    pending: 45,
    trend: "+5.2%",
    status: "healthy",
  },
  {
    category: "Protocol Adherence",
    passed: 1189,
    failed: 56,
    pending: 70,
    trend: "+2.8%",
    status: "warning",
  },
  {
    category: "Range Validation",
    passed: 1302,
    failed: 8,
    pending: 5,
    trend: "+8.1%",
    status: "healthy",
  },
  {
    category: "Anomaly Detection",
    passed: 1198,
    failed: 87,
    pending: 30,
    trend: "-1.2%",
    status: "critical",
  },
];

const statusColors = {
  healthy: "bg-success",
  warning: "bg-warning",
  critical: "bg-destructive",
};

export function ValidationStatus() {
  const totalPassed = validationData.reduce((acc, item) => acc + item.passed, 0);
  const totalFailed = validationData.reduce((acc, item) => acc + item.failed, 0);
  const totalPending = validationData.reduce((acc, item) => acc + item.pending, 0);
  const total = totalPassed + totalFailed + totalPending;
  const passRate = ((totalPassed / total) * 100).toFixed(1);

  return (
    <div className="rounded-xl bg-card shadow-card overflow-hidden animate-slide-up" style={{ animationDelay: "300ms" }}>
      <div className="p-6 border-b border-border">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold">AI Validation Status</h3>
            <p className="text-sm text-muted-foreground">Real-time data quality monitoring</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-success">{passRate}%</p>
            <p className="text-xs text-muted-foreground">Pass Rate</p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-success/5">
            <CheckCircle2 className="h-5 w-5 text-success" />
            <div>
              <p className="text-lg font-semibold">{totalPassed.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Passed</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-destructive/5">
            <XCircle className="h-5 w-5 text-destructive" />
            <div>
              <p className="text-lg font-semibold">{totalFailed}</p>
              <p className="text-xs text-muted-foreground">Failed</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-warning/5">
            <Clock className="h-5 w-5 text-warning" />
            <div>
              <p className="text-lg font-semibold">{totalPending}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="divide-y divide-border">
        {validationData.map((item) => (
          <div key={item.category} className="flex items-center justify-between p-4 hover:bg-secondary/20 transition-colors">
            <div className="flex items-center gap-3">
              <div className={cn("h-2 w-2 rounded-full", statusColors[item.status as keyof typeof statusColors])} />
              <span className="font-medium text-sm">{item.category}</span>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4 text-sm">
                <span className="text-success">{item.passed}</span>
                <span className="text-destructive">{item.failed}</span>
                <span className="text-warning">{item.pending}</span>
              </div>
              <div className={cn(
                "flex items-center gap-1 text-xs font-medium",
                item.trend.startsWith("+") ? "text-success" : "text-destructive"
              )}>
                <TrendingUp className={cn("h-3 w-3", !item.trend.startsWith("+") && "rotate-180")} />
                {item.trend}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
