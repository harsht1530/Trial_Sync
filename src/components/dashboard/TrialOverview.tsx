import { Calendar, Users, FlaskConical, Target, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const trials = [
  {
    id: "ONCO-2024-A1",
    name: "Advanced Melanoma Treatment",
    phase: "Phase 2",
    patients: 156,
    target: 200,
    sites: 12,
    startDate: "Jan 15, 2024",
    status: "enrolling",
    progress: 78,
  },
  {
    id: "CARDIO-2024-B3",
    name: "Cardiac Arrhythmia Study",
    phase: "Phase 3",
    patients: 423,
    target: 500,
    sites: 28,
    startDate: "Nov 3, 2023",
    status: "active",
    progress: 85,
  },
  {
    id: "NEURO-2024-C2",
    name: "Parkinson's Disease Trial",
    phase: "Phase 2",
    patients: 89,
    target: 150,
    sites: 8,
    startDate: "Mar 1, 2024",
    status: "enrolling",
    progress: 59,
  },
];

const statusConfig = {
  enrolling: { label: "Enrolling", className: "bg-primary/10 text-primary" },
  active: { label: "Active", className: "bg-success/10 text-success" },
  completed: { label: "Completed", className: "bg-muted text-muted-foreground" },
};

export function TrialOverview() {
  return (
    <div className="rounded-xl bg-card shadow-card overflow-hidden animate-slide-up" style={{ animationDelay: "500ms" }}>
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Active Trials</h3>
            <p className="text-sm text-muted-foreground">Clinical trial progress overview</p>
          </div>
          <Button variant="outline" size="sm">
            All Trials
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>

      <div className="divide-y divide-border">
        {trials.map((trial) => {
          const status = statusConfig[trial.status as keyof typeof statusConfig];
          
          return (
            <div key={trial.id} className="p-6 hover:bg-secondary/20 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-muted-foreground">{trial.id}</span>
                    <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", status.className)}>
                      {status.label}
                    </span>
                  </div>
                  <h4 className="font-semibold">{trial.name}</h4>
                </div>
                <span className="px-3 py-1 rounded-lg bg-secondary text-sm font-medium">{trial.phase}</span>
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
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-semibold">{trial.patients}/{trial.target}</p>
                    <p className="text-xs text-muted-foreground">Patients</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <FlaskConical className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-semibold">{trial.sites}</p>
                    <p className="text-xs text-muted-foreground">Sites</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-semibold">{trial.startDate}</p>
                    <p className="text-xs text-muted-foreground">Started</p>
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
