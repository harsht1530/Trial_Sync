import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { SymptomLogger } from "@/components/patient/SymptomLogger";

export function SymptomTracker() {
  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />
      <div className="flex flex-col flex-1 pl-64">
        <Header />
        <main className="flex-1 p-6 bg-background">
          <SymptomLogger patientId="P001" />
        </main>
      </div>
    </div>
  );
}
