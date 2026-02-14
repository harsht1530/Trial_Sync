import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { PatientProfile as PatientProfileComponent } from "@/components/patient/PatientProfile";
import { MedicalHistory } from "@/components/patient/MedicalHistory";
import { PatientReminders } from "@/components/patient/PatientReminders";
import { WearableData } from "@/components/patient/WearableData";

const mockPatient = {
  id: "P001",
  name: "John Doe",
  age: 45,
  gender: "Male",
  email: "john.doe@example.com",
  phone: "123-456-7890",
  enrollmentDate: "2023-01-15",
  trialPhase: "Phase 3",
  siteId: "SITE-001",
  status: "Active",
  avatar: null,
  address: "123 Main St, Anytown, USA",
  emergencyContact: {
    name: "Jane Doe",
    relationship: "Spouse",
    phone: "098-765-4321",
  },
};

export function PatientProfile() {
  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />
      <div className="flex flex-col flex-1 pl-64">
        <Header />
        <main className="flex-1 p-6 bg-background">
          <div className="space-y-6">
            <PatientProfileComponent patient={mockPatient} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-6">
                <MedicalHistory patientId={mockPatient.id} />
                <WearableData patientId={mockPatient.id} />
              </div>
              <div className="lg:col-span-2">
                <PatientReminders patientId={mockPatient.id} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
