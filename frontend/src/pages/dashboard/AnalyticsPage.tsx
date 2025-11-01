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
  id: string;
  recipient: string;
  type: "email" | "sms" | "in-app";
  status: "delivered" | "failed" | "pending";
  timestamp: string;
}

const mockLogs: Log[] = [
  {
    id: "1",
    recipient: "user@example.com",
    type: "email",
    status: "delivered",
    timestamp: "2024-01-20 14:30:22",
  },
  {
    id: "2",
    recipient: "+1234567890",
    type: "sms",
    status: "delivered",
    timestamp: "2024-01-20 14:28:15",
  },
  {
    id: "3",
    recipient: "john.doe@company.com",
    type: "email",
    status: "failed",
    timestamp: "2024-01-20 14:25:08",
  },
  {
    id: "4",
    recipient: "user123",
    type: "in-app",
    status: "delivered",
    timestamp: "2024-01-20 14:20:45",
  },
  {
    id: "5",
    recipient: "alice@startup.io",
    type: "email",
    status: "pending",
    timestamp: "2024-01-20 14:15:33",
  },
];

export default function AnalyticsPage() {
  const getStatusBadge = (status: Log["status"]) => {
    const variants = {
      delivered: "default",
      failed: "destructive",
      pending: "secondary",
    } as const;
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const getTypeBadge = (type: Log["type"]) => {
    return <Badge variant="outline">{type}</Badge>;
  };

  return (
    <div className="flex-1 overflow-auto">
      <Navbar title="Analytics" />

      <main className="p-6 space-y-6">
        {/* Notification Type Distribution */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Notifications by Type</CardTitle>
            </CardHeader>
            <CardContent>
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
                        // style={{
                        //   backgroundColor:
                        //     pieChartConfig[
                        //       item.type as keyof typeof pieChartConfig
                        //     ].,
                        // }}
                      />
                      <span className="text-sm">{item.type}</span>
                    </div>
                    <span className="text-sm font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Weekly Activity</CardTitle>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        </div>

        {/* Daily Activity Chart */}
        <Card>
          <CardHeader>
            <CardTitle>24-Hour Activity Pattern</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        {/* Activity Logs */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <TabsList className="mb-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="email">Email</TabsTrigger>
                <TabsTrigger value="sms">SMS</TabsTrigger>
                <TabsTrigger value="in-app">In-App</TabsTrigger>
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
                    {mockLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-sm">
                          {log.recipient}
                        </TableCell>
                        <TableCell>{getTypeBadge(log.type)}</TableCell>
                        <TableCell>{getStatusBadge(log.status)}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {log.timestamp}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>

              {(["email", "sms", "in-app"] as const).map((filterType) => (
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
                      {mockLogs
                        .filter((log) => log.type === filterType)
                        .map((log) => (
                          <TableRow key={log.id}>
                            <TableCell className="font-mono text-sm">
                              {log.recipient}
                            </TableCell>
                            <TableCell>{getTypeBadge(log.type)}</TableCell>
                            <TableCell>{getStatusBadge(log.status)}</TableCell>
                            <TableCell className="text-muted-foreground">
                              {log.timestamp}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
