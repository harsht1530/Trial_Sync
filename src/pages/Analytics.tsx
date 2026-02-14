import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
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

export function Analytics() {
  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />
      <div className="flex flex-col flex-1 pl-64">
        <Header />
        <main className="flex-1 p-6 bg-background">
          <h1 className="text-2xl font-semibold mb-6">Analytics and Reporting</h1>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Patient Enrollment Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={enrollmentData}>
                    <defs>
                      <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor={BRAND_COLORS.blue} />
                        <stop offset="100%" stopColor={BRAND_COLORS.turquoise} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                    <XAxis dataKey="month" tick={{ fill: BRAND_COLORS.darkBlue }} axisLine={{ stroke: BRAND_COLORS.darkBlue }} />
                    <YAxis tick={{ fill: BRAND_COLORS.darkBlue }} axisLine={{ stroke: BRAND_COLORS.darkBlue }} />
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      cursor={{ stroke: BRAND_COLORS.lightBlue, strokeWidth: 2 }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="enrolled"
                      stroke="url(#lineGradient)"
                      strokeWidth={3}
                      dot={{ fill: BRAND_COLORS.blue, r: 4, strokeWidth: 0 }}
                      activeDot={{ r: 6, fill: BRAND_COLORS.turquoise }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Patient Demographics (Age Group)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={demographicsData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {demographicsData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Site Performance (Enrollment)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={sitePerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                    <XAxis dataKey="site" tick={{ fill: BRAND_COLORS.darkBlue }} axisLine={false} />
                    <YAxis tick={{ fill: BRAND_COLORS.darkBlue }} axisLine={false} />
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                    />
                    <Legend />
                    <Bar dataKey="enrollment" fill={BRAND_COLORS.blue} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
