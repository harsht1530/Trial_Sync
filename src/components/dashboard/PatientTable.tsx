import { MoreHorizontal, CheckCircle2, AlertTriangle, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const patients = [
  {
    id: "PT-001",
    name: "John Martinez",
    age: 45,
    trial: "ONCO-2024-A1",
    phase: "Phase 2",
    status: "active",
    compliance: 98,
    lastVisit: "2 hours ago",
    riskLevel: "low",
  },
  {
    id: "PT-002",
    name: "Emily Watson",
    age: 52,
    trial: "CARDIO-2024-B3",
    phase: "Phase 3",
    status: "review",
    compliance: 85,
    lastVisit: "1 day ago",
    riskLevel: "medium",
  },
  {
    id: "PT-003",
    name: "Robert Chen",
    age: 38,
    trial: "NEURO-2024-C2",
    phase: "Phase 2",
    status: "active",
    compliance: 92,
    lastVisit: "5 hours ago",
    riskLevel: "low",
  },
  {
    id: "PT-004",
    name: "Maria Garcia",
    age: 61,
    trial: "ONCO-2024-A1",
    phase: "Phase 2",
    status: "alert",
    compliance: 67,
    lastVisit: "3 days ago",
    riskLevel: "high",
  },
  {
    id: "PT-005",
    name: "David Kim",
    age: 49,
    trial: "CARDIO-2024-B3",
    phase: "Phase 3",
    status: "active",
    compliance: 95,
    lastVisit: "12 hours ago",
    riskLevel: "low",
  },
];

const statusConfig = {
  active: { label: "Active", icon: CheckCircle2, className: "bg-success/10 text-success border-success/20" },
  review: { label: "Review", icon: Clock, className: "bg-warning/10 text-warning border-warning/20" },
  alert: { label: "Alert", icon: AlertTriangle, className: "bg-destructive/10 text-destructive border-destructive/20" },
};

const riskConfig = {
  low: "bg-success/10 text-success",
  medium: "bg-warning/10 text-warning",
  high: "bg-destructive/10 text-destructive",
};

export function PatientTable() {
  const navigate = useNavigate();

  const handlePatientClick = (patientId: string) => {
    navigate(`/patient/${patientId}`);
  };

  return (
    <div className="rounded-xl bg-card shadow-card overflow-hidden animate-slide-up" style={{ animationDelay: "200ms" }}>
      <div className="flex items-center justify-between p-6 border-b border-border">
        <div>
          <h3 className="text-lg font-semibold">Active Patients</h3>
          <p className="text-sm text-muted-foreground">Monitor patient status and compliance</p>
        </div>
        <Button variant="outline" size="sm">
          View All
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Patient
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Trial
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Compliance
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Risk
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Last Activity
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {patients.map((patient) => {
              const status = statusConfig[patient.status as keyof typeof statusConfig];
              const StatusIcon = status.icon;
              
              return (
                <tr 
                  key={patient.id} 
                  className="hover:bg-secondary/20 transition-colors cursor-pointer"
                  onClick={() => handlePatientClick(patient.id)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                        <User className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{patient.name}</p>
                        <p className="text-sm text-muted-foreground">{patient.id} • Age {patient.age}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-sm">{patient.trial}</p>
                    <p className="text-xs text-muted-foreground">{patient.phase}</p>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="outline" className={cn("gap-1", status.className)}>
                      <StatusIcon className="h-3 w-3" />
                      {status.label}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-20 rounded-full bg-secondary overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all",
                            patient.compliance >= 90 ? "bg-success" :
                            patient.compliance >= 70 ? "bg-warning" : "bg-destructive"
                          )}
                          style={{ width: `${patient.compliance}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{patient.compliance}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize",
                      riskConfig[patient.riskLevel as keyof typeof riskConfig]
                    )}>
                      {patient.riskLevel}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-muted-foreground">{patient.lastVisit}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
