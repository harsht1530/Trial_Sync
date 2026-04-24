import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, HashRouter } from "react-router-dom";
import Index from "./pages/Index";
import Patients from "./pages/Subjects";
import DataValidation from "./pages/DataValidation";
import { PatientProfile } from "./pages/SubjectProfile";
import { EPRO } from "./pages/EPRO";
import { Communications } from "./pages/Communications";
import { SymptomTracker } from "./pages/SymptomTracker";
import { Analytics } from "./pages/Analytics";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/subject" element={<Patients />} />
          <Route path="/validation" element={<DataValidation />} />
          <Route path="/subjects/:id" element={<PatientProfile />} />
          <Route path="/epro" element={<EPRO />} />
          <Route path="/communications" element={<Communications />} />
          <Route path="/symptoms" element={<SymptomTracker />} />
          <Route path="/analytics" element={<Analytics />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
