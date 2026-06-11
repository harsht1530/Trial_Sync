import { Bell, Search, User, ChevronDown, Menu, LogOut, Settings, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SidebarContent } from "./Sidebar";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";

const DUMMY_NOTIFICATIONS = [
  {
    id: 1,
    title: "Protocol Deviation",
    description: "High deviation detected in Subject #821. Action required.",
    time: "2 mins ago",
    type: "alert"
  },
  {
    id: 2,
    title: "New Enrollment",
    description: "New subject successfully enrolled in Phase II Cardiology trial.",
    time: "1 hour ago",
    type: "info"
  },
  {
    id: 3,
    title: "Deadline Reminder",
    description: "Data validation deadline for Site 04 approaching in 24 hours.",
    time: "3 hours ago",
    type: "warning"
  }
];

export function Header() {
  const [unreadCount, setUnreadCount] = useState(3);
  const { user, logout } = useAuth();

  const handleNotificationOpen = (open: boolean) => {
    if (open) {
      setUnreadCount(0);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card/80 backdrop-blur-xl px-4 sm:px-6">
      <div className="flex items-center gap-4">
        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <SidebarContent className="border-r-0" />
          </SheetContent>
        </Sheet>

      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Notifications */}
        <DropdownMenu onOpenChange={handleNotificationOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-muted-foreground" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
                  {unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Notifications</span>
              {unreadCount > 0 && (
                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  {unreadCount} New
                </span>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-[300px] overflow-y-auto">
              {DUMMY_NOTIFICATIONS.map((notification) => (
                <DropdownMenuItem key={notification.id} className="flex flex-col items-start gap-1 p-4 cursor-pointer">
                  <div className="flex w-full justify-between items-start">
                    <span className="font-semibold text-sm">{notification.title}</span>
                    <span className="text-[10px] text-muted-foreground">{notification.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {notification.description}
                  </p>
                </DropdownMenuItem>
              ))}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="w-full text-center justify-center text-primary font-medium text-xs py-2">
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-4 border-l border-border cursor-pointer hover:opacity-80 transition-opacity">
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent">
                <User className="h-3 w-3 sm:h-4 sm:w-4 text-primary-foreground" />
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium">{user?.name || "Dr. Sarah Chen"}</p>
                <p className="text-xs text-muted-foreground">{user?.role || "Principal Investigator"}</p>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              <UserCircle className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
