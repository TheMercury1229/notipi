import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Key,
  BarChart3,
  CreditCard,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: FileText, label: "Templates", path: "/dashboard/templates" },
  { icon: Key, label: "API Keys", path: "/dashboard/api-keys" },
  { icon: BarChart3, label: "Analytics", path: "/dashboard/analytics" },
  { icon: CreditCard, label: "Pricing", path: "/dashboard/pricing" },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <div className="hidden md:flex h-screen sticky w-64 flex-col border-r bg-sidebar ">
      <div className="p-6 border-b">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-sidebar-foreground">
              NotiPi
            </h1>
            <p className="text-xs text-muted-foreground">
              Notification Service
            </p>
          </div>
        </Link>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3",
                    isActive &&
                      "bg-sidebar-accent text-sidebar-accent-foreground"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      <div className="p-4 border-t">
        <div className="rounded-lg bg-muted p-4">
          <p className="text-sm font-medium text-foreground">Need Help?</p>
          <p className="text-xs text-muted-foreground mt-1">
            Check our documentation
          </p>
          <a href="https://www.npmjs.com/package/notipi" target="_blank">
            <Button size="sm" variant="outline" className="w-full mt-3">
              View Docs
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
