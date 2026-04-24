import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { API_BASE_URL } from "@/lib/api";
import { PatientProfile as PatientProfileComponent } from "@/components/subject/SubjectProfile";
import { MedicalHistory } from "@/components/subject/MedicalHistory";
import { PatientReminders } from "@/components/subject/SubjectReminders";
import { WearableData } from "@/components/subject/WearableData";

import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

export function PatientProfile() {
  const { id } = useParams();
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/subjects/${id}`)
      .then(res => res.json())
      .then(data => {
        if (!data || data.error) {
          setPatient(null);
        } else {
          setPatient({
            ...data,
            trialPhase: data.phase,
            siteId: data.site,
          });
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching patient", err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p>Loading patient profile...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <p className="text-muted-foreground text-lg">Patient not found.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />
      <div className="flex flex-col flex-1 lg:pl-64">
        <Header />
        <main className="flex-1 p-4 sm:p-6 bg-background">
          <div className="space-y-6">
            <PatientProfileComponent patient={patient} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-6">
                <MedicalHistory patientId={patient.id} />
                <WearableData patientId={patient.id} />
              </div>
              <div className="lg:col-span-2">
                <PatientReminders patientId={patient.id} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
