import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bot, X } from "lucide-react";
import { PatientChatbot } from "../subject/SubjectChatbot";
import { cn } from "@/lib/utils";

export const GlobalFloatingChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 w-[calc(100vw-32px)] sm:w-[420px] h-[500px] sm:h-[600px] max-h-[calc(100vh-120px)] shadow-2xl rounded-2xl overflow-hidden border border-border bg-background/95 backdrop-blur-md animate-in slide-in-from-bottom-5 duration-200 z-50">
          <PatientChatbot patientId="PT-001" patientName="John Martinez" className="min-h-0 lg:min-h-0 h-full" />
        </div>
      )}
      
      <Button
        onClick={() => setIsOpen(!isOpen)}
        size="lg"
        className={cn(
          "h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 flex items-center justify-center p-0 transition-transform hover:scale-105 duration-200 active:scale-95 relative",
          isOpen && "rotate-90"
        )}
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <>
            <Bot className="h-6 w-6 text-white animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-success"></span>
            </span>
          </>
        )}
      </Button>
    </div>
  );
};
