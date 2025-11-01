import { Loader } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useRef } from "react";
import { useUser } from "@clerk/clerk-react";
import { axiosInstance } from "@/lib/axios";
import { useNavigate } from "react-router-dom";

const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const { isLoaded, user } = useUser();
  const syncAttempted = useRef(false);

  useEffect(() => {
    const syncUser = async () => {
      if (!isLoaded || !user || syncAttempted.current) return;

      try {
        syncAttempted.current = true;

        // Sync user with backend
        await axiosInstance.post("/auth/callback", {
          clerkId: user.id,
        });

        // Navigate to dashboard on success
        navigate("/dashboard");
      } catch (error) {
        console.error("Error in auth callback:", error);
        // Navigate to dashboard anyway to prevent being stuck
        navigate("/dashboard");
      }
    };

    syncUser();
  }, [isLoaded, user, navigate]);

  return (
    <div className="h-screen w-full bg-background flex items-center justify-center">
      <Card className="w-[90%] max-w-md">
        <CardContent className="flex flex-col items-center gap-4 pt-6">
          <Loader className="w-6 h-6 text-primary animate-spin" />
          <h3 className="text-xl font-bold">Logging you in</h3>
          <p className="text-muted-foreground text-sm">
            Redirecting to dashboard...
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthCallbackPage;
