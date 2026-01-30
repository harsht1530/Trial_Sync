import { Helmet } from "react-helmet";
import { useParams, useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { PatientProfile } from "@/components/patient/PatientProfile";
import { MedicalHistory } from "@/components/patient/MedicalHistory";
import { WearableData } from "@/components/patient/WearableData";
import { EPROSubmissions } from "@/components/patient/EPROSubmissions";
import { PatientReminders } from "@/components/patient/PatientReminders";
import { PatientChatbot } from "@/components/patient/PatientChatbot";
import { SymptomLogger } from "@/components/patient/SymptomLogger";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const PatientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock patient data - in production this would come from an API
  const patient = {
    id: id || "P-001",
    name: "Sarah Johnson",
    age: 45,
    gender: "Female",
    email: "sarah.johnson@email.com",
    phone: "+1 (555) 123-4567",
    enrollmentDate: "2024-01-15",
    trialPhase: "Phase 2",
    siteId: "SITE-NYC-01",
    status: "Active",
    avatar: null,
    address: "123 Medical Center Drive, New York, NY 10001",
    emergencyContact: {
      name: "Michael Johnson",
      relationship: "Spouse",
      phone: "+1 (555) 987-6543"
    }
  };

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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Patient Reminders & Automated Calls */}
                <PatientReminders patientId={patient.id} />
                
                {/* Patient Chatbot */}
                <PatientChatbot patientId={patient.id} patientName={patient.name} />
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default PatientDetail;
