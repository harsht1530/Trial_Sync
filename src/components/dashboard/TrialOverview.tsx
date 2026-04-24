import { useEffect, useState } from "react";
import { Calendar, Users, FlaskConical, Target, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from "@/lib/api";



const statusConfig = {
  enrolling: { label: "Enrolling", className: "bg-primary/10 text-primary" },
  active: { label: "Active", className: "bg-success/10 text-success" },
  completed: { label: "Completed", className: "bg-muted text-muted-foreground" },
};

export function TrialOverview() {
  const [trials, setTrials] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/dashboard/trials`)
      .then(res => res.json())
      .then(data => setTrials(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="h-full rounded-xl bg-card shadow-card overflow-hidden animate-slide-up" style={{ animationDelay: "500ms" }}>
      <div className="p-4 sm:p-6 border-b border-border">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h3 className="text-base sm:text-lg font-semibold">Active Trials</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">Clinical trial progress</p>
          </div>
          <Button variant="outline" size="sm" className="h-8 sm:h-9 text-xs sm:text-sm">
            All Trials
            <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 ml-1" />
          </Button>
        </div>
      </div>

      <div className="divide-y divide-border">
        {trials.map((trial) => {
          const status = statusConfig[trial.status as keyof typeof statusConfig];

          return (
            <div key={trial.id} className="p-4 sm:p-6 hover:bg-secondary/20 transition-colors">
              <div className="flex items-start justify-between gap-3 mb-3 sm:mb-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] sm:text-xs font-mono text-muted-foreground">{trial.id}</span>
                    <span className={cn("px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium", status.className)}>
                      {status.label}
                    </span>
                  </div>
                  <h4 className="font-semibold text-sm sm:text-base truncate">{trial.name}</h4>
                </div>
                <span className="flex-shrink-0 px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg bg-secondary text-xs sm:text-sm font-medium">{trial.phase}</span>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Enrollment Progress</span>
                  <span className="text-sm font-medium">{trial.progress}%</span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                    style={{ width: `${trial.progress}%` }}
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 min-[400px]:grid-cols-3 gap-3 sm:gap-4 px-2">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs sm:text-sm font-semibold">{trial.patients}/{trial.target}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Subjects</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <FlaskConical className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs sm:text-sm font-semibold">{trial.sites}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Sites</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-semibold truncate">{trial.startDate}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Started</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
