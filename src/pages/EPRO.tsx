import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { EPROSubmissions } from "@/components/subject/EPROSubmissions";
import { Footer } from "@/components/layout/Footer";
import { useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { API_BASE_URL } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Loader2 } from "lucide-react";

interface SubjectItem {
  patient_id: string;
  subject_name: string;
}

export function EPRO() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { authenticatedFetch } = useAuth();

  useEffect(() => {
    authenticatedFetch(`${API_BASE_URL}/api/subjects`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setSubjects(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching subjects:", err);
        setLoading(false);
      });
  }, []);

  const patientId = searchParams.get("patientId") || "all";

  const handleSubjectChange = (val: string) => {
    setSearchParams({ patientId: val });
  };

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />
      <div className="flex flex-col flex-1 lg:pl-64 min-h-screen">
        <Header />
        <main className="flex-1 p-4 sm:p-6 bg-background space-y-6">
          <Card className="border-primary/10 bg-gradient-to-r from-primary/5 via-transparent to-transparent">
            <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight">ePRO Submissions</h1>
                <p className="text-sm text-muted-foreground">
                  Monitor patient-reported outcomes, daily symptom diaries, and questionnaire compliance.
                </p>
              </div>

              {loading ? (
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading subjects...
                </div>
              ) : (
                <div className="flex items-center gap-3 min-w-[280px]">
                  <Users className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-sm font-medium shrink-0">Subject:</span>
                  <Select value={patientId} onValueChange={handleSubjectChange}>
                    <SelectTrigger className="w-full bg-background border-primary/20 hover:border-primary/40 focus:ring-primary/40 transition-colors">
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Subjects</SelectItem>
                      {subjects.map((sub) => (
                        <SelectItem key={sub.patient_id} value={sub.patient_id}>
                          {sub.patient_id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          {patientId && <EPROSubmissions patientId={patientId} />}
        </main>
        <Footer />
      </div>
    </div>
  );
}

