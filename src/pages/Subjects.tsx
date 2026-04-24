import { useState, useMemo, useEffect } from "react";
import { Helmet } from "react-helmet";
import { Search, Filter, ChevronDown, MoreHorizontal, CheckCircle2, AlertTriangle, Clock, User, X, Loader2 } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { API_BASE_URL } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";



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



export default function Patients() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [patientsList, setPatientsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterOptions, setFilterOptions] = useState({
    trials: [] as string[],
    sites: [] as string[],
    statuses: [] as string[],
    riskLevels: [] as string[],
    totalCount: 0
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTrial, setSelectedTrial] = useState<string>("all");
  const [selectedSite, setSelectedSite] = useState<string>("all");
  const [selectedStatuses, setSelectedStatuses] = useState<string>("all");
  const [selectedRiskLevels, setSelectedRiskLevels] = useState<string>("all");
  const [escalateSubjectId, setEscalateSubjectId] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/subjects/filters`)
      .then(res => res.json())
      .then(data => setFilterOptions(data))
      .catch(err => console.error('Error fetching filters:', err));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (selectedTrial !== "all") params.append('trial', selectedTrial);
    if (selectedSite !== "all") params.append('site', selectedSite);
    if (selectedStatuses !== "all") params.append('status', selectedStatuses);
    if (selectedRiskLevels !== "all") params.append('risk', selectedRiskLevels);

    setLoading(true);
    fetch(`${API_BASE_URL}/api/subjects?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        setPatientsList(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching patients', err);
        setLoading(false);
      });
  }, [searchQuery, selectedTrial, selectedSite, selectedStatuses, selectedRiskLevels]);

  const filteredPatients = patientsList;

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedTrial("all");
    setSelectedSite("all");
    setSelectedStatuses("all");
    setSelectedRiskLevels("all");
  };

  const hasActiveFilters = searchQuery || selectedTrial !== "all" || selectedSite !== "all" || selectedStatuses !== "all" || selectedRiskLevels !== "all";

  const handlePatientClick = (patientId: string) => {
    navigate(`/subjects/${patientId}`);
  };

  return (
    <>
      <Helmet>
        <title>Patients | TrialSync</title>
        <meta name="description" content="Manage and monitor all patients enrolled in clinical trials" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Sidebar />

        <div className="lg:ml-64">
          <Header />

          <main className="p-4 sm:p-8">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground">Subjects</h1>
              <p className="text-muted-foreground mt-1">Manage and monitor all enrolled subjects across trials</p>
            </div>

            {/* Search and Filters */}
            <div className="bg-card rounded-xl shadow-card p-6 mb-6">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, ID, or trial..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Trial Filter */}
                <Select value={selectedTrial} onValueChange={setSelectedTrial}>
                  <SelectTrigger className="w-full lg:w-48">
                    <SelectValue placeholder="All Trials" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Trials</SelectItem>
                    {filterOptions.trials.map((trial) => (
                      <SelectItem key={trial} value={trial}>{trial}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Site Filter */}
                <Select value={selectedSite} onValueChange={setSelectedSite}>
                  <SelectTrigger className="w-full lg:w-48">
                    <SelectValue placeholder="All Sites" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sites</SelectItem>
                    {filterOptions.sites.map((site) => (
                      <SelectItem key={site} value={site}>{site}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Status Filter */}
                <Select value={selectedStatuses} onValueChange={setSelectedStatuses}>
                  <SelectTrigger className="w-full lg:w-48">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {filterOptions.statuses.map((status) => (
                      <SelectItem key={status} value={status} className="capitalize">{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Risk Level Filter */}
                <Select value={selectedRiskLevels} onValueChange={setSelectedRiskLevels}>
                  <SelectTrigger className="w-full lg:w-48">
                    <SelectValue placeholder="All Risk Levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Risk Levels</SelectItem>
                    {filterOptions.riskLevels.map((risk) => (
                      <SelectItem key={risk} value={risk} className="capitalize">{risk}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Clear Filters */}
                {hasActiveFilters && (
                  <Button variant="ghost" onClick={clearFilters} className="w-full lg:w-auto">
                    <X className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                )}
              </div>

              {/* Results count */}
              <div className="mt-4 text-sm text-muted-foreground">
                {loading ? "Loading subjects..." : `Showing ${patientsList.length} of ${filterOptions.totalCount} subjects`}
              </div>
            </div>

            {/* Patient Table */}
            <div className="rounded-xl bg-card shadow-card overflow-hidden">
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
                      <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Site
                      </th>
                      <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Status
                      </th>
                      <th className="hidden xl:table-cell px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Compliance
                      </th>
                      <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Risk
                      </th>
                      <th className="hidden 2xl:table-cell px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Last Activity
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredPatients.map((patient) => {
                      const status = statusConfig[patient.status as keyof typeof statusConfig];
                      const StatusIcon = status.icon;

                      return (
                        <tr
                          key={patient.id}
                          className={cn(
                            "hover:bg-secondary/20 transition-colors cursor-pointer relative",
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
                          <td className="hidden lg:table-cell px-6 py-4">
                            <p className="text-sm">{patient.site}</p>
                          </td>
                          <td className="hidden sm:table-cell px-6 py-4">
                            <Badge variant="outline" className={cn("gap-1", status.className)}>
                              <StatusIcon className="h-3 w-3" />
                              {status.label}
                            </Badge>
                          </td>
                          <td className="hidden xl:table-cell px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-20 rounded-full bg-secondary overflow-hidden">
                                <div
                                  className={cn(
                                    "h-full rounded-full transition-all",
                                    patient.compliance >= 90 ? "bg-success" :
                                      patient.compliance >= 75 ? "bg-warning" : "bg-destructive"
                                  )}
                                  style={{ width: `${patient.compliance}%` }}
                                />
                              </div>
                              <span className={cn(
                                "text-sm font-medium",
                                patient.compliance >= 90 ? "text-success" :
                                  patient.compliance >= 75 ? "text-warning" : "text-destructive"
                              )}>{patient.compliance}%</span>
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
                          <td className="hidden 2xl:table-cell px-6 py-4">
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
              </div>

              {loading && (
                <div className="p-12 text-center flex flex-col items-center justify-center text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin mb-4" />
                  <p className="text-sm">Loading patient data...</p>
                </div>
              )}

              {!loading && filteredPatients.length === 0 && (
                <div className="p-12 text-center">
                  <User className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-1">No patients found</h3>
                  <p className="text-sm text-muted-foreground">Try adjusting your search or filter criteria</p>
                </div>
              )}
            </div>
          </main>
        </div>
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
    </>
  );
}
