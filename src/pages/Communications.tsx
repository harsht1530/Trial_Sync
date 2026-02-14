import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { PatientReminders } from "@/components/patient/PatientReminders";
import { PatientChatbot } from "@/components/patient/PatientChatbot";

export function Communications() {
  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />
      <div className="flex flex-col flex-1 pl-64">
        <Header />
        <main className="flex-1 p-6 bg-background">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PatientReminders patientId="P001" />
            <PatientChatbot patientId="P001" patientName="John Doe" />
          </div>
        </main>
      </div>
    </div>
  );
}
