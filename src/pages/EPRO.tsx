import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { EPROSubmissions } from "@/components/subject/EPROSubmissions";
import { Footer } from "@/components/layout/Footer";
import { useSearchParams } from "react-router-dom";

export function EPRO() {
  const [searchParams] = useSearchParams();
  const patientId = searchParams.get("patientId") || "VIJA-1602";

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />
      <div className="flex flex-col flex-1 lg:pl-64 min-h-screen">
        <Header />
        <main className="flex-1 p-4 sm:p-6 bg-background">
          <EPROSubmissions patientId={patientId} />
        </main>
        <Footer />
      </div>
    </div>
  );
}
