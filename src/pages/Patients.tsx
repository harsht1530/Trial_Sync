import { useState, useMemo } from "react";
import { Helmet } from "react-helmet";
import { Search, Filter, ChevronDown, MoreHorizontal, CheckCircle2, AlertTriangle, Clock, User, X } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const allPatients = [
  { id: "PT-001", name: "John Martinez", age: 45, trial: "ONCO-2024-A1", phase: "Phase 2", status: "active", compliance: 98, lastVisit: "2 hours ago", riskLevel: "low", site: "Boston Medical" },
  { id: "PT-002", name: "Emily Watson", age: 52, trial: "CARDIO-2024-B3", phase: "Phase 3", status: "review", compliance: 85, lastVisit: "1 day ago", riskLevel: "medium", site: "NYC Research Center" },
  { id: "PT-003", name: "Robert Chen", age: 38, trial: "NEURO-2024-C2", phase: "Phase 2", status: "active", compliance: 92, lastVisit: "5 hours ago", riskLevel: "low", site: "Stanford Clinical" },
  { id: "PT-004", name: "Maria Garcia", age: 61, trial: "ONCO-2024-A1", phase: "Phase 2", status: "alert", compliance: 67, lastVisit: "3 days ago", riskLevel: "high", site: "Boston Medical" },
  { id: "PT-005", name: "David Kim", age: 49, trial: "CARDIO-2024-B3", phase: "Phase 3", status: "active", compliance: 95, lastVisit: "12 hours ago", riskLevel: "low", site: "UCLA Health" },
  { id: "PT-006", name: "Sarah Johnson", age: 55, trial: "ONCO-2024-A1", phase: "Phase 2", status: "active", compliance: 91, lastVisit: "6 hours ago", riskLevel: "low", site: "Boston Medical" },
  { id: "PT-007", name: "Michael Brown", age: 42, trial: "NEURO-2024-C2", phase: "Phase 2", status: "review", compliance: 78, lastVisit: "2 days ago", riskLevel: "medium", site: "Stanford Clinical" },
  { id: "PT-008", name: "Jennifer Lee", age: 36, trial: "CARDIO-2024-B3", phase: "Phase 3", status: "active", compliance: 99, lastVisit: "1 hour ago", riskLevel: "low", site: "NYC Research Center" },
  { id: "PT-009", name: "William Davis", age: 58, trial: "ONCO-2024-A1", phase: "Phase 2", status: "alert", compliance: 72, lastVisit: "4 days ago", riskLevel: "high", site: "UCLA Health" },
  { id: "PT-010", name: "Lisa Anderson", age: 47, trial: "NEURO-2024-C2", phase: "Phase 2", status: "active", compliance: 88, lastVisit: "8 hours ago", riskLevel: "low", site: "Stanford Clinical" },
  { id: "PT-011", name: "James Wilson", age: 63, trial: "CARDIO-2024-B3", phase: "Phase 3", status: "active", compliance: 94, lastVisit: "3 hours ago", riskLevel: "low", site: "Boston Medical" },
  { id: "PT-012", name: "Amanda Taylor", age: 41, trial: "ONCO-2024-A1", phase: "Phase 2", status: "review", compliance: 81, lastVisit: "1 day ago", riskLevel: "medium", site: "NYC Research Center" },
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

const trials = ["ONCO-2024-A1", "CARDIO-2024-B3", "NEURO-2024-C2"];
const sites = ["Boston Medical", "NYC Research Center", "Stanford Clinical", "UCLA Health"];
const statuses = ["active", "review", "alert"];
const riskLevels = ["low", "medium", "high"];

export default function Patients() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTrial, setSelectedTrial] = useState<string>("all");
  const [selectedSite, setSelectedSite] = useState<string>("all");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedRiskLevels, setSelectedRiskLevels] = useState<string[]>([]);

  const filteredPatients = useMemo(() => {
    return allPatients.filter((patient) => {
      // Search filter
      const matchesSearch = searchQuery === "" ||
        patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.trial.toLowerCase().includes(searchQuery.toLowerCase());

      // Trial filter
      const matchesTrial = selectedTrial === "all" || patient.trial === selectedTrial;

      // Site filter
      const matchesSite = selectedSite === "all" || patient.site === selectedSite;

      // Status filter
      const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(patient.status);

      // Risk level filter
      const matchesRisk = selectedRiskLevels.length === 0 || selectedRiskLevels.includes(patient.riskLevel);

      return matchesSearch && matchesTrial && matchesSite && matchesStatus && matchesRisk;
    });
  }, [searchQuery, selectedTrial, selectedSite, selectedStatuses, selectedRiskLevels]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedTrial("all");
    setSelectedSite("all");
    setSelectedStatuses([]);
    setSelectedRiskLevels([]);
  };

  const hasActiveFilters = searchQuery || selectedTrial !== "all" || selectedSite !== "all" || selectedStatuses.length > 0 || selectedRiskLevels.length > 0;

  const handlePatientClick = (patientId: string) => {
    navigate(`/patient/${patientId}`);
  };

  return (
    <>
      <Helmet>
        <title>Patients | TrialSync</title>
        <meta name="description" content="Manage and monitor all patients enrolled in clinical trials" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Sidebar />

        <div className="ml-64">
          <Header />

          <main className="p-8">
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
                    {trials.map((trial) => (
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
                    {sites.map((site) => (
                      <SelectItem key={site} value={site}>{site}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Status Filter */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full lg:w-36">
                      <Filter className="h-4 w-4 mr-2" />
                      Status
                      {selectedStatuses.length > 0 && (
                        <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                          {selectedStatuses.length}
                        </Badge>
                      )}
                      <ChevronDown className="h-4 w-4 ml-auto" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {statuses.map((status) => (
                      <DropdownMenuCheckboxItem
                        key={status}
                        checked={selectedStatuses.includes(status)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedStatuses([...selectedStatuses, status]);
                          } else {
                            setSelectedStatuses(selectedStatuses.filter((s) => s !== status));
                          }
                        }}
                      >
                        <span className="capitalize">{status}</span>
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Risk Level Filter */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full lg:w-36">
                      <Filter className="h-4 w-4 mr-2" />
                      Risk
                      {selectedRiskLevels.length > 0 && (
                        <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                          {selectedRiskLevels.length}
                        </Badge>
                      )}
                      <ChevronDown className="h-4 w-4 ml-auto" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>Filter by Risk Level</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {riskLevels.map((risk) => (
                      <DropdownMenuCheckboxItem
                        key={risk}
                        checked={selectedRiskLevels.includes(risk)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedRiskLevels([...selectedRiskLevels, risk]);
                          } else {
                            setSelectedRiskLevels(selectedRiskLevels.filter((r) => r !== risk));
                          }
                        }}
                      >
                        <span className="capitalize">{risk}</span>
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

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
                Showing {filteredPatients.length} of {allPatients.length} subjects
              </div>
            </div>

            {/* Patient Table */}
            <div className="rounded-xl bg-card shadow-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-secondary/30">
                      <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Subject
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Trial
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Site
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
                    {filteredPatients.map((patient) => {
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
                            <p className="text-sm">{patient.site}</p>
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

              {filteredPatients.length === 0 && (
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
    </>
  );
}
