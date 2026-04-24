import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { API_BASE_URL } from "@/lib/api";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { PatientTable } from "@/components/dashboard/PatientTable";
import { ValidationStatus } from "@/components/dashboard/ValidationStatus";
import { EngagementWidget } from "@/components/dashboard/EngagementWidget";
import { TrialOverview } from "@/components/dashboard/TrialOverview";
import { PredictiveAnalytics } from "@/components/dashboard/PredictiveAnalytics";
import {
  Users,
  ClipboardCheck,
  AlertTriangle,
  Activity,
  TrendingUp
} from "lucide-react";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/dashboard/summary`)
      .then(res => res.json())
      .then(data => setSummary(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <>
      <Helmet>
        <title>Clinical Nexus - Patient Trial Automation Platform</title>
        <meta name="description" content="AI-powered clinical trial management platform for subject data collection, validation, and engagement. Streamline your clinical research with Clinical Nexus." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="lg:pl-64">
          <Header />

          <main className="p-4 sm:p-6 overflow-x-hidden">
            {/* Page Header */}
            <div className="mb-8 animate-fade-in">
              <h1 className="text-3xl font-bold mb-2">
                Welcome back, <span className="gradient-text">Dr. Chen</span>
              </h1>
              <p className="text-muted-foreground">
                Here's an overview of your clinical trials and subject engagement metrics.
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatsCard
                title="Total Subjects"
                value={summary?.totalPatients || "..."}
                change={summary?.patientChange}
                changeType="positive"
                icon={Users}
                iconColor="primary"
                delay={0}
              />
              <StatsCard
                title="Data Validation Rate"
                value={summary?.validationRate || "..."}
                change={summary?.validationChange}
                changeType="positive"
                icon={ClipboardCheck}
                iconColor="success"
                delay={100}
              />
              <StatsCard
                title="Active Alerts"
                value={summary?.activeAlerts || "..."}
                change={summary?.immediateAlerts}
                changeType="negative"
                icon={AlertTriangle}
                iconColor="warning"
                delay={200}
              />
              <StatsCard
                title="Engagement Score"
                value={summary?.engagementScore || "..."}
                change={summary?.engagementChange}
                changeType="positive"
                icon={Activity}
                iconColor="accent"
                delay={300}
              />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 gap-6 mb-8">
              {/* Patient Table - Takes full width now */}
              <div>
                <PatientTable />
              </div>
            </div>

            {/* Second Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Validation Status */}
              <div className="h-full">
                <ValidationStatus />
              </div>

              {/* Engagement Widget */}
              <div className="h-full">
                <EngagementWidget />
              </div>

              {/* Trial Overview */}
              <div className="h-full">
                <TrialOverview />
              </div>
            </div>

            {/* Predictive Analytics */}
            <PredictiveAnalytics />
          </main>
        </div>
      </div>
    </>
  );
};

export default Index;
