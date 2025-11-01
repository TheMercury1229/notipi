import { useEffect, useState } from "react";
import { Navbar } from "@/components/dashboard/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ChartConfig } from "@/components/ui/chart";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
} from "recharts";
import { Loader2, TrendingUp, TrendingDown, Activity, Mail, MessageSquare, Zap } from "lucide-react";
import { analyticsService } from "@/lib/api.service";
import { toast } from "sonner";

// Type definitions
interface AnalyticsStats {
  overview?: {
    total: number;
    successRate: number;
  };
  byType?: {
    email?: number;
    sms?: number;
    push_notification?: number;
  };
  weeklyActivity?: Array<{
    _id: {
      date: string;
      type: string;
    };
    count: number;
  }>;
  hourlyActivity?: Array<{
    _id: number;
    count: number;
  }>;
  usage?: Array<{
    type: string;
    usedLimit: number;
    allowedLimit: number;
  }>;
}

interface ActivityLog {
  _id: string;
  eventType: string;
  status: string;
  createdAt: string;
  metadata?: {
    to?: string;
    recipient?: string;
  };
  apiKey?: {
    name: string;
  };
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  trend?: 'up' | 'down';
  trendValue?: string;
  color: string;
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [statsResponse, logsResponse] = await Promise.all([
        analyticsService.getStats(),
        analyticsService.getLogs({ limit: 20 }),
      ]);

      if (statsResponse?.success) {
        setStats(statsResponse.data);
        setLoading(false);
      }

      if (logsResponse?.success) {
        setLogs(logsResponse.data);
        setLogsLoading(false);
      }
    } catch (error: unknown) {
      console.error("Analytics fetch error:", error);
      if (error && typeof error === 'object' && 'response' in error) {
        const err = error as { response?: { status?: number } };
        if (err.response?.status !== 404) {
          toast.error("Failed to fetch analytics data");
        }
      }
      setLoading(false);
      setLogsLoading(false);
    }
  };

  const getTypeDistribution = () => {
    if (!stats?.byType) return [];
    return Object.entries(stats.byType).map(([type, count]) => ({
      name: type,
      value: count,
      fill: type === "email" ? "#9c87f5" : type === "sms" ? "#d97757" : "#2f2b48",
    }));
  };

  const getWeeklyData = () => {
    if (!stats?.weeklyActivity) return [];
    
    const dayMap: Record<string, { day: string; email: number; sms: number; push_notification: number }> = {};
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    
    days.forEach(day => {
      dayMap[day] = { day, email: 0, sms: 0, push_notification: 0 };
    });

    stats.weeklyActivity.forEach(item => {
      const date = new Date(item._id.date);
      const dayName = days[date.getDay() === 0 ? 6 : date.getDay() - 1];
      if (dayMap[dayName]) {
        const type = item._id.type as 'email' | 'sms' | 'push_notification';
        dayMap[dayName][type] = item.count;
      }
    });

    return Object.values(dayMap);
  };

  const getHourlyData = () => {
    if (!stats?.hourlyActivity) return [];
    
    const hourlyMap = Array.from({ length: 24 }, (_, i) => ({
      hour: `${i.toString().padStart(2, '0')}:00`,
      count: 0,
    }));

    stats.hourlyActivity.forEach(item => {
      hourlyMap[item._id].count = item.count;
    });

    return hourlyMap.filter((_, i) => i % 4 === 0);
  };

  const pieChartConfig = {
    email: { label: "Email", color: "#9c87f5" },
    sms: { label: "SMS", color: "#d97757" },
    push_notification: { label: "Push", color: "#2f2b48" },
  } satisfies ChartConfig;

  const barChartConfig = {
    email: { label: "Email", color: "hsl(var(--chart-1))" },
    sms: { label: "SMS", color: "hsl(var(--chart-2))" },
    push_notification: { label: "Push", color: "hsl(var(--chart-3))" },
  } satisfies ChartConfig;

  const lineChartConfig = {
    count: { label: "Messages", color: "hsl(var(--chart-1))" },
  } satisfies ChartConfig;

  const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, trend, trendValue, color }) => (
    <Card className="relative overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-5`} />
      <CardContent className="pt-6 relative">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-3xl font-bold mt-2">{value}</h3>
            {trend && (
              <div className={`flex items-center gap-1 mt-2 text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span>{trendValue}</span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-lg bg-gradient-to-br ${color}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const totalSent = stats?.overview?.total || 0;
  const successRate = stats?.overview?.successRate || 0;
  const emailCount = stats?.byType?.email || 0;
  const smsCount = stats?.byType?.sms || 0;

  return (
    <div className="flex-1 overflow-auto">
      <Navbar title="Analytics Dashboard" />

      <main className="p-6 space-y-6">
        {/* Overview Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Sent"
            value={totalSent.toLocaleString()}
            icon={Activity}
            trend="up"
            trendValue="+12% from last week"
            color="from-purple-500 to-purple-600"
          />
          <StatCard
            title="Success Rate"
            value={`${successRate}%`}
            icon={Zap}
            trend={successRate > 95 ? "up" : "down"}
            trendValue={successRate > 95 ? "Excellent!" : "Needs attention"}
            color="from-green-500 to-green-600"
          />
          <StatCard
            title="Emails Sent"
            value={emailCount.toLocaleString()}
            icon={Mail}
            color="from-blue-500 to-blue-600"
          />
          <StatCard
            title="SMS Sent"
            value={smsCount.toLocaleString()}
            icon={MessageSquare}
            color="from-orange-500 to-orange-600"
          />
        </div>

        {/* Usage Progress */}
        {stats?.usage && (
          <Card>
            <CardHeader>
              <CardTitle>Usage Limits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats.usage.map((item) => {
                const percentage = (item.usedLimit / item.allowedLimit) * 100;
                const isNearLimit = percentage > 80;
                return (
                  <div key={item.type}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium capitalize">{item.type}</span>
                      <span className="text-sm text-muted-foreground">
                        {item.usedLimit} / {item.allowedLimit}
                      </span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${isNearLimit ? 'bg-red-500' : 'bg-primary'}`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Charts Row */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Distribution by Type</CardTitle>
            </CardHeader>
            <CardContent>
              {getTypeDistribution().length > 0 ? (
                <ChartContainer config={pieChartConfig} className="mx-auto aspect-square max-h-[300px]">
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                    <Pie
                      data={getTypeDistribution()}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      label={({ payload }) => `${payload.name}: ${payload.value}`}
                    >
                      {getTypeDistribution().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Weekly Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {getWeeklyData().length > 0 ? (
                <ChartContainer config={barChartConfig} className="h-[300px] w-full">
                  <BarChart data={getWeeklyData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar dataKey="email" fill="var(--color-email)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="sms" fill="var(--color-sms)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="push_notification" fill="var(--color-push_notification)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 24-Hour Activity */}
        <Card>
          <CardHeader>
            <CardTitle>24-Hour Activity Pattern</CardTitle>
          </CardHeader>
          <CardContent>
            {getHourlyData().length > 0 && getHourlyData().some(d => d.count > 0) ? (
              <ChartContainer config={lineChartConfig} className="h-[300px] w-full">
                <LineChart data={getHourlyData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="var(--color-count)"
                    strokeWidth={2}
                    dot={{ fill: "var(--color-count)" }}
                  />
                </LineChart>
              </ChartContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No hourly data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity Logs */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {logsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No activity logs yet. Start sending notifications to see logs here.
              </div>
            ) : (
              <div className="space-y-4">
                {logs.map((log) => (
                  <div key={log._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${log.eventType === 'email' ? 'bg-purple-100' : 'bg-orange-100'}`}>
                        {log.eventType === 'email' ? <Mail className="w-4 h-4 text-purple-600" /> : <MessageSquare className="w-4 h-4 text-orange-600" />}
                      </div>
                      <div>
                        <p className="font-mono text-sm">{log.metadata?.to || log.metadata?.recipient || "N/A"}</p>
                        <p className="text-xs text-muted-foreground">{log.apiKey?.name || "Unknown API Key"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant={log.status === "success" ? "default" : "destructive"}>
                        {log.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}