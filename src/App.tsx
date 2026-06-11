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
import { GlobalFloatingChatbot } from "@/components/layout/GlobalFloatingChatbot";

import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import Login from "./pages/Login";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <HashRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/subject" element={<ProtectedRoute><Patients /></ProtectedRoute>} />
            <Route path="/validation" element={<ProtectedRoute><DataValidation /></ProtectedRoute>} />
            <Route path="/subjects/:id" element={<ProtectedRoute><PatientProfile /></ProtectedRoute>} />
            <Route path="/epro" element={<ProtectedRoute><EPRO /></ProtectedRoute>} />
            <Route path="/communications" element={<ProtectedRoute><Communications /></ProtectedRoute>} />
            <Route path="/symptoms" element={<ProtectedRoute><SymptomTracker /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <GlobalFloatingChatbot />
        </HashRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
