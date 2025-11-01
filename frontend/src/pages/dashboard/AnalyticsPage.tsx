import { useEffect, useState } from "react";
import { Navbar } from "@/components/dashboard/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { analyticsService } from "@/lib/api.service";
import { toast } from "sonner";

// Mock data as fallback
const notificationTypeData = [
  { type: "Email", value: 1248, fill: "var(--color-Email)" },
  { type: "SMS", value: 342, fill: "var(--color-SMS)" },
  { type: "In-App", value: 567, fill: "var(--color-In-App)" },
];

const weeklyActivityData = [
  { day: "Mon", emails: 145, sms: 42, inApp: 67 },
  { day: "Tue", emails: 178, sms: 38, inApp: 89 },
  { day: "Wed", emails: 220, sms: 51, inApp: 102 },
  { day: "Thu", emails: 195, sms: 45, inApp: 78 },
  { day: "Fri", emails: 242, sms: 62, inApp: 121 },
  { day: "Sat", emails: 167, sms: 54, inApp: 67 },
  { day: "Sun", emails: 189, sms: 50, inApp: 43 },
];

const dailyActivityData = [
  { hour: "00:00", notifications: 12 },
  { hour: "04:00", notifications: 8 },
  { hour: "08:00", notifications: 145 },
  { hour: "12:00", notifications: 223 },
  { hour: "16:00", notifications: 189 },
  { hour: "20:00", notifications: 98 },
];

const pieChartConfig = {
  value: {
    label: "Notifications",
  },
  Email: {
    label: "Email",
    color: "#9c87f5",
  },
  SMS: {
    label: "SMS",
    color: "#d97757",
  },
  "In-App": {
    label: "In-App",
    color: "#2f2b48",
  },
} satisfies ChartConfig;

const barChartConfig = {
  emails: {
    label: "Email",
    color: "hsl(var(--chart-1))",
  },
  sms: {
    label: "SMS",
    color: "hsl(var(--chart-2))",
  },
  inApp: {
    label: "In-App",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

const lineChartConfig = {
  notifications: {
    label: "Notifications",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

interface Log {
  _id: string;
  eventType: string;
  status: string;
  metadata: any;
  createdAt: string;
}

export default function AnalyticsPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setLogsLoading(true);

      // Fetch stats and logs in parallel
      const [statsResponse, logsResponse] = await Promise.all([
        analyticsService.getStats().catch(() => null),
        analyticsService.getLogs({ limit: 10 }).catch(() => null),
      ]);

      if (statsResponse?.success) {
        setStats(statsResponse.data);
      }

      if (logsResponse?.success) {
        setLogs(logsResponse.data);
      }
    } catch (error: any) {
      // Only show error if it's not a 404 (endpoint might not exist yet)
      if (error.response?.status !== 404) {
        toast.error("Failed to fetch analytics data");
      }
    } finally {
      setLoading(false);
      setLogsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, "default" | "destructive" | "secondary"> = {
      success: "default",
      delivered: "default",
      failure: "destructive",
      failed: "destructive",
      pending: "secondary",
    };

    return (
      <Badge variant={statusMap[status.toLowerCase()] || "secondary"}>
        {status}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    return <Badge variant="outline">{type}</Badge>;
  };

  // Format log data for display
  const formatLog = (log: Log) => {
    const recipient =
      log.metadata?.recipient ||
      log.metadata?.to ||
      log.metadata?.email ||
      "N/A";

    return {
      id: log._id,
      recipient,
      type: log.eventType,
      status: log.status,
      timestamp: new Date(log.createdAt).toLocaleString(),
    };
  };

  return (
    <div className="flex-1 overflow-auto">
      <Navbar title="Analytics" />

      <main className="p-6 space-y-6">
        {/* Info Banner if analytics endpoint doesn't exist */}
        {!loading && !stats && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <p className="text-sm text-blue-900">
                <strong>Note:</strong> Analytics endpoints are not yet
                implemented in the backend. Showing mock data for
                demonstration purposes.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Notification Type Distribution */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Notifications by Type</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-[300px]">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : (
                <>
                  <ChartContainer
                    config={pieChartConfig}
                    className="mx-auto aspect-square max-h-[300px]"
                  >
                    <PieChart>
                      <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                      <Pie
                        data={notificationTypeData}
                        dataKey="value"
                        nameKey="type"
                        label={({ payload, ...props }) => {
                          return (
                            <text
                              cx={props.cx}
                              cy={props.cy}
                              x={props.x}
                              y={props.y}
                              textAnchor={props.textAnchor}
                              dominantBaseline={props.dominantBaseline}
                              fill="hsla(var(--foreground))"
                              className="text-xs"
                            >
                              {`${payload.type} ${(
                                (payload.value /
                                  notificationTypeData.reduce(
                                    (a, b) => a + b.value,
                                    0
                                  )) *
                                100
                              ).toFixed(0)}%`}
                            </text>
                          );
                        }}
                      />
                    </PieChart>
                  </ChartContainer>
                  <div className="mt-4 space-y-2">
                    {notificationTypeData.map((item) => (
                      <div
                        key={item.type}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor: item.fill.replace(
                                "var(--color-",
                                ""
                              ).replace(")", ""),
                            }}
                          />
                          <span className="text-sm">{item.type}</span>
                        </div>
                        <span className="text-sm font-medium">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Weekly Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-[300px]">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : (
                <ChartContainer
                  config={barChartConfig}
                  className="h-[300px] w-full"
                >
                  <BarChart data={weeklyActivityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar
                      dataKey="emails"
                      fill="var(--color-emails)"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="sms"
                      fill="var(--color-sms)"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="inApp"
                      fill="var(--color-inApp)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Daily Activity Chart */}
        <Card>
          <CardHeader>
            <CardTitle>24-Hour Activity Pattern</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-[300px]">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : (
              <ChartContainer
                config={lineChartConfig}
                className="h-[300px] w-full"
              >
                <LineChart data={dailyActivityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="notifications"
                    stroke="var(--color-notifications)"
                    strokeWidth={2}
                    dot={{ fill: "var(--color-notifications)" }}
                  />
                </LineChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Activity Logs */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity Logs</CardTitle>
          </CardHeader>
          <CardContent>
            {logsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No activity logs found. Start sending notifications to see logs
                here.
              </div>
            ) : (
              <Tabs defaultValue="all">
                <TabsList className="mb-4">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="email">Email</TabsTrigger>
                  <TabsTrigger value="sms">SMS</TabsTrigger>
                  <TabsTrigger value="push_notification">Push</TabsTrigger>
                </TabsList>

                <TabsContent value="all">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Recipient</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Timestamp</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {logs.map((log) => {
                        const formattedLog = formatLog(log);
                        return (
                          <TableRow key={formattedLog.id}>
                            <TableCell className="font-mono text-sm">
                              {formattedLog.recipient}
                            </TableCell>
                            <TableCell>
                              {getTypeBadge(formattedLog.type)}
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(formattedLog.status)}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {formattedLog.timestamp}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TabsContent>

                {(["email", "sms", "push_notification"] as const).map(
                  (filterType) => (
                    <TabsContent key={filterType} value={filterType}>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Recipient</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Timestamp</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {logs
                            .filter((log) => log.eventType === filterType)
                            .map((log) => {
                              const formattedLog = formatLog(log);
                              return (
                                <TableRow key={formattedLog.id}>
                                  <TableCell className="font-mono text-sm">
                                    {formattedLog.recipient}
                                  </TableCell>
                                  <TableCell>
                                    {getTypeBadge(formattedLog.type)}
                                  </TableCell>
                                  <TableCell>
                                    {getStatusBadge(formattedLog.status)}
                                  </TableCell>
                                  <TableCell className="text-muted-foreground">
                                    {formattedLog.timestamp}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                        </TableBody>
                      </Table>
                    </TabsContent>
                  )
                )}
              </Tabs>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}