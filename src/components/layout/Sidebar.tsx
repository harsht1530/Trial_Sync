import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  MessageSquare,
  BarChart3,
  Settings,
  Activity,
  FileText,
  Shield,
  ClipboardList
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation, useNavigate } from "react-router-dom";

export interface SidebarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  className?: string;
}

const navigation = [
  { id: "dashboard", name: "Dashboard", icon: LayoutDashboard, path: "/" },
  { id: "subject", name: "Subject", icon: Users, path: "/subject" },
  { id: "validation", name: "Data Validation", icon: ClipboardCheck, path: "/validation" },
  { id: "epro", name: "ePRO", icon: ClipboardList, path: "/epro" },
  { id: "communications", name: "Communications", icon: MessageSquare, path: "/communications" },
  { id: "symptoms", name: "Symptoms", icon: Activity, path: "/symptoms" },
  { id: "analytics", name: "Analytics", icon: BarChart3, path: "/analytics" },
  // { id: "monitoring", name: "Monitoring", icon: Activity, path: "/" },
  // { id: "reports", name: "Reports", icon: FileText, path: "/" },
];

const bottomNav = [
  { id: "settings", name: "Settings", icon: Settings, path: "/" },
  { id: "compliance", name: "Compliance", icon: Shield, path: "/" },
];

export function SidebarContent({ activeTab: propActiveTab, onTabChange, className }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentLogoIndex, setCurrentLogoIndex] = useState(0);

  const logos = [
    { src: "https://multiplierai.co/gmbtest/clinic-white.png", alt: "Clinic Logo", className: "w-40 mt-2" },
    { src: "https://multiplierai.co/gmbtest/Logo_Applied-Innovation-Exchange_White.png", alt: "AIE Logo", className: "w-36 mt-4" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLogoIndex((prev) => (prev + 1) % logos.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Determine active tab based on current path
  const getActiveTabFromPath = () => {
    if (location.pathname === "/") return "dashboard";
    if (location.pathname === "/subject" || location.pathname.startsWith("/subjects/")) return "subject";
    if (location.pathname === "/validation") return "validation";
    if (location.pathname === "/epro") return "epro";
    if (location.pathname === "/communications") return "communications";
    if (location.pathname === "/symptoms") return "symptoms";
    if (location.pathname === "/analytics") return "analytics";
    return "";
  };

  const activeTab = propActiveTab || getActiveTabFromPath();
  const handleNavClick = (item: typeof navigation[0]) => {
    if (onTabChange) {
      onTabChange(item.id);
    }
    navigate(item.path);
  };

  return (
    <div className={cn("flex flex-col h-full bg-sidebar border-r border-sidebar-border w-64", className)}>
      {/* Global Gradient Defs for Icons */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="icon-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0058AB" /> {/* Capgemini Blue */}
            <stop offset="100%" stopColor="#00D5D0" /> {/* Turquoise */}
          </linearGradient>
        </defs>
      </svg>

      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-6 border-b border-sidebar-border">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
          {/* <Activity className="h-5 w-5 text-primary-foreground" /> */}
          <img src="https://multiplierai.co/gmbtest/Capgemini_Primary-spade_Capgemini-white.png" alt="Capgemini Logo" />
        </div>
        <div className="ms-20 h-14 flex items-center justify-center overflow-hidden">
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
      </div>
      {/* Main Navigation */}
      <nav className="flex flex-col gap-1 p-4">
        <p className="px-3 mb-2 text-[10px] font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
          Main Menu
        </p>
        {navigation.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
            >
              <item.icon
                className="h-5 w-5 transition-colors"
                stroke={isActive ? "url(#icon-gradient)" : "currentColor"}
              />
              {item.name}
              {isActive && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-sidebar-primary" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className="mt-auto p-4 border-t border-sidebar-border">
        {bottomNav.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 w-full",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
            >
              <item.icon
                className="h-5 w-5"
                stroke={isActive ? "url(#icon-gradient)" : "currentColor"}
              />
              {item.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function Sidebar(props: SidebarProps) {
  return (
    <aside className="fixed left-0 top-0 z-40 h-screen hidden lg:flex">
      <SidebarContent {...props} />
    </aside>
  );
}
