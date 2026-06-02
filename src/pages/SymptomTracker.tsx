import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { SymptomLogger } from "@/components/subject/SymptomLogger";
import { Footer } from "@/components/layout/Footer";

export function SymptomTracker() {
  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />
      <div className="flex flex-col flex-1 lg:pl-64 min-h-screen">
        <Header />
        <main className="flex-1 p-4 sm:p-6 bg-background">
          <SymptomLogger patientId="P001" />
        </main>
        <Footer />
      </div>
    </div>
  );
}
