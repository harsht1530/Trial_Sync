import { useState } from "react";
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
  X
} from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
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
  status: "pending" | "in_review" | "corrected" | "approved" | "rejected";
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

const mockValidationQueue: ValidationItem[] = [
  {
    id: "VAL-001",
    patientId: "PT-001",
    patientName: "John Martinez",
    dataType: "Vital Signs",
    field: "Blood Pressure",
    originalValue: "180/120 mmHg",
    issue: "Value exceeds protocol threshold (>160/100)",
    severity: "critical",
    status: "pending",
    flaggedAt: "2024-01-15 09:30",
    trial: "ONCO-2024-A1",
  },
  {
    id: "VAL-002",
    patientId: "PT-002",
    patientName: "Emily Watson",
    dataType: "Lab Results",
    field: "Creatinine",
    originalValue: "2.8 mg/dL",
    issue: "Abnormal value detected - potential data entry error",
    severity: "warning",
    status: "in_review",
    flaggedAt: "2024-01-15 08:15",
    assignedTo: "Dr. Sarah Chen",
    trial: "CARDIO-2024-B3",
  },
  {
    id: "VAL-003",
    patientId: "PT-004",
    patientName: "Maria Garcia",
    dataType: "ePRO",
    field: "Pain Score",
    originalValue: "12",
    issue: "Value out of range (expected 0-10)",
    severity: "critical",
    status: "pending",
    flaggedAt: "2024-01-15 07:45",
    trial: "ONCO-2024-A1",
  },
  {
    id: "VAL-004",
    patientId: "PT-003",
    patientName: "Robert Chen",
    dataType: "Medication",
    field: "Dosage",
    originalValue: "500mg",
    flaggedValue: "50mg",
    issue: "Dosage deviation from protocol (expected 50mg)",
    severity: "warning",
    status: "in_review",
    flaggedAt: "2024-01-14 16:20",
    assignedTo: "Dr. Michael Park",
    trial: "NEURO-2024-C2",
  },
  {
    id: "VAL-005",
    patientId: "PT-005",
    patientName: "David Kim",
    dataType: "Visit Data",
    field: "Visit Date",
    originalValue: "2024-01-20",
    issue: "Visit date outside protocol window",
    severity: "info",
    status: "pending",
    flaggedAt: "2024-01-14 14:00",
    trial: "CARDIO-2024-B3",
  },
];

const mockAuditTrail: AuditEntry[] = [
  {
    id: "AUD-001",
    validationId: "VAL-006",
    action: "Correction Applied",
    performedBy: "Dr. Sarah Chen",
    timestamp: "2024-01-14 11:30",
    oldValue: "15",
    newValue: "5",
    notes: "Patient confirmed pain level was 5, data entry error corrected",
  },
  {
    id: "AUD-002",
    validationId: "VAL-007",
    action: "Approved",
    performedBy: "Dr. Michael Park",
    timestamp: "2024-01-14 10:15",
    notes: "Value confirmed as accurate per source documents",
  },
  {
    id: "AUD-003",
    validationId: "VAL-008",
    action: "Rejected",
    performedBy: "Dr. Sarah Chen",
    timestamp: "2024-01-13 16:45",
    notes: "Unable to verify - requesting additional documentation",
  },
  {
    id: "AUD-004",
    validationId: "VAL-009",
    action: "Assigned for Review",
    performedBy: "System",
    timestamp: "2024-01-13 14:20",
    notes: "Auto-assigned to principal investigator",
  },
  {
    id: "AUD-005",
    validationId: "VAL-010",
    action: "Correction Applied",
    performedBy: "Dr. Lisa Wong",
    timestamp: "2024-01-13 09:00",
    oldValue: "2024-02-30",
    newValue: "2024-02-28",
    notes: "Invalid date corrected",
  },
];

const severityConfig = {
  critical: { label: "Critical", icon: XCircle, className: "bg-destructive/10 text-destructive border-destructive/20" },
  warning: { label: "Warning", icon: AlertTriangle, className: "bg-warning/10 text-warning border-warning/20" },
  info: { label: "Info", icon: Clock, className: "bg-primary/10 text-primary border-primary/20" },
};

const statusConfig = {
  pending: { label: "Pending", className: "bg-secondary text-secondary-foreground" },
  in_review: { label: "In Review", className: "bg-warning/10 text-warning" },
  corrected: { label: "Corrected", className: "bg-primary/10 text-primary" },
  approved: { label: "Approved", className: "bg-success/10 text-success" },
  rejected: { label: "Rejected", className: "bg-destructive/10 text-destructive" },
};

export default function DataValidation() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedItem, setSelectedItem] = useState<ValidationItem | null>(null);
  const [correctionDialogOpen, setCorrectionDialogOpen] = useState(false);
  const [correctionValue, setCorrectionValue] = useState("");
  const [correctionNotes, setCorrectionNotes] = useState("");

  const filteredQueue = mockValidationQueue.filter((item) => {
    const matchesSearch = searchQuery === "" ||
      item.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.field.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSeverity = selectedSeverity === "all" || item.severity === selectedSeverity;
    const matchesStatus = selectedStatus === "all" || item.status === selectedStatus;

    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const pendingCount = mockValidationQueue.filter(i => i.status === "pending").length;
  const inReviewCount = mockValidationQueue.filter(i => i.status === "in_review").length;
  const criticalCount = mockValidationQueue.filter(i => i.severity === "critical").length;

  const handleApprove = (item: ValidationItem) => {
    console.log("Approved:", item.id);
    setSelectedItem(null);
  };

  const handleReject = (item: ValidationItem) => {
    console.log("Rejected:", item.id);
    setSelectedItem(null);
  };

  const handleCorrection = () => {
    if (selectedItem && correctionValue.trim()) {
      console.log("Correction applied:", {
        id: selectedItem.id,
        newValue: correctionValue,
        notes: correctionNotes,
      });
      setCorrectionDialogOpen(false);
      setCorrectionValue("");
      setCorrectionNotes("");
      setSelectedItem(null);
    }
  };

  return (
    <>
      <Helmet>
        <title>Data Validation | Clinical Nexus</title>
        <meta name="description" content="Review and validate clinical trial data with audit trails" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Sidebar />
        
        <div className="ml-64">
          <Header />
          
          <main className="p-8">
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
                    <p className="text-2xl font-bold">{pendingCount}</p>
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
                    <p className="text-2xl font-bold">{inReviewCount}</p>
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
                    <p className="text-2xl font-bold">{criticalCount}</p>
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
                    <p className="text-2xl font-bold">94%</p>
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
                        placeholder="Search by patient, ID, or field..."
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
                        <SelectItem value="corrected">Corrected</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Queue List */}
                <div className="bg-card rounded-xl shadow-card overflow-hidden">
                  <div className="divide-y divide-border">
                    {filteredQueue.map((item) => {
                      const severity = severityConfig[item.severity];
                      const status = statusConfig[item.status];
                      const SeverityIcon = severity.icon;

                      return (
                        <div
                          key={item.id}
                          className={cn(
                            "p-5 hover:bg-secondary/20 transition-colors cursor-pointer",
                            selectedItem?.id === item.id && "bg-secondary/30"
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
                                    {item.patientName} ({item.patientId})
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
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Patient</p>
                        <p className="font-medium">{selectedItem.patientName}</p>
                        <p className="text-sm text-muted-foreground">{selectedItem.patientId}</p>
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
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => setCorrectionDialogOpen(true)}
                      >
                        <Edit3 className="h-4 w-4 mr-2" />
                        Apply Correction
                      </Button>
                      <Button 
                        variant="outline"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleReject(selectedItem)}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                      <Button 
                        className="bg-success hover:bg-success/90"
                        onClick={() => handleApprove(selectedItem)}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Audit Trail Tab */}
              <TabsContent value="audit" className="space-y-4">
                <div className="bg-card rounded-xl shadow-card overflow-hidden">
                  <div className="p-4 border-b border-border">
                    <h3 className="font-semibold">Recent Activity</h3>
                    <p className="text-sm text-muted-foreground">Complete audit trail of all validation actions</p>
                  </div>
                  <div className="divide-y divide-border">
                    {mockAuditTrail.map((entry) => (
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
