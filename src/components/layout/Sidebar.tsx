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
  ClipboardList,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export interface SidebarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  className?: string;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

const navigation = [
  { id: "dashboard", name: "Dashboard", icon: LayoutDashboard, path: "/" },
  { id: "subject", name: "Subject", icon: Users, path: "/subject" },
  { id: "validation", name: "Data Validation", icon: ClipboardCheck, path: "/validation" },
  { id: "epro", name: "ePRO", icon: ClipboardList, path: "/epro" },
  { id: "communications", name: "Communications", icon: MessageSquare, path: "/communications" },
  { id: "symptoms", name: "Symptoms", icon: Activity, path: "/symptoms" },
  { id: "analytics", name: "Analytics", icon: BarChart3, path: "/analytics" },
  { id: "compliance", name: "Compliance", icon: Shield, path: "/compliance" },
];

const bottomNav = [
  { id: "settings", name: "Settings", icon: Settings, path: "/" },
  { id: "logout", name: "Logout", icon: LogOut, path: "#" },
];

import { ChevronLeft } from "lucide-react";

export function SidebarContent({ activeTab: propActiveTab, onTabChange, className, collapsed = false, onCollapsedChange }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
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

  const getActiveTabFromPath = () => {
    if (location.pathname === "/") return "dashboard";
    if (location.pathname === "/subject" || location.pathname.startsWith("/subjects/")) return "subject";
    if (location.pathname === "/validation") return "validation";
    if (location.pathname === "/epro") return "epro";
    if (location.pathname === "/communications") return "communications";
    if (location.pathname === "/symptoms") return "symptoms";
    if (location.pathname === "/analytics") return "analytics";
    if (location.pathname === "/compliance") return "compliance";
    return "";
  };

  const activeTab = propActiveTab || getActiveTabFromPath();
  const handleNavClick = (item: { id: string; name: string; icon: any; path: string }) => {
    if (onTabChange) {
      onTabChange(item.id);
    }
    if (item.id === "logout") {
      logout();
      return;
    }
    if (item.path.startsWith("http")) {
      window.location.href = item.path;
    } else {
      navigate(item.path);
    }
  };

  return (
    <div className={cn("flex flex-col h-full bg-sidebar border-r border-sidebar-border w-full relative transition-all duration-300", className)}>
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="icon-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0058AB" />
            <stop offset="100%" stopColor="#00D5D0" />
          </linearGradient>
        </defs>
      </svg>

      <div className={cn("flex h-16 items-center px-6 border-b border-sidebar-border", collapsed ? "justify-center px-0" : "gap-3")}>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent shrink-0">
          <img src="https://multiplierai.co/gmbtest/Capgemini_Primary-spade_Capgemini-white.png" alt="Capgemini Logo" />
        </div>
        {!collapsed && (
          <div className="ms-2 h-14 flex flex-1 items-center justify-center overflow-hidden relative">
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
        )}
      </div>

      <nav className="flex flex-col gap-1 p-4 overflow-y-auto">
        <a href="https://multiplierai.co/agent/Trial_Sync_3/" className={cn("px-3 mb-2 text-[10px] font-semibold text-sidebar-foreground/50 uppercase tracking-wider hover:text-sidebar-foreground transition-colors cursor-pointer block", collapsed && "text-center px-1")}>
          {collapsed ? "•" : "Main Menu"}
        </a>
        {navigation.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item)}
              title={collapsed ? item.name : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-200",
                collapsed ? "justify-center py-2.5 px-0" : "px-3 py-2.5",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary shadow-sm"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
            >
              <item.icon
                className="h-5 w-5 transition-colors shrink-0"
                stroke={isActive ? "url(#icon-gradient)" : "currentColor"}
              />
              {!collapsed && <span>{item.name}</span>}
              {isActive && !collapsed && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-sidebar-primary" />
              )}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto p-4 border-t border-sidebar-border space-y-1">
        {bottomNav.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item)}
              title={collapsed ? item.name : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-200 w-full",
                collapsed ? "justify-center py-2.5 px-0" : "px-3 py-2.5",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
            >
              <item.icon
                className="h-5 w-5 shrink-0"
                stroke={isActive ? "url(#icon-gradient)" : "currentColor"}
              />
              {!collapsed && <span>{item.name}</span>}
            </button>
          );
        })}
      </div>

      <button
        onClick={() => onCollapsedChange?.(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-card border border-border shadow-sm hidden lg:flex items-center justify-center hover:bg-muted transition-colors z-50"
      >
        <ChevronLeft className={cn("w-3.5 h-3.5 text-muted-foreground transition-transform", collapsed && "rotate-180")} />
      </button>
    </div>
  );
}

export function Sidebar(props: SidebarProps) {
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem("sidebar-collapsed") === "true";
  });

  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", collapsed.toString());
    if (collapsed) {
      document.body.classList.add("sidebar-collapsed");
    } else {
      document.body.classList.remove("sidebar-collapsed");
    }
  }, [collapsed]);

  return (
    <aside className={cn("fixed left-0 top-0 z-40 h-screen hidden lg:flex transition-all duration-300", collapsed ? "w-[72px]" : "w-64")}>
      <SidebarContent {...props} collapsed={collapsed} onCollapsedChange={setCollapsed} />
    </aside>
  );
}
