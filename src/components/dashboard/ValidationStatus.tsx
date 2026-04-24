import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, AlertTriangle, Clock, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from "@/lib/api";



const statusColors = {
  healthy: "bg-success",
  warning: "bg-warning",
  critical: "bg-destructive",
};

export function ValidationStatus() {
  const [validationData, setValidationData] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/dashboard/validation-status`)
      .then(res => res.json())
      .then(data => setValidationData(data))
      .catch(err => console.error(err));
  }, []);
  const totalPassed = validationData.reduce((acc, item) => acc + item.passed, 0);
  const totalFailed = validationData.reduce((acc, item) => acc + item.failed, 0);
  const totalPending = validationData.reduce((acc, item) => acc + item.pending, 0);
  const total = totalPassed + totalFailed + totalPending;
  const passRate = total > 0 ? ((totalPassed / total) * 100).toFixed(1) : "0.0";

  return (
    <div className="h-full rounded-xl bg-card shadow-card overflow-hidden animate-slide-up" style={{ animationDelay: "300ms" }}>
      <div className="p-4 sm:p-6 border-b border-border">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-base sm:text-lg font-semibold">AI Validation Status</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">Real-time quality monitoring</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-2xl sm:text-3xl font-bold text-success">{passRate}%</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Pass Rate</p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-4 sm:mt-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-1 sm:gap-3 p-2 sm:p-3 rounded-lg bg-success/5 text-center sm:text-left">
            <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-success mt-0.5" />
            <div>
              <p className="text-sm sm:text-lg font-semibold">{totalPassed.toLocaleString()}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Passed</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-1 sm:gap-3 p-2 sm:p-3 rounded-lg bg-destructive/5 text-center sm:text-left">
            <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-destructive mt-0.5" />
            <div>
              <p className="text-sm sm:text-lg font-semibold">{totalFailed}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Failed</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-1 sm:gap-3 p-2 sm:p-3 rounded-lg bg-warning/5 text-center sm:text-left">
            <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-warning mt-0.5" />
            <div>
              <p className="text-sm sm:text-lg font-semibold">{totalPending}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Pending</p>
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
                (item.trend || "").startsWith("+") ? "text-success" : "text-destructive"
              )}>
                <TrendingUp className={cn("h-3 w-3", !(item.trend || "").startsWith("+") && "rotate-180")} />
                {item.trend || "0%"}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
