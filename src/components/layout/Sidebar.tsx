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

interface SidebarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const navigation = [
  { id: "dashboard", name: "Dashboard", icon: LayoutDashboard, path: "/" },
  { id: "patients", name: "Patients", icon: Users, path: "/patients" },
  { id: "validation", name: "Data Validation", icon: ClipboardCheck, path: "/validation" },
  { id: "epro", name: "ePRO", icon: ClipboardList, path: "/epro" },
  { id: "communications", name: "Communications", icon: MessageSquare, path: "/communications" },
  { id: "symptoms", name: "Symptoms", icon: Activity, path: "/symptoms" },
  { id: "analytics", name: "Analytics", icon: BarChart3, path: "/analytics" },
  { id: "monitoring", name: "Monitoring", icon: Activity, path: "/" },
  { id: "reports", name: "Reports", icon: FileText, path: "/" },
];

const bottomNav = [
  { id: "settings", name: "Settings", icon: Settings, path: "/" },
  { id: "compliance", name: "Compliance", icon: Shield, path: "/" },
];

export function Sidebar({ activeTab: propActiveTab, onTabChange }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine active tab based on current path
  const getActiveTabFromPath = () => {
    if (location.pathname === "/") return "dashboard";
    if (location.pathname === "/patients" || location.pathname.startsWith("/patient/")) return "patients";
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
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-6 border-b border-sidebar-border">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
          <Activity className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-sidebar-foreground">C.L.I.N.I.K</h1>
          <p className="text-[10px] text-sidebar-foreground/60 uppercase tracking-wider">Multi Agentic AI Platform</p>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex flex-col gap-1 p-4">
        <p className="px-3 mb-2 text-[10px] font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
          Main Menu
        </p>
        {navigation.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavClick(item)}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
              activeTab === item.id
                ? "bg-sidebar-accent text-sidebar-primary"
                : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
            )}
          >
            <item.icon className={cn(
              "h-5 w-5 transition-colors",
              activeTab === item.id ? "text-sidebar-primary" : ""
            )} />
            {item.name}
            {activeTab === item.id && (
              <div className="ml-auto h-1.5 w-1.5 rounded-full bg-sidebar-primary" />
            )}
          </button>
        ))}
      </nav>

      {/* Bottom Navigation */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-sidebar-border">
        {bottomNav.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavClick(item)}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 w-full",
              activeTab === item.id
                ? "bg-sidebar-accent text-sidebar-primary"
                : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.name}
          </button>
        ))}
      </div>
    </aside>
  );
}
