import { useState, useEffect } from "react";
import { Shield, Phone, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

export function Footer() {
  const [currentLogoIndex, setCurrentLogoIndex] = useState(0);

  const logos = [
    { src: "https://multiplierai.co/gmbtest/clinic-white.png", alt: "Clinic Logo", className: "w-40" },
    { src: "https://multiplierai.co/gmbtest/Logo_Applied-Innovation-Exchange_White.png", alt: "AIE Logo", className: "w-36" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLogoIndex((prev) => (prev + 1) % logos.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="w-full bg-transparent border-t border-border text-muted-foreground py-6 px-6 sm:px-12 mt-auto relative z-50">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* Left Side: Branding & Rotating Logo */}
        <div className="space-y-3 max-w-md w-full">
          <div className="h-16 flex items-center overflow-hidden relative w-56">
            {logos.map((logo, index) => (
              <img
                key={logo.src}
                className={cn(
                  logo.className,
                  "transition-opacity duration-1000 absolute brightness-0 opacity-70",
                  index === currentLogoIndex ? "opacity-70" : "opacity-0 pointer-events-none"
                )}
                src={logo.src}
                alt={logo.alt}
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground/80 leading-relaxed">
            C.L.I.N.I.K. Patient Portal is dedicated to streamlining clinical trial communication, monitoring, and compliance. Secure, compliant, and patient-first.
          </p>
        </div>

        {/* Middle Side: Support */}
        <div className="flex flex-col sm:flex-row gap-6 md:gap-12 shrink-0">
          <div className="space-y-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Study Support</h4>
            <div className="text-xs flex items-center gap-1.5 mt-1 text-muted-foreground">
              <Phone className="h-3.5 w-3.5" />
              <span>+1 (800) 555-0199</span>
            </div>
            <div className="text-xs flex items-center gap-1.5 text-muted-foreground">
              <Mail className="h-3.5 w-3.5" />
              <span>support@trial-nexus.com</span>
            </div>
          </div>

          {/* Right Side: Links */}
          <div className="space-y-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Helpful Links</h4>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs">
              <a href="#" className="hover:text-foreground transition-colors text-muted-foreground">Privacy Policy</a>
              <a href="#" className="hover:text-foreground transition-colors text-muted-foreground">Terms of Use</a>
              <a href="#" className="hover:text-foreground transition-colors text-muted-foreground">Study Info</a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-border mt-4 pt-3 flex flex-col sm:flex-row items-center justify-between text-[11px] text-muted-foreground/70">
        <p>© {new Date().getFullYear()} C.L.I.N.I.K. Clinical Trial Portal. All rights reserved.</p>
        <p className="mt-1 sm:mt-0 flex items-center gap-1">
          <Shield className="h-3 w-3" /> Secure & HIPAA Compliant
        </p>
      </div>
    </footer>
  );
}
