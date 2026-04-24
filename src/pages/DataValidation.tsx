import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  XCircle,
  FileText,
  User,
  Calendar,
  MessageSquare,
  ChevronRight,
  Filter,
  Search,
  History,
  Edit3,
  Check,
  X,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { API_BASE_URL } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface ValidationItem {
  id: string;
  patientId: string;
  patientName: string;
  dataType: string;
  field: string;
  originalValue: string;
  flaggedValue?: string;
  issue: string;
  severity: "critical" | "warning" | "info";
  status: "pending" | "in_review" | "corrected" | "approved" | "rejected" | "resolved" | "deferred" | "escalated";
  flaggedAt: string;
  assignedTo?: string;
  trial: string;
}

interface AuditEntry {
  id: string;
  validationId: string;
  action: string;
  performedBy: string;
  timestamp: string;
  oldValue?: string;
  newValue?: string;
  notes?: string;
}



const severityConfig = {
  critical: { label: "Critical", icon: XCircle, className: "bg-destructive/10 text-destructive border-destructive/20" },
  warning: { label: "Warning", icon: AlertTriangle, className: "bg-warning/10 text-warning border-warning/20" },
  info: { label: "Info", icon: Clock, className: "bg-primary/10 text-primary border-primary/20" },
};

const statusConfig = {
  pending: { label: "Pending", className: "bg-secondary text-secondary-foreground" },
  in_review: { label: "In Review", className: "bg-warning/10 text-warning" },
  resolved: { label: "Resolved", className: "bg-primary/10 text-primary" },
  approved: { label: "Approved", className: "bg-success/10 text-success" },
  rejected: { label: "Rejected", className: "bg-destructive/10 text-destructive" },
  deferred: { label: "Deferred", className: "bg-muted text-muted-foreground" },
  escalated: { label: "Escalated", className: "bg-destructive/20 text-destructive" }
};

export default function DataValidation() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedItem, setSelectedItem] = useState<ValidationItem | null>(null);
  const [correctionDialogOpen, setCorrectionDialogOpen] = useState(false);
  const [correctionValue, setCorrectionValue] = useState("");
  const [correctionNotes, setCorrectionNotes] = useState("");

  const [queue, setQueue] = useState<ValidationItem[]>([]);
  const [auditTrail, setAuditTrail] = useState<AuditEntry[]>([]);
  const [summary, setSummary] = useState({ pending: 0, inReview: 0, critical: 0, resolutionRate: '0%' });
  const [loading, setLoading] = useState(true);

  const fetchAuditTrail = () => {
    fetch(`${API_BASE_URL}/api/validation/audit-trail`)
      .then(res => res.json())
      .then(data => setAuditTrail(data || []))
      .catch(err => console.error('Failed to fetch audit logs', err));
  };

  const fetchFlags = () => {
    setLoading(true);
    let url = `${API_BASE_URL}/api/validation/flags`;
    const params = new URLSearchParams();
    if (selectedSeverity !== 'all') params.append('severity', selectedSeverity);
    if (selectedStatus !== 'all') params.append('status', selectedStatus);

    if (params.toString()) {
      url += '?' + params.toString();
    }

    fetch(url)
      .then(res => res.json())
      .then(data => {
        setQueue(data.flags || []);
        if (data.summary) {
          setSummary(data.summary);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch validation flags', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchFlags();
    fetchAuditTrail();
  }, [selectedSeverity, selectedStatus]);

  const filteredQueue = queue.filter((item) => {
    const matchesSearch = searchQuery === "" ||
      item.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.field.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  const handleAction = (item: ValidationItem, actionConfig: string) => {
    fetch(`${API_BASE_URL}/api/validation/flags/${item.id}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: actionConfig })
    })
      .then(res => res.json())
      .then(() => {
        fetchFlags();
        fetchAuditTrail();
        setSelectedItem(null);
        toast({ title: "Status Updated", description: `${item.id} action processed successfully` });
      })
      .catch(err => console.error("Error updating", err));
  };

  const handleCorrection = () => {
    if (selectedItem && (correctionValue.trim() || correctionNotes.trim())) {
      fetch(`${API_BASE_URL}/api/validation/flags/${selectedItem.id}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correctionValue, correctionNotes })
      })
        .then(res => res.json())
        .then(data => {
          setCorrectionDialogOpen(false);
          setCorrectionValue("");
          setCorrectionNotes("");
          setSelectedItem(null);
          fetchFlags();
          fetchAuditTrail();
          toast({ title: "Correction Applied", description: `${selectedItem.id} resolved successfully` });
        })
        .catch(err => console.error("Error applying correction", err));
    }
  };

  const handleExport = () => {
    window.open(`${API_BASE_URL}/api/validation/audit-trail/export`, '_blank');
  };

  return (
    <>
      <Helmet>
        <title>Data Validation | Clinical Nexus</title>
        <meta name="description" content="Review and validate clinical trial data with audit trails" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Sidebar />

        <div className="lg:ml-64">
          <Header />

          <main className="p-4 sm:p-8">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground">Data Validation</h1>
              <p className="text-muted-foreground mt-1">Review flagged data, apply corrections, and maintain audit trails</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-card rounded-xl p-5 shadow-card">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-warning/10">
                    <Clock className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{summary.pending}</p>
                    <p className="text-sm text-muted-foreground">Pending Review</p>
                  </div>
                </div>
              </div>
              <div className="bg-card rounded-xl p-5 shadow-card">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-primary/10">
                    <Edit3 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{summary.inReview}</p>
                    <p className="text-sm text-muted-foreground">In Review</p>
                  </div>
                </div>
              </div>
              <div className="bg-card rounded-xl p-5 shadow-card">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-destructive/10">
                    <XCircle className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{summary.critical}</p>
                    <p className="text-sm text-muted-foreground">Critical Issues</p>
                  </div>
                </div>
              </div>
              <div className="bg-card rounded-xl p-5 shadow-card">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-success/10">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{summary.resolutionRate}</p>
                    <p className="text-sm text-muted-foreground">Resolution Rate</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="queue" className="space-y-6">
              <TabsList className="bg-card border border-border">
                <TabsTrigger value="queue" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Review Queue
                </TabsTrigger>
                <TabsTrigger value="audit" className="gap-2">
                  <History className="h-4 w-4" />
                  Audit Trail
                </TabsTrigger>
              </TabsList>

              {/* Review Queue Tab */}
              <TabsContent value="queue" className="space-y-4">
                {/* Filters */}
                <div className="bg-card rounded-xl shadow-card p-4">
                  <div className="flex flex-col lg:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by subject, ID, or field..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
                      <SelectTrigger className="w-full lg:w-40">
                        <SelectValue placeholder="Severity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Severity</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="warning">Warning</SelectItem>
                        <SelectItem value="info">Info</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger className="w-full lg:w-40">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_review">In Review</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="deferred">Deferred</SelectItem>
                        <SelectItem value="escalated">Escalated</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Queue List */}
                <div className="bg-card rounded-xl shadow-card overflow-hidden">
                  <div className="divide-y divide-border">
                    {loading ? (
                      <div className="p-12 text-center text-muted-foreground">
                        <Loader2 className="h-8 w-8 mx-auto animate-spin mb-4" />
                        Fetching validation records...
                      </div>
                    ) : filteredQueue.map((item) => {
                      const severity = severityConfig[item.severity];
                      const status = statusConfig[item.status] || statusConfig.pending;
                      const SeverityIcon = severity.icon;

                      return (
                        <div
                          key={item.id}
                          className={cn(
                            "p-5 hover:bg-secondary/20 transition-colors cursor-pointer",
                            selectedItem?.id === item.id && "bg-secondary/30",
                            item.severity === "critical" && "border-l-4 border-l-destructive/60"
                          )}
                          onClick={() => setSelectedItem(item)}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-4 flex-1">
                              <div className={cn("p-2 rounded-lg", severity.className.split(" ")[0])}>
                                <SeverityIcon className={cn("h-5 w-5", severity.className.split(" ")[1])} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-1">
                                  <span className="font-semibold">{item.id}</span>
                                  <Badge variant="outline" className={severity.className}>
                                    {severity.label}
                                  </Badge>
                                  <Badge className={status.className}>
                                    {status.label}
                                  </Badge>
                                </div>
                                <p className="text-sm text-foreground mb-1">{item.issue}</p>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <User className="h-3 w-3" />
                                    {item.patientId}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <FileText className="h-3 w-3" />
                                    {item.dataType} → {item.field}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {item.flaggedAt}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="text-right mr-2">
                                <p className="text-sm font-medium">Value: {item.originalValue}</p>
                                <p className="text-xs text-muted-foreground">{item.trial}</p>
                              </div>
                              <ChevronRight className="h-5 w-5 text-muted-foreground" />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {filteredQueue.length === 0 && (
                    <div className="p-12 text-center">
                      <CheckCircle2 className="h-12 w-12 mx-auto text-success/50 mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-1">No items to review</h3>
                      <p className="text-sm text-muted-foreground">All validation issues have been resolved</p>
                    </div>
                  )}
                </div>

                {/* Selected Item Detail Panel */}
                {selectedItem && (
                  <div className="bg-card rounded-xl shadow-card p-6">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-1">Validation Details</h3>
                        <p className="text-sm text-muted-foreground">{selectedItem.id}</p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => setSelectedItem(null)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-6 mb-6">
                      <div>
                        <p className="font-medium">{selectedItem.patientId}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Trial</p>
                        <p className="font-medium">{selectedItem.trial}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Data Type</p>
                        <p className="font-medium">{selectedItem.dataType}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Field</p>
                        <p className="font-medium">{selectedItem.field}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Flagged Value</p>
                        <p className="font-medium text-destructive">{selectedItem.originalValue}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Flagged At</p>
                        <p className="font-medium">{selectedItem.flaggedAt}</p>
                      </div>
                    </div>

                    <div className="bg-secondary/30 rounded-lg p-4 mb-6">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Issue Description</p>
                      <p className="text-sm">{selectedItem.issue}</p>
                    </div>

                    <div className="flex gap-3">
                      {selectedItem.status === 'pending' && (
                        <Button className="flex-1" onClick={() => handleAction(selectedItem, 'start_review')}>
                          Start Review
                        </Button>
                      )}

                      {selectedItem.status === 'in_review' && (
                        <>
                          <Button variant="outline" className="flex-1" onClick={() => setCorrectionDialogOpen(true)}>
                            <Check className="h-4 w-4 mr-2" />
                            Resolve
                          </Button>
                          <Button variant="outline" onClick={() => handleAction(selectedItem, 'defer')}>
                            Defer
                          </Button>
                          <Button variant="outline" className="text-destructive hover:text-destructive" onClick={() => handleAction(selectedItem, 'escalate')}>
                            Escalate to PI
                          </Button>
                        </>
                      )}

                      {(selectedItem.status === 'resolved' || selectedItem.status === 'deferred' || selectedItem.status === 'escalated') && (
                        <div className="text-sm text-muted-foreground italic w-full text-center p-2 mb-2 bg-secondary/30 rounded-md">
                          No further actions available for state ({selectedItem.status}).
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Audit Trail Tab */}
              <TabsContent value="audit" className="space-y-4">
                <div className="bg-card rounded-xl shadow-card overflow-hidden">
                  <div className="p-4 border-b border-border flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">Recent Activity</h3>
                      <p className="text-sm text-muted-foreground">Complete audit trail of all validation actions</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleExport}>
                      <FileText className="h-4 w-4 mr-2" />
                      Export CSV
                    </Button>
                  </div>
                  <div className="divide-y divide-border">
                    {auditTrail.length === 0 ? (
                      <div className="p-12 text-center text-muted-foreground">
                        <History className="h-8 w-8 mx-auto mb-4 opacity-50" />
                        No audit logs available
                      </div>
                    ) : auditTrail.map((entry) => (
                      <div key={entry.id} className="p-5">
                        <div className="flex items-start gap-4">
                          <div className={cn(
                            "p-2 rounded-full",
                            entry.action === "Correction Applied" && "bg-primary/10",
                            entry.action === "Approved" && "bg-success/10",
                            entry.action === "Rejected" && "bg-destructive/10",
                            entry.action === "Assigned for Review" && "bg-secondary"
                          )}>
                            {entry.action === "Correction Applied" && <Edit3 className="h-4 w-4 text-primary" />}
                            {entry.action === "Approved" && <CheckCircle2 className="h-4 w-4 text-success" />}
                            {entry.action === "Rejected" && <XCircle className="h-4 w-4 text-destructive" />}
                            {entry.action === "Assigned for Review" && <User className="h-4 w-4 text-muted-foreground" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{entry.action}</span>
                              <span className="text-xs text-muted-foreground">•</span>
                              <span className="text-sm text-muted-foreground">{entry.validationId}</span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              By {entry.performedBy} at {entry.timestamp}
                            </p>
                            {(entry.oldValue || entry.newValue) && (
                              <div className="flex items-center gap-2 text-sm mb-2">
                                {entry.oldValue && (
                                  <span className="px-2 py-0.5 bg-destructive/10 text-destructive rounded">
                                    {entry.oldValue}
                                  </span>
                                )}
                                {entry.oldValue && entry.newValue && (
                                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                )}
                                {entry.newValue && (
                                  <span className="px-2 py-0.5 bg-success/10 text-success rounded">
                                    {entry.newValue}
                                  </span>
                                )}
                              </div>
                            )}
                            {entry.notes && (
                              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                                <MessageSquare className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                <span>{entry.notes}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>

      {/* Correction Dialog */}
      <Dialog open={correctionDialogOpen} onOpenChange={setCorrectionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply Correction</DialogTitle>
            <DialogDescription>
              Enter the corrected value and provide notes for the audit trail.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Original Value</label>
              <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
                {selectedItem?.originalValue}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Corrected Value</label>
              <Input
                value={correctionValue}
                onChange={(e) => setCorrectionValue(e.target.value)}
                placeholder="Enter the correct value"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Correction Notes</label>
              <Textarea
                value={correctionNotes}
                onChange={(e) => setCorrectionNotes(e.target.value)}
                placeholder="Provide justification for this correction..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCorrectionDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCorrection} disabled={!correctionValue.trim()}>
              Apply Correction
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
