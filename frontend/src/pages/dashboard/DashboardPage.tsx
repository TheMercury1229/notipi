import { Mail, FileText, Key, TrendingUp } from "lucide-react";
import { Navbar } from "@/components/dashboard/Navbar";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { useUserStore } from "@/store/userStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Line, LineChart, XAxis, YAxis, CartesianGrid } from "recharts";

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
  const { stats } = useUserStore();

  return (
    <div className="flex-1 ">
      <Navbar title="Dashboard" />

      <main className="p-6 space-y-6 overflow-auto">
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

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  action: "Template created",
                  name: "Welcome Email",
                  time: "2 hours ago",
                },
                {
                  action: "API Key generated",
                  name: "Production Key",
                  time: "5 hours ago",
                },
                {
                  action: "Batch sent",
                  name: "342 emails delivered",
                  time: "1 day ago",
                },
                {
                  action: "Template updated",
                  name: "Password Reset",
                  time: "2 days ago",
                },
              ].map((activity, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between border-b pb-3 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.name}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
