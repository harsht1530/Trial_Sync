import { Helmet } from "react-helmet";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { PatientProfile } from "@/components/subject/SubjectProfile";
import { MedicalHistory } from "@/components/subject/MedicalHistory";
import { WearableData } from "@/components/subject/WearableData";
import { EPROSubmissions } from "@/components/subject/EPROSubmissions";
import { PatientReminders } from "@/components/subject/SubjectReminders";
import { PatientChatbot } from "@/components/subject/SubjectChatbot";
import { SymptomLogger } from "@/components/subject/SymptomLogger";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Footer } from "@/components/layout/Footer";

const PatientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    
    // In production this would come from an API
    fetch(`http://localhost:5000/api/subjects/${id}`, {
      headers: {
        'Authorization': 'Bearer dummy-token'
      }
    })
    .then(res => res.json())
    .then(data => {
      // Map database schema to frontend expected format
      const mappedPatient = {
        id: data.patient_id,
        name: data.subject_name || "Unknown",
        age: data.age || 45, // Using virtual or mock
        gender: data.gender || "Not specified",
        email: data.contact?.email || "No email",
        phone: data.contact?.phone || "No phone",
        enrollmentDate: data.enrollment_date || new Date().toISOString(),
        trialPhase: data.phase || "Unknown",
        siteId: data.site || "Unknown Site",
        status: data.status || "Unknown",
        avatar: null,
        address: "Not specified",
        emergencyContact: {
          name: data.emergency_contact?.name || "Not specified",
          relationship: data.emergency_contact?.relationship || "N/A",
          phone: data.emergency_contact?.phone || "No phone"
        }
      };
      setPatient(mappedPatient);
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }
  
  if (!patient) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Patient not found</div>;
  }

  return (
    <>
      <Helmet>
        <title>Patient Details - {patient.name} | TrialSync</title>
        <meta name="description" content={`View detailed patient profile, medical history, wearable data, and ePRO submissions for ${patient.name}`} />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <Sidebar />
        
        <div className="ml-64 flex flex-col min-h-screen">
          <Header />
          
          <main className="flex-1 p-6 overflow-auto">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Back Navigation */}
              <Button 
                variant="ghost" 
                onClick={() => navigate("/")}
                className="gap-2 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>

              {/* Patient Profile Section */}
              <PatientProfile patient={patient} />

              {/* Two Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Medical History */}
                <MedicalHistory patientId={patient.id} />
                
                {/* Wearable Data */}
                <WearableData patientId={patient.id} />
              </div>

              {/* ePRO Submissions - Full Width */}
              <EPROSubmissions patientId={patient.id} />

              {/* Symptom Tracking - Full Width */}
              <SymptomLogger patientId={patient.id} />

              {/* Reminders & Chatbot Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                {/* Patient Reminders & Automated Calls */}
                <PatientReminders patientId={patient.id} />
                
                {/* Patient Chatbot */}
                <PatientChatbot patientId={patient.id} patientName={patient.name} className="h-[600px] lg:h-[calc(100vh-240px)] min-h-[500px] lg:min-h-[600px]" />
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </div>
    </>
  );
};

export default PatientDetail;
