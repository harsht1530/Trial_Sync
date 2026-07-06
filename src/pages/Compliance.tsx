import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { API_BASE_URL } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { Button } from "@/components/ui/button";
import {
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  Activity,
  Eye,
  ChevronRight,
  Loader2,
  Bot,
  Calendar,
  MapPin,
  Layers,
  ClipboardList,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface SubjectScore {
  patientId: string;
  patientName: string;
  trial: string;
  site: string;
  phase: string;
  score: number;
  compliantVisits: number;
  totalVisits: number;
  overdueCount: number;
  isAtRisk: boolean;
}

interface Deviation {
  id: string;
  patientId: string;
  patientName: string;
  trial: string;
  site: string;
  phase: string;
  visitId: string;
  visitName: string;
  scheduledDate: string;
  daysOverdue: number;
  severity: "critical" | "warning" | "info";
  procedures: string[];
  deviationType: string;
  description: string;
  status: string;
}

interface Summary {
  overallScore: number;
  totalDeviations: number;
  atRiskSubjects: number;
  onTrackSubjects: number;
  totalSubjects: number;
  totalVisits: number;
  totalCompliantVisits: number;
  subjectScores: SubjectScore[];
  aiFlags: { type: string; message: string }[];
}

// ─── Severity config (mirrors DataValidation UI) ──────────────────────────────

const severityConfig = {
  critical: {
    label: "Critical",
    icon: XCircle,
    className: "bg-destructive/10 text-destructive border-destructive/20",
    dot: "bg-destructive",
  },
  warning: {
    label: "Warning",
    icon: AlertTriangle,
    className: "bg-warning/10 text-warning border-warning/20",
    dot: "bg-warning",
  },
  info: {
    label: "Info",
    icon: Clock,
    className: "bg-primary/10 text-primary border-primary/20",
    dot: "bg-primary",
  },
};

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  colorClass,
  ringClass,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  colorClass: string;
  ringClass: string;
}) {
  return (
    <Card className={`border ${ringClass} bg-gradient-to-br from-card to-card/80`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className={`text-3xl font-bold mt-1 ${colorClass}`}>{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          <div className={`p-2.5 rounded-xl ${ringClass} bg-opacity-10`}>
            <Icon className={`h-5 w-5 ${colorClass}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Score Ring ───────────────────────────────────────────────────────────────

function ScoreRing({ score }: { score: number }) {
  const color =
    score >= 90
      ? "text-success"
      : score >= 75
      ? "text-warning"
      : "text-destructive";
  const circumference = 2 * Math.PI * 20;
  const dash = (score / 100) * circumference;
  return (
    <div className="relative h-12 w-12">
      <svg className="h-12 w-12 -rotate-90">
        <circle
          cx="24" cy="24" r="20"
          fill="none" stroke="currentColor" strokeWidth="4"
          className="text-muted/20"
        />
        <circle
          cx="24" cy="24" r="20"
          fill="none" stroke="currentColor" strokeWidth="4"
          strokeDasharray={`${dash} ${circumference}`}
          className={color}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">
        {score}%
      </span>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function Compliance() {
  const { authenticatedFetch } = useAuth();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [deviations, setDeviations] = useState<Deviation[]>([]);
  const [loading, setLoading] = useState(true);
  const [devLoading, setDevLoading] = useState(true);
  const [selectedDev, setSelectedDev] = useState<Deviation | null>(null);

  useEffect(() => {
    setLoading(true);
    authenticatedFetch(`${API_BASE_URL}/api/compliance/summary`)
      .then((r) => r.json())
      .then((d) => { setSummary(d); setLoading(false); })
      .catch((e) => { console.error(e); setLoading(false); });

    setDevLoading(true);
    authenticatedFetch(`${API_BASE_URL}/api/compliance/deviations`)
      .then((r) => r.json())
      .then((d) => { setDeviations(d.deviations || []); setDevLoading(false); })
      .catch((e) => { console.error(e); setDevLoading(false); });
  }, []);

  const getRiskBadge = (isAtRisk: boolean) =>
    isAtRisk ? (
      <Badge className="bg-destructive/10 text-destructive border-destructive/20 gap-1">
        <AlertTriangle className="h-3 w-3" /> At Risk
      </Badge>
    ) : (
      <Badge className="bg-success/10 text-success border-success/20 gap-1">
        <CheckCircle2 className="h-3 w-3" /> On Track
      </Badge>
    );

  return (
    <>
      <Helmet>
        <title>Compliance & Protocol Adherence | Clinical Nexus</title>
        <meta
          name="description"
          content="Monitor protocol adherence, compliance health scores, and protocol deviations across all clinical trial subjects."
        />
      </Helmet>

      <div className="flex min-h-screen w-full">
        <Sidebar />
        <div className="flex flex-col flex-1 lg:pl-64 min-h-screen">
          <Header />
          <main className="flex-1 p-4 sm:p-6 bg-background space-y-6">

            {/* ── Page Header ── */}
            <Card className="border-primary/10 bg-gradient-to-r from-primary/5 via-transparent to-transparent">
              <CardContent className="p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                      <Shield className="h-6 w-6 text-primary" />
                      Compliance &amp; Protocol Adherence
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      Real-time protocol deviations and compliance health scores derived from subject visit schedules.
                    </p>
                  </div>
                  {!loading && summary && (
                    <div className="flex items-center gap-3">
                      <p className="text-sm text-muted-foreground">Overall Score</p>
                      <ScoreRing score={summary.overallScore} />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* ── AI Flags ── */}
            {!loading && summary && summary.aiFlags.length > 0 && (
              <div className="space-y-2">
                {summary.aiFlags.map((flag, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-3 p-4 rounded-lg border text-sm ${
                      flag.type === "critical"
                        ? "bg-destructive/5 border-destructive/20 text-destructive"
                        : "bg-warning/5 border-warning/20 text-warning"
                    }`}
                  >
                    <Bot className="h-4 w-4 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-semibold mr-1">AI Recommendation:</span>
                      {flag.message}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── Stat Cards ── */}
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="Compliance Health Score"
                  value={`${summary?.overallScore ?? 0}%`}
                  subtitle="Visits completed within protocol window"
                  icon={Activity}
                  colorClass={
                    (summary?.overallScore ?? 0) >= 90
                      ? "text-success"
                      : (summary?.overallScore ?? 0) >= 75
                      ? "text-warning"
                      : "text-destructive"
                  }
                  ringClass={
                    (summary?.overallScore ?? 0) >= 90
                      ? "border-success/20"
                      : (summary?.overallScore ?? 0) >= 75
                      ? "border-warning/20"
                      : "border-destructive/20"
                  }
                />
                <StatCard
                  title="Protocol Deviations"
                  value={summary?.totalDeviations ?? 0}
                  subtitle="Overdue scheduled visits"
                  icon={AlertTriangle}
                  colorClass="text-destructive"
                  ringClass="border-destructive/20"
                />
                <StatCard
                  title="At-Risk Subjects"
                  value={summary?.atRiskSubjects ?? 0}
                  subtitle={`of ${summary?.totalSubjects ?? 0} total subjects`}
                  icon={XCircle}
                  colorClass="text-warning"
                  ringClass="border-warning/20"
                />
                <StatCard
                  title="Subjects On Track"
                  value={summary?.onTrackSubjects ?? 0}
                  subtitle="Meeting protocol schedule"
                  icon={CheckCircle2}
                  colorClass="text-success"
                  ringClass="border-success/20"
                />
              </div>
            )}

            {/* ── Per-Subject Compliance Table ── */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Users className="h-4 w-4 text-primary" />
                  Subject Compliance Scores
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead>Subject ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Trial / Site</TableHead>
                        <TableHead>Phase</TableHead>
                        <TableHead>Compliance Score</TableHead>
                        <TableHead>Visits</TableHead>
                        <TableHead>Overdue</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-10">
                            <div className="flex items-center justify-center gap-2 text-muted-foreground">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Loading subject scores...
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : summary?.subjectScores?.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                            No subject data available.
                          </TableCell>
                        </TableRow>
                      ) : (
                        summary?.subjectScores?.map((sub) => (
                          <TableRow key={sub.patientId} className="hover:bg-muted/20">
                            <TableCell className="font-mono text-sm font-semibold">
                              {sub.patientId}
                            </TableCell>
                            <TableCell className="font-medium">{sub.patientName}</TableCell>
                            <TableCell>
                              <div className="text-xs text-muted-foreground">
                                <div>{sub.trial}</div>
                                <div className="flex items-center gap-1 mt-0.5">
                                  <MapPin className="h-2.5 w-2.5" />
                                  {sub.site}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">{sub.phase}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Progress
                                  value={sub.score}
                                  className="w-20 h-2"
                                />
                                <span
                                  className={`text-sm font-semibold ${
                                    sub.score >= 90
                                      ? "text-success"
                                      : sub.score >= 75
                                      ? "text-warning"
                                      : "text-destructive"
                                  }`}
                                >
                                  {sub.score}%
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm">
                              {sub.compliantVisits}/{sub.totalVisits}
                            </TableCell>
                            <TableCell>
                              {sub.overdueCount > 0 ? (
                                <Badge className="bg-destructive/10 text-destructive border-destructive/20">
                                  {sub.overdueCount} overdue
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground text-sm">—</span>
                              )}
                            </TableCell>
                            <TableCell>{getRiskBadge(sub.isAtRisk)}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* ── Protocol Deviations ── */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <ClipboardList className="h-4 w-4 text-primary" />
                    Protocol Deviations
                    {!devLoading && deviations.length > 0 && (
                      <Badge className="bg-destructive/10 text-destructive border-destructive/20 ml-1">
                        {deviations.length}
                      </Badge>
                    )}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Visits with status &quot;Scheduled&quot; whose scheduled date has passed
                  </p>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead>Deviation ID</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Visit</TableHead>
                        <TableHead>Scheduled Date</TableHead>
                        <TableHead>Days Overdue</TableHead>
                        <TableHead>Severity</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {devLoading ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-10">
                            <div className="flex items-center justify-center gap-2 text-muted-foreground">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Loading deviations...
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : deviations.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-10">
                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                              <CheckCircle2 className="h-8 w-8 text-success" />
                              <p>No protocol deviations detected. All subjects are on schedule.</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        deviations.map((dev) => {
                          const cfg = severityConfig[dev.severity];
                          const SevIcon = cfg.icon;
                          return (
                            <TableRow key={dev.id} className="hover:bg-muted/20">
                              <TableCell className="font-mono text-xs text-muted-foreground">
                                {dev.id}
                              </TableCell>
                              <TableCell>
                                <div>
                                  <div className="font-semibold text-sm">{dev.patientId}</div>
                                  <div className="text-xs text-muted-foreground">{dev.patientName}</div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <div className="text-sm font-medium">{dev.visitName}</div>
                                  <div className="text-xs text-muted-foreground">{dev.visitId}</div>
                                </div>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(dev.scheduledDate).toLocaleDateString()}
                                </div>
                              </TableCell>
                              <TableCell>
                                <span
                                  className={`font-bold text-sm ${
                                    dev.daysOverdue >= 7
                                      ? "text-destructive"
                                      : dev.daysOverdue >= 3
                                      ? "text-warning"
                                      : "text-primary"
                                  }`}
                                >
                                  {dev.daysOverdue}d
                                </span>
                              </TableCell>
                              <TableCell>
                                <Badge className={`${cfg.className} gap-1 text-xs`}>
                                  <SevIcon className="h-3 w-3" />
                                  {cfg.label}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {dev.deviationType}
                              </TableCell>
                              <TableCell className="text-right">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="gap-1"
                                      onClick={() => setSelectedDev(dev)}
                                    >
                                      <Eye className="h-4 w-4" />
                                      View
                                      <ChevronRight className="h-3 w-3" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                    <DialogHeader>
                                      <DialogTitle className="flex items-center gap-2">
                                        <AlertTriangle className="h-5 w-5 text-warning" />
                                        Protocol Deviation — {dev.id}
                                      </DialogTitle>
                                    </DialogHeader>

                                    <div className="mt-4 space-y-5">
                                      {/* Metadata grid */}
                                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 rounded-lg bg-muted/30 border">
                                        <div className="space-y-1">
                                          <p className="text-xs text-muted-foreground">Subject ID</p>
                                          <p className="text-sm font-semibold">{dev.patientId}</p>
                                        </div>
                                        <div className="space-y-1">
                                          <p className="text-xs text-muted-foreground">Name</p>
                                          <p className="text-sm font-semibold">{dev.patientName}</p>
                                        </div>
                                        <div className="space-y-1">
                                          <p className="text-xs text-muted-foreground">Visit</p>
                                          <p className="text-sm font-semibold">{dev.visitName}</p>
                                        </div>
                                        <div className="space-y-1">
                                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Calendar className="h-3 w-3" /> Scheduled Date
                                          </p>
                                          <p className="text-sm font-semibold">
                                            {new Date(dev.scheduledDate).toLocaleString()}
                                          </p>
                                        </div>
                                        <div className="space-y-1">
                                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                                            <MapPin className="h-3 w-3" /> Site
                                          </p>
                                          <p className="text-sm font-semibold">{dev.site}</p>
                                        </div>
                                        <div className="space-y-1">
                                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Layers className="h-3 w-3" /> Phase
                                          </p>
                                          <p className="text-sm font-semibold">{dev.phase}</p>
                                        </div>
                                        <div className="space-y-1 col-span-2 md:col-span-3">
                                          <p className="text-xs text-muted-foreground">Days Overdue</p>
                                          <p className={`text-lg font-bold ${
                                            dev.daysOverdue >= 7 ? "text-destructive" :
                                            dev.daysOverdue >= 3 ? "text-warning" : "text-primary"
                                          }`}>
                                            {dev.daysOverdue} day{dev.daysOverdue !== 1 ? "s" : ""} overdue
                                          </p>
                                        </div>
                                      </div>

                                      {/* Description */}
                                      <div className="space-y-2">
                                        <h3 className="font-semibold border-b pb-2">Deviation Description</h3>
                                        <p className="text-sm text-muted-foreground">{dev.description}</p>
                                      </div>

                                      {/* Missed Procedures */}
                                      {dev.procedures.length > 0 && (
                                        <div className="space-y-2">
                                          <h3 className="font-semibold border-b pb-2">
                                            Missed Procedures ({dev.procedures.length})
                                          </h3>
                                          <ul className="space-y-2">
                                            {dev.procedures.map((proc, i) => (
                                              <li
                                                key={i}
                                                className="flex items-start gap-2 text-sm p-2 rounded-md bg-muted/30 border"
                                              >
                                                <AlertTriangle className="h-3.5 w-3.5 text-warning mt-0.5 shrink-0" />
                                                {proc}
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

          </main>
          <Footer />
        </div>
      </div>
    </>
  );
}
