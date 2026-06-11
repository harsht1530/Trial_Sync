import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ShieldAlert } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center items-center gap-4 text-center">
        {/* Elegant modern loader */}
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
          <ShieldAlert className="absolute h-6 w-6 text-primary animate-pulse" />
        </div>
        <div className="space-y-1">
          <h3 className="font-bold text-lg tracking-tight">Securing Session</h3>
          <p className="text-sm text-muted-foreground">Verifying secure credentials with Clinical Nexus...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
