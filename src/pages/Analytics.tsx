import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { API_BASE_URL } from "@/lib/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const enrollmentData = [
  { month: "Jan", enrolled: 10 },
  { month: "Feb", enrolled: 25 },
  { month: "Mar", enrolled: 45 },
  { month: "Apr", enrolled: 70 },
  { month: "May", enrolled: 100 },
  { month: "Jun", enrolled: 120 },
];

const demographicsData = [
  { name: "18-30", value: 400 },
  { name: "31-45", value: 300 },
  { name: "46-60", value: 300 },
  { name: "60+", value: 200 },
];

const sitePerformanceData = [
  { site: "Site A", enrollment: 40 },
  { site: "Site B", enrollment: 60 },
  { site: "Site C", enrollment: 25 },
  { site: "Site D", enrollment: 80 },
];

// Capgemini Brand Palette
const BRAND_COLORS = {
  darkBlue: "#121A38",
  blue: "#0058AB",
  lightBlue: "#1DB8F2",
  turquoise: "#00D5D0",
  yellow: "#FEB100",
  orange: "#FF816E"
};

const COLORS = [BRAND_COLORS.blue, BRAND_COLORS.lightBlue, BRAND_COLORS.turquoise, BRAND_COLORS.yellow];

interface AnalyticsData {
  enrollmentOverTime: { month: string; count: number }[];
  demographics: { group: string; count: number; percentage: number }[];
  sitePerformance: { name: string; enrolled: number; target: number }[];
}

export function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTrial, setSelectedTrial] = useState("all");

  const fetchAnalytics = (trial: string) => {
    setLoading(true);
    const url = trial === 'all'
      ? `${API_BASE_URL}/api/analytics`
      : `${API_BASE_URL}/api/analytics?trial=${trial}`;

    fetch(url)
      .then(res => res.json())
      .then(payload => {
        setData(payload);
        setLoading(false);
      })
      .catch(err => {
        console.error('Analytics Fetch Error:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAnalytics(selectedTrial);
  }, [selectedTrial]);
  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />
      <div className="flex flex-col flex-1 lg:pl-64">
        <Header />
        <main className="flex-1 p-4 sm:p-6 bg-background">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h1 className="text-2xl font-semibold">Analytics and Reporting</h1>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mr-2">
                <Filter className="h-4 w-4" />
                <span>Filter by Trial:</span>
              </div>
              <Select value={selectedTrial} onValueChange={setSelectedTrial}>
                <SelectTrigger className="w-[240px] bg-card">
                  <SelectValue placeholder="Select Trial" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Trials</SelectItem>
                  <SelectItem value="ONCO-2024-A1">Advanced Melanoma Treatment</SelectItem>
                  <SelectItem value="CARDIO-2024-B3">Cardiac Arrhythmia Study</SelectItem>
                  <SelectItem value="NEURO-2024-C2">Parkinson's Disease Trial</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="min-h-[400px]">
              <CardHeader>
                <CardTitle>Subject Enrollment Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="h-[300px] flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : data?.enrollmentOverTime ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data.enrollmentOverTime}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                      <XAxis
                        dataKey="month"
                        tick={{ fill: BRAND_COLORS.darkBlue, fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fill: BRAND_COLORS.darkBlue, fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: '8px',
                          border: 'none',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                          fontSize: '12px'
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke={BRAND_COLORS.blue}
                        strokeWidth={3}
                        dot={{ fill: BRAND_COLORS.blue, r: 4, strokeWidth: 0 }}
                        activeDot={{ r: 6, fill: BRAND_COLORS.turquoise }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No enrollment data available.
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Subject Demographics (Age Group)</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="h-[300px] flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : data?.demographics ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={data.demographics}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill={BRAND_COLORS.blue}
                        dataKey="count"
                        nameKey="group"
                      >
                        {data.demographics.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={BRAND_COLORS.blue}
                            fillOpacity={1 - (index * 0.2)}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        formatter={(value, name, props) => [`${value} patients (${props.payload.percentage}%)`, name]}
                      />
                      <Legend
                        layout="horizontal"
                        verticalAlign="bottom"
                        align="center"
                        formatter={(value, entry: any) => (
                          <span className="text-xs text-muted-foreground">{value}</span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No demographic data available.
                  </div>
                )}
              </CardContent>
            </Card>
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Site Performance (Enrollment)</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="h-[300px] flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : data?.sitePerformance ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data.sitePerformance} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                      <XAxis
                        dataKey="name"
                        tick={{ fill: BRAND_COLORS.darkBlue, fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        domain={[0, 80]}
                        tick={{ fill: BRAND_COLORS.darkBlue, fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                      />
                      <Legend iconType="circle" />
                      <Bar
                        name="Enrolled"
                        dataKey="enrolled"
                        fill={BRAND_COLORS.blue}
                        radius={[4, 4, 0, 0]}
                        barSize={40}
                      />
                      <Bar
                        name="Target"
                        dataKey="target"
                        fill={BRAND_COLORS.lightBlue}
                        fillOpacity={0.3}
                        radius={[4, 4, 0, 0]}
                        barSize={40}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No site performance data available.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
