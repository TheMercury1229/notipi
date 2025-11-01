import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { useUserStore } from "@/store/userStore";
import { useEffect } from "react";

export function DashboardLayout() {
  const { loadUserData } = useUserStore();

  useEffect(() => {
    // Load user data when dashboard is mounted
    loadUserData();
  }, [loadUserData]);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}
