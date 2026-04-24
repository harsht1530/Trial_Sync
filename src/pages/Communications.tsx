import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { PatientReminders } from "@/components/subject/SubjectReminders";
import { PatientChatbot } from "@/components/subject/SubjectChatbot";

export function Communications() {
  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />
      <div className="flex flex-col flex-1 lg:pl-64">
        <Header />
        <main className="flex-1 p-4 sm:p-6 bg-background">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PatientReminders patientId="PT-001" />
            <PatientChatbot patientId="PT-001" patientName="John Martinez" />
          </div>
        </main>
      </div>
    </div>
  );
}
