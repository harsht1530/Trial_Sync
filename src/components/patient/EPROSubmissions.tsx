import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ClipboardList,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  ChevronRight,
  FileText,
  User,
  Calendar,
  Layers
} from "lucide-react";

interface EPROSubmissionsProps {
  patientId: string;
}

interface Submission {
  id: string;
  formName: string;
  submittedAt: string | null;
  status: string;
  score: number | null;
  maxScore: number | null;
  phase: string;
  responses?: {
    question: string;
    answer: string;
    type: "choice" | "scale" | "text";
  }[];
}

export const EPROSubmissions = ({ patientId }: EPROSubmissionsProps) => {
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [showAllSubmissions, setShowAllSubmissions] = useState(false);

  // Mock ePRO data
  const eproStats = {
    completed: 24,
    pending: 2,
    overdue: 1,
    complianceRate: 89
  };

  const submissions: Submission[] = [
    {
      id: "EPRO-001",
      formName: "Weekly Symptom Assessment",
      submittedAt: "2024-01-20T09:15:00",
      status: "Completed",
      score: 42,
      maxScore: 50,
      phase: "Week 12",
      responses: [
        { question: "Overall pain level today?", answer: "3/10", type: "scale" },
        { question: "Did you experience any nausea?", answer: "Mild", type: "choice" },
        { question: "Hours of sleep last night?", answer: "7 hours", type: "text" },
        { question: "Any new symptoms to report?", answer: "Slight headache in the evening", type: "text" }
      ]
    },
    {
      id: "EPRO-002",
      formName: "Quality of Life Questionnaire",
      submittedAt: "2024-01-19T14:30:00",
      status: "Completed",
      score: 78,
      maxScore: 100,
      phase: "Week 12",
      responses: [
        { question: "How would you rate your physical well-being?", answer: "Good", type: "choice" },
        { question: "Have you felt limited in your daily activities?", answer: "Somewhat", type: "choice" },
        { question: "Rate your energy levels today.", answer: "6/10", type: "scale" },
        { question: "How satisfied are you with your sleep quality?", answer: "Very satisfied", type: "choice" }
      ]
    },
    {
      id: "EPRO-003",
      formName: "Daily Pain Diary",
      submittedAt: null,
      status: "Pending",
      score: null,
      maxScore: 10,
      phase: "Week 12"
    },
    {
      id: "EPRO-004",
      formName: "Medication Adherence Log",
      submittedAt: null,
      status: "Overdue",
      score: null,
      maxScore: 20,
      phase: "Week 11"
    },
    {
      id: "EPRO-005",
      formName: "Adverse Event Report",
      submittedAt: "2024-01-15T11:20:00",
      status: "Completed",
      score: null,
      maxScore: null,
      phase: "Week 11",
      responses: [
        { question: "Type of event?", answer: "Dizziness", type: "text" },
        { question: "Severity level?", answer: "Moderate", type: "choice" },
        { question: "Start date/time?", answer: "2024-01-15 08:00 AM", type: "text" },
        { question: "Is the event still ongoing?", answer: "No", type: "choice" }
      ]
    },
    {
      id: "EPRO-006",
      formName: "Weekly Symptom Assessment",
      submittedAt: "2024-01-13T08:45:00",
      status: "Completed",
      score: 38,
      maxScore: 50,
      phase: "Week 11",
      responses: [
        { question: "Overall pain level today?", answer: "4/10", type: "scale" },
        { question: "Did you experience any nausea?", answer: "None", type: "choice" },
        { question: "Hours of sleep last night?", answer: "6 hours", type: "text" }
      ]
    },
    {
      id: "EPRO-007",
      formName: "Quality of Life Questionnaire",
      submittedAt: "2024-01-12T10:00:00",
      status: "Completed",
      score: 82,
      maxScore: 100,
      phase: "Week 11",
      responses: [
        { question: "Physical well-being?", answer: "Excellent", type: "choice" },
        { question: "Energy level?", answer: "8/10", type: "scale" }
      ]
    },
    {
      id: "EPRO-008",
      formName: "Daily Pain Diary",
      submittedAt: "2024-01-11T20:30:00",
      status: "Completed",
      score: 2,
      maxScore: 10,
      phase: "Week 11",
      responses: [
        { question: "Pain level?", answer: "2/10", type: "scale" }
      ]
    }
  ];

  const displayedSubmissions = showAllSubmissions ? submissions : submissions.slice(0, 5);

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return (
          <Badge className="bg-success/10 text-success border-success/20 gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Completed
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-warning/10 text-warning border-warning/20 gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        );
      case "overdue":
        return (
          <Badge className="bg-destructive/10 text-destructive border-destructive/20 gap-1">
            <AlertCircle className="h-3 w-3" />
            Overdue
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            ePRO Submissions
          </CardTitle>

          {/* Stats Summary */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-success">{eproStats.completed}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-warning">{eproStats.pending}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-destructive">{eproStats.overdue}</p>
                <p className="text-xs text-muted-foreground">Overdue</p>
              </div>
            </div>

            <div className="hidden md:block h-12 w-px bg-border" />

            <div className="hidden md:flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium">Compliance Rate</p>
                <p className="text-xs text-muted-foreground">Last 30 days</p>
              </div>
              <div className="relative h-12 w-12">
                <svg className="h-12 w-12 -rotate-90">
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    className="text-muted/30"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeDasharray={`${eproStats.complianceRate * 1.256} 125.6`}
                    className="text-success"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold">
                  {eproStats.complianceRate}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Form Name</TableHead>
                <TableHead>Phase</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Score</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedSubmissions.map((submission) => (
                <TableRow key={submission.id} className="hover:bg-muted/20">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{submission.formName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {submission.phase}
                    </Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(submission.status)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {submission.submittedAt
                      ? new Date(submission.submittedAt).toLocaleString()
                      : "—"
                    }
                  </TableCell>
                  <TableCell>
                    {submission.score !== null && submission.maxScore !== null ? (
                      <div className="flex items-center gap-2">
                        <Progress
                          value={(submission.score / submission.maxScore) * 100}
                          className="w-16 h-2"
                        />
                        <span className="text-sm">
                          {submission.score}/{submission.maxScore}
                        </span>
                      </div>
                    ) : submission.maxScore ? (
                      <span className="text-muted-foreground">—</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">N/A</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1"
                          disabled={submission.status !== "Completed"}
                          onClick={() => setSelectedSubmission(submission)}
                        >
                          <Eye className="h-4 w-4" />
                          View
                          <ChevronRight className="h-3 w-3" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto no-scrollbar">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2 text-xl">
                            <FileText className="h-5 w-5 text-primary" />
                            {submission.formName} Details
                          </DialogTitle>
                        </DialogHeader>

                        <div className="mt-6 space-y-6">
                          {/* Metadata Grid */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-lg bg-muted/30 border">
                            <div className="space-y-1">
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <User className="h-3 w-3" /> Patient ID
                              </p>
                              <p className="text-sm font-semibold">{patientId}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" /> Submitted
                              </p>
                              <p className="text-sm font-semibold">
                                {submission.submittedAt ? new Date(submission.submittedAt).toLocaleDateString() : 'N/A'}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Layers className="h-3 w-3" /> Phase
                              </p>
                              <p className="text-sm font-semibold">{submission.phase}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" /> Score
                              </p>
                              <p className="text-sm font-semibold">
                                {submission.score !== null ? `${submission.score}/${submission.maxScore}` : 'N/A'}
                              </p>
                            </div>
                          </div>

                          {/* Responses Section */}
                          <div className="space-y-4">
                            <h3 className="font-semibold text-lg border-b pb-2">Patient Responses</h3>
                            {submission.responses && submission.responses.length > 0 ? (
                              <div className="space-y-4">
                                {submission.responses.map((response, index) => (
                                  <div key={index} className="space-y-2 group">
                                    <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                                      {index + 1}. {response.question}
                                    </p>
                                    <div className="p-3 rounded-md bg-white border border-border shadow-sm">
                                      <p className="text-sm">{response.answer}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-8 text-muted-foreground italic">
                                No response details available for this submission.
                              </div>
                            )}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-center mt-4">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setShowAllSubmissions(!showAllSubmissions)}
          >
            {showAllSubmissions ? "Show Recent Submissions" : "View All Submissions"}
            <ChevronRight className={`h-4 w-4 transition-transform ${showAllSubmissions ? 'rotate-90' : ''}`} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
