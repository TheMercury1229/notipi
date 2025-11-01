import { useEffect, useState } from "react";
import { Mail, FileText, Key, TrendingUp, Loader2 } from "lucide-react";
import { Navbar } from "@/components/dashboard/Navbar";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { useUserStore } from "@/store/userStore";
import { useAuthStore } from "@/store/authStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Line, LineChart, XAxis, YAxis, CartesianGrid } from "recharts";
import { authService, templateService, apiKeyService } from "@/lib/api.service";
import { toast } from "sonner";

const emailData = [
  { day: "Mon", emails: 45 },
  { day: "Tue", emails: 78 },
  { day: "Wed", emails: 120 },
  { day: "Thu", emails: 95 },
  { day: "Fri", emails: 142 },
  { day: "Sat", emails: 67 },
  { day: "Sun", emails: 89 },
];

const chartConfig = {
  emails: {
    label: "Emails",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export default function DashboardPage() {
  const { stats, updateStats } = useUserStore();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all data in parallel
      const [templatesRes, apiKeysRes, profileRes] = await Promise.all([
        templateService.getAllTemplates().catch((err) => {
          console.error("Templates fetch error:", err);
          return null;
        }),
        apiKeyService.getAllApiKeys().catch((err) => {
          console.error("API keys fetch error:", err);
          return null;
        }),
        authService.getUserProfile().catch((err) => {
          console.error("Profile fetch error:", err);
          return null;
        }),
      ]);

      // Update stats based on real data
      const updates: any = {};

      if (templatesRes?.success && templatesRes.data) {
        updates.templatesCreated = templatesRes.data.length;
      }

      if (apiKeysRes?.success && apiKeysRes.data) {
        const activeKeys = apiKeysRes.data.filter(
          (key: any) => !key.isRevoked
        );
        updates.activeApiKeys = activeKeys.length;
      }

      if (profileRes?.success && profileRes.data?.usage) {
        const emailUsage = profileRes.data.usage.find(
          (u: any) => u.type === "email"
        );
        if (emailUsage) {
          updates.emailsSent = emailUsage.usedLimit || 0;
          updates.usageLimit = emailUsage.allowedLimit || 5000;
          updates.usagePercentage = Math.round(
            ((emailUsage.usedLimit || 0) / (emailUsage.allowedLimit || 5000)) *
              100
          );
        }
      }

      // Apply updates if we have any
      if (Object.keys(updates).length > 0) {
        updateStats(updates);
      }
    } catch (error: any) {
      console.error("Failed to fetch dashboard data:", error);
      // Don't show error toast on initial load, as it might be expected
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 ">
      <Navbar title="Dashboard" />

      <main className="p-6 space-y-6 overflow-auto">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">
                Loading dashboard data...
              </span>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <DashboardCard
            title="Emails Sent"
            value={stats.emailsSent.toLocaleString()}
            icon={Mail}
            description="Total notifications delivered"
            trend={{ value: 12.5, isPositive: true }}
          />
          <DashboardCard
            title="Templates Created"
            value={stats.templatesCreated}
            icon={FileText}
            description="Active email templates"
            trend={{ value: 8.2, isPositive: true }}
          />
          <DashboardCard
            title="Active API Keys"
            value={stats.activeApiKeys}
            icon={Key}
            description="Currently active keys"
          />
          <DashboardCard
            title="Usage This Month"
            value={`${stats.usagePercentage}%`}
            icon={TrendingUp}
            description={`${stats.emailsSent} of ${stats.usageLimit}`}
          />
        </div>

        {/* Usage Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Usage Limit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {stats.emailsSent} emails sent
                </span>
                <span className="font-medium">{stats.usageLimit} limit</span>
              </div>
              <Progress value={stats.usagePercentage} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {(stats.usageLimit - stats.emailsSent).toLocaleString()} emails
                remaining this month
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Email Activity Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Emails Sent (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <LineChart data={emailData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="emails"
                  stroke="var(--color-emails)"
                  strokeWidth={2}
                  dot={{ fill: "var(--color-emails)" }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}