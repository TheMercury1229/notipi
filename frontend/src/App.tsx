import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import { DashboardLayout } from "./components/dashboard/DashboardLayout";
import DashboardPage from "./pages/dashboard/DashboardPage";
import TemplatesPage from "./pages/dashboard/TemplatesPage";
import TemplateEditorPage from "./pages/dashboard/TemplateEditorPage";
import ApiKeysPage from "./pages/dashboard/ApiKeysPage";
import AnalyticsPage from "./pages/dashboard/AnalyticsPage";
import PricingPage from "./pages/dashboard/PricingPage";
import { Toaster } from "./components/ui/sonner";
import { useAuthStore } from "./store/authStore";
import { ThemeProvider } from "./components/ui/theme-provider";
import { authService } from "@/lib/api.service";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { isAuthenticated, token, setUser, logout } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const validateAuth = async () => {
      if (!token || !isAuthenticated) {
        setLoading(false);
        setIsValid(false);
        return;
      }

      try {
        // Verify token is still valid by fetching user profile
        const response = await authService.getUserProfile();
        if (response.success) {
          setUser(response.data);
          setIsValid(true);
        } else {
          logout();
          setIsValid(false);
        }
      } catch (error) {
        console.error("Auth validation error:", error);
        logout();
        setIsValid(false);
      } finally {
        setLoading(false);
      }
    };

    validateAuth();
  }, [token, isAuthenticated, setUser, logout]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isValid) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <BrowserRouter>
        <Routes>
          {/* Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />

          {/* Protected Dashboard Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="templates" element={<TemplatesPage />} />
            <Route path="templates/new" element={<TemplateEditorPage />} />
            <Route path="templates/edit/:id" element={<TemplateEditorPage />} />
            <Route path="api-keys" element={<ApiKeysPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="pricing" element={<PricingPage />} />
          </Route>

          {/* Catch all - redirect to landing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;