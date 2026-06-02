import { useState, useEffect } from "react";
import { Linkedin, Youtube, Facebook, Instagram, Phone, Mail, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

export function Footer() {
  const [currentLogoIndex, setCurrentLogoIndex] = useState(0);

  const logos = [
    { src: "https://multiplierai.co/gmbtest/clinic-white.png", alt: "Clinic Logo", className: "h-14 w-auto object-contain" },
    { src: "https://multiplierai.co/gmbtest/Logo_Applied-Innovation-Exchange_White.png", alt: "AIE Logo", className: "h-10 w-auto object-contain" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLogoIndex((prev) => (prev + 1) % logos.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="w-full bg-sidebar border-t border-sidebar-border text-blue-100 py-6 sm:py-8 px-6 sm:px-12 mt-auto relative z-50">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* Branding Column */}
        <div className="space-y-4">
          <div className="h-16 flex items-center overflow-hidden relative w-56">
            {logos.map((logo, index) => (
              <img
                key={logo.src}
                className={cn(
                  logo.className,
                  "transition-opacity duration-1000 absolute",
                  index === currentLogoIndex ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                src={logo.src}
                alt={logo.alt}
              />
            ))}
          </div>

          <p className="text-xs leading-relaxed text-blue-100/90">
            We harness the power of advanced AI, comprehensive data analytics, and innovative digital marketing to empower pharmaceutical marketers and agencies. Our goal is to multiply your revenue, streamline operations, and elevate the impact of your pharma and healthcare campaigns.
          </p>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-2">
              Stay in Touch With Us
            </h4>
            <div className="flex items-center gap-3">
              <a href="#" className="h-8 w-8 rounded-full bg-[#004e96] hover:bg-white hover:text-primary transition-colors flex items-center justify-center text-white">
                <Linkedin className="h-4 w-4" />
              </a>
              <a href="#" className="h-8 w-8 rounded-full bg-[#004e96] hover:bg-white hover:text-primary transition-colors flex items-center justify-center text-white">
                <Youtube className="h-4 w-4" />
              </a>
              <a href="#" className="h-8 w-8 rounded-full bg-[#004e96] hover:bg-white hover:text-primary transition-colors flex items-center justify-center text-white">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="h-8 w-8 rounded-full bg-[#004e96] hover:bg-white hover:text-primary transition-colors flex items-center justify-center text-white">
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Corporate Links Column */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-white border-b border-white/20 pb-2 mb-4">
            Corporate Links
          </h3>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="text-blue-100 hover:text-white transition-colors block">Careers</a></li>
            <li><a href="#" className="text-blue-100 hover:text-white transition-colors block">Podcast</a></li>
            <li><a href="#" className="text-blue-100 hover:text-white transition-colors block">Blogs</a></li>
            <li><a href="#" className="text-blue-100 hover:text-white transition-colors block">Privacy Policy</a></li>
            <li><a href="#" className="text-blue-100 hover:text-white transition-colors block">Terms and Conditions</a></li>
            <li><a href="#" className="text-blue-100 hover:text-white transition-colors block">Refund Policy</a></li>
          </ul>
        </div>

        {/* Our Solutions Column */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-white border-b border-white/20 pb-2 mb-4">
            Our Solutions
          </h3>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="text-blue-100 hover:text-white transition-colors block">GenAI Doctor Data Platform</a></li>
            <li><a href="#" className="text-blue-100 hover:text-white transition-colors block">Patient Intelligence Platform</a></li>
            <li><a href="#" className="text-blue-100 hover:text-white transition-colors block">Platform for Driving New Patients</a></li>
            <li><a href="#" className="text-blue-100 hover:text-white transition-colors block">Doctor Referral Platform</a></li>
            <li><a href="#" className="text-blue-100 hover:text-white transition-colors block">GPT & LLM Based Tools</a></li>
            <li><a href="#" className="text-blue-100 hover:text-white transition-colors block">Doctor Mobile and Email Platform</a></li>
          </ul>
        </div>

        {/* Information Column */}
        <div className="space-y-4 text-sm">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-white border-b border-white/20 pb-2 mb-4">
              Information
            </h3>
            <div className="space-y-3">
              <div>
                <span className="text-xs uppercase tracking-wider text-white font-bold block">
                  Phone Number
                </span>
                <span className="text-blue-100 block mt-1 flex items-center gap-1.5 font-medium">
                  <Phone className="h-3.5 w-3.5 text-white" />
                  US: +1 925 217 7578
                </span>
                <span className="text-blue-100 block flex items-center gap-1.5 font-medium">
                  <Phone className="h-3.5 w-3.5 text-white" />
                  IN: +91 91003 79991
                </span>
              </div>

              <div>
                <span className="text-xs uppercase tracking-wider text-white font-bold block">
                  Email Address
                </span>
                <span className="text-blue-100 block mt-1 flex items-center gap-1.5 font-medium">
                  <Mail className="h-3.5 w-3.5 text-white" />
                  sales@multipliersolutions.com
                </span>
              </div>

              <div>
                <span className="text-xs uppercase tracking-wider text-white font-bold block">
                  Head Office
                </span>
                <span className="text-blue-100 block mt-1 flex items-start gap-1.5 leading-snug font-medium">
                  <MapPin className="h-3.5 w-3.5 text-white mt-0.5 flex-shrink-0" />
                  5th Floor, RS Silicon Park, Madhapur, Hyderabad, Telangana 500081
                </span>
              </div>

              <div>
                <span className="text-xs uppercase tracking-wider text-white font-bold block">
                  Branch Office
                </span>
                <span className="text-blue-100 block mt-1 flex items-start gap-1.5 leading-snug font-medium">
                  <MapPin className="h-3.5 w-3.5 text-white mt-0.5 flex-shrink-0" />
                  17th Floor, Tower A-1719, Spectrum Mall, Sector - 75, Noida, UP-201301
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

      <div className="max-w-7xl mx-auto border-t border-white/10 mt-6 pt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-blue-200">
        <p>© {new Date().getFullYear()} Multiplier AI Solutions. All rights reserved.</p>
        <p className="mt-2 sm:mt-0">Clinical Trial Subject & Investigator Automation Platform</p>
      </div>
    </footer>
  );
}
