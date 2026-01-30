import { useState } from "react";
import { Helmet } from "react-helmet";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
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

  return (
    <>
      <Helmet>
        <title>Clinical Nexus - Patient Trial Automation Platform</title>
        <meta name="description" content="AI-powered clinical trial management platform for patient data collection, validation, and engagement. Streamline your clinical research with Clinical Nexus." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        
        <div className="pl-64">
          <Header />
          
          <main className="p-6">
            {/* Page Header */}
            <div className="mb-8 animate-fade-in">
              <h1 className="text-3xl font-bold mb-2">
                Welcome back, <span className="gradient-text">Dr. Chen</span>
              </h1>
              <p className="text-muted-foreground">
                Here's an overview of your clinical trials and patient engagement metrics.
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatsCard
                title="Total Patients"
                value="1,247"
                change="+12.5% from last month"
                changeType="positive"
                icon={Users}
                iconColor="primary"
                delay={0}
              />
              <StatsCard
                title="Data Validation Rate"
                value="94.8%"
                change="+2.3% improvement"
                changeType="positive"
                icon={ClipboardCheck}
                iconColor="success"
                delay={100}
              />
              <StatsCard
                title="Active Alerts"
                value="23"
                change="8 require immediate attention"
                changeType="negative"
                icon={AlertTriangle}
                iconColor="warning"
                delay={200}
              />
              <StatsCard
                title="Engagement Score"
                value="87.2%"
                change="+5.1% this week"
                changeType="positive"
                icon={Activity}
                iconColor="accent"
                delay={300}
              />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
              {/* Patient Table - Takes 2 columns */}
              <div className="xl:col-span-2">
                <PatientTable />
              </div>
              
              {/* Validation Status */}
              <div>
                <ValidationStatus />
              </div>
            </div>

            {/* Second Row */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
              {/* Engagement Widget */}
              <div>
                <EngagementWidget />
              </div>
              
              {/* Trial Overview - Takes 2 columns */}
              <div className="xl:col-span-2">
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
