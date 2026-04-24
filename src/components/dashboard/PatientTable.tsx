import { useEffect, useState } from "react";
import { MoreHorizontal, CheckCircle2, AlertTriangle, Clock, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from "@/lib/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";



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
  const { toast } = useToast();
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [escalateSubjectId, setEscalateSubjectId] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/dashboard/subject`)
      .then(res => res.json())
      .then(data => {
        setPatients(data.slice(0, 5));
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching subjects:', err);
        setLoading(false);
      });
  }, []);

  const handlePatientClick = (patientId: string) => {
    navigate(`/subjects/${patientId}`);
  };

  return (
    <div className="rounded-xl bg-card shadow-card overflow-hidden animate-slide-up" style={{ animationDelay: "200ms" }}>
      <div className="flex items-center justify-between p-6 border-b border-border">
        <div>
          <h3 className="text-lg font-semibold">Active Subjects</h3>
          <p className="text-sm text-muted-foreground">Monitor subject status and compliance</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate('/subject')}>
          View All
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Subject
              </th>
              <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Trial
              </th>
              <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Status
              </th>
              <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Compliance
              </th>
              <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Risk
              </th>
              <th className="hidden xl:table-cell px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Last Activity
              </th>
              <th className="px-4 sm:px-6 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
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
                  className={cn(
                    "hover:bg-secondary/20 transition-colors cursor-pointer",
                    patient.status === 'alert' && "bg-destructive/5"
                  )}
                  onClick={() => handlePatientClick(patient.id)}
                >
                  <td className={cn(
                    "px-4 sm:px-6 py-4 border-l-4",
                    patient.status === 'alert' ? "border-l-destructive" : "border-l-transparent"
                  )}>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-secondary">
                        <User className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm sm:text-base truncate">{patient.name}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">{patient.id} • {patient.age}</p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden md:table-cell px-6 py-4">
                    <p className="font-medium text-sm">{patient.trial}</p>
                    <p className="text-xs text-muted-foreground">{patient.phase}</p>
                  </td>
                  <td className="hidden sm:table-cell px-6 py-4">
                    <Badge variant="outline" className={cn("gap-1", status.className)}>
                      <StatusIcon className="h-3 w-3" />
                      {status.label}
                    </Badge>
                  </td>
                  <td className="hidden lg:table-cell px-6 py-4">
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
                  <td className="hidden md:table-cell px-6 py-4">
                    <span className={cn(
                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize",
                      riskConfig[patient.riskLevel as keyof typeof riskConfig]
                    )}>
                      {patient.riskLevel}
                    </span>
                  </td>
                  <td className="hidden xl:table-cell px-6 py-4">
                    <span className="text-sm text-muted-foreground">{patient.lastVisit}</span>
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/subjects/${patient.id}`); }}>
                          View Subject
                        </DropdownMenuItem>

                        {patient.status === 'alert' && (
                          <DropdownMenuItem 
                            className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEscalateSubjectId(patient.id);
                            }}>
                            Escalate to PI
                          </DropdownMenuItem>
                        )}

                        {patient.status === 'review' && (
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/validation?subject=${patient.id}`); }}>
                            Review Data
                          </DropdownMenuItem>
                        )}

                        {patient.status === 'active' && patient.riskLevel === 'high' && (
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            fetch(`${API_BASE_URL}/api/subjects/${patient.id}/action`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ action: 'schedule_followup' })
                            }).then(() => {
                              toast({ title: "Success", description: "Follow-up scheduled successfully" });
                            });
                          }}>
                            Schedule Follow-up
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {loading ? (
          <div className="p-8 text-center text-muted-foreground flex justify-center items-center">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading data...</span>
          </div>
        ) : patients.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No active subjects found in the database.
          </div>
        ) : null}
      </div>

      <AlertDialog open={!!escalateSubjectId} onOpenChange={(open) => !open && setEscalateSubjectId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Escalate Subject
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to escalate subject <strong className="text-foreground">{escalateSubjectId}</strong> to the Principal Investigator? This action will notify the PI immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (!escalateSubjectId) return;
                fetch(`${API_BASE_URL}/api/subjects/${escalateSubjectId}/action`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ action: 'escalate' })
                }).then(() => {
                  toast({ title: "Escalated Successfully", description: `Subject ${escalateSubjectId} has been escalated to the PI.` });
                }).finally(() => {
                  setEscalateSubjectId(null);
                });
              }}
            >
              Yes, Escalate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
