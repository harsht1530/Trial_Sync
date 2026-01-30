import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Activity, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  Filter
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Legend
} from "recharts";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface SymptomType {
  id: string;
  name: string;
  category: string;
  description: string | null;
}

interface PatientSymptom {
  id: string;
  patient_id: string;
  symptom_type_id: string;
  severity: "mild" | "moderate" | "severe";
  pain_level: number | null;
  notes: string | null;
  reported_at: string;
  symptom_types?: SymptomType;
}

interface SymptomLoggerProps {
  patientId: string;
}

const mockSymptomTypes: SymptomType[] = [
    { id: "1", name: "Headache", category: "General", description: "Pain in the head" },
    { id: "2", name: "Nausea", category: "Gastrointestinal", description: "Feeling of sickness with an inclination to vomit" },
    { id: "3", name: "Fatigue", category: "General", description: "Extreme tiredness" },
    { id: "4", name: "Dizziness", category: "Neurological", description: "A sensation of spinning around and losing one's balance" },
    { id: "5", name: "Cough", category: "Respiratory", description: "A sudden, sharp sound as you force air from your lungs" },
];

const mockPatientSymptoms: PatientSymptom[] = [
    { id: "1", patient_id: "P001", symptom_type_id: "1", severity: "mild", pain_level: 3, notes: "A dull ache", reported_at: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(), symptom_types: mockSymptomTypes[0] },
    { id: "2", patient_id: "P001", symptom_type_id: "2", severity: "moderate", pain_level: 6, notes: "Feeling very sick", reported_at: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(), symptom_types: mockSymptomTypes[1] },
    { id: "3", patient_id: "P001", symptom_type_id: "3", severity: "severe", pain_level: 8, notes: "Completely exhausted", reported_at: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(), symptom_types: mockSymptomTypes[2] },
    { id: "4", patient_id: "P001", symptom_type_id: "1", severity: "mild", pain_level: 2, notes: "A slight headache", reported_at: new Date(new Date().setDate(new Date().getDate() - 4)).toISOString(), symptom_types: mockSymptomTypes[0] },
    { id: "5", patient_id: "P001", symptom_type_id: "4", severity: "moderate", pain_level: 5, notes: "Room is spinning", reported_at: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(), symptom_types: mockSymptomTypes[3] },
];

export const SymptomLogger = ({ patientId }: SymptomLoggerProps) => {
  const { toast } = useToast();
  const [symptomTypes, setSymptomTypes] = useState<SymptomType[]>(mockSymptomTypes);
  const [patientSymptoms, setPatientSymptoms] = useState<PatientSymptom[]>(mockPatientSymptoms);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<string>("7d");

  // New symptom form state
  const [newSymptom, setNewSymptom] = useState({
    symptom_type_id: "",
    severity: "mild" as "mild" | "moderate" | "severe",
    pain_level: 5,
    notes: ""
  });

  const logSymptom = async () => {
    if (!newSymptom.symptom_type_id) {
      toast({
        title: "Missing Information",
        description: "Please select a symptom type",
        variant: "destructive"
      });
      return;
    }

    const newSymptomData: PatientSymptom = {
        id: (patientSymptoms.length + 1).toString(),
        patient_id: patientId,
        reported_at: new Date().toISOString(),
        symptom_types: symptomTypes.find(st => st.id === newSymptom.symptom_type_id),
        ...newSymptom
    }

    setPatientSymptoms(prev => [newSymptomData, ...prev]);

    toast({
      title: "Symptom Logged",
      description: "Your symptom has been recorded successfully."
    });

    setIsDialogOpen(false);
    setNewSymptom({
      symptom_type_id: "",
      severity: "mild",
      pain_level: 5,
      notes: ""
    });
  };

  // Get unique categories from symptom types
  const categories = [...new Set(symptomTypes.map(s => s.category))];

  // Filter symptoms by category
  const filteredSymptoms = selectedCategory === "all" 
    ? patientSymptoms 
    : patientSymptoms.filter(s => s.symptom_types?.category === selectedCategory);

  // Get symptoms within time range
  const getTimeRangeDate = () => {
    const now = new Date();
    switch (timeRange) {
      case "24h": return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case "7d": return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case "30d": return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case "90d": return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      default: return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
  };

  const timeRangeSymptoms = filteredSymptoms.filter(
    s => new Date(s.reported_at) >= getTimeRangeDate()
  );

  // Prepare chart data - aggregate by day
  const prepareChartData = () => {
    const rangeDate = getTimeRangeDate();
    const now = new Date();
    const days: { [key: string]: { date: string; count: number; avgPain: number; pains: number[] } } = {};

    // Initialize all days in range
    let current = new Date(rangeDate);
    while (current <= now) {
      const key = current.toISOString().split('T')[0];
      days[key] = { date: key, count: 0, avgPain: 0, pains: [] };
      current.setDate(current.getDate() + 1);
    }

    // Aggregate symptoms
    timeRangeSymptoms.forEach(symptom => {
      const key = symptom.reported_at.split('T')[0];
      if (days[key]) {
        days[key].count++;
        if (symptom.pain_level) {
          days[key].pains.push(symptom.pain_level);
        }
      }
    });

    // Calculate averages
    Object.values(days).forEach(day => {
      if (day.pains.length > 0) {
        day.avgPain = Math.round(day.pains.reduce((a, b) => a + b, 0) / day.pains.length * 10) / 10;
      }
    });

    return Object.values(days).map(d => ({
      date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      count: d.count,
      avgPain: d.avgPain
    }));
  };

  // Prepare severity distribution data
  const prepareSeverityData = () => {
    const counts = { mild: 0, moderate: 0, severe: 0 };
    timeRangeSymptoms.forEach(s => {
      counts[s.severity]++;
    });
    return [
      { name: 'Mild', value: counts.mild, fill: 'hsl(var(--success))' },
      { name: 'Moderate', value: counts.moderate, fill: 'hsl(var(--warning))' },
      { name: 'Severe', value: counts.severe, fill: 'hsl(var(--destructive))' }
    ];
  };

  // Calculate trend
  const calculateTrend = () => {
    const halfPoint = Math.floor(timeRangeSymptoms.length / 2);
    if (halfPoint === 0) return 'stable';
    
    const recentSymptoms = timeRangeSymptoms.slice(0, halfPoint);
    const olderSymptoms = timeRangeSymptoms.slice(halfPoint);
    
    const recentAvg = recentSymptoms.reduce((acc, s) => acc + (s.pain_level || 0), 0) / recentSymptoms.length;
    const olderAvg = olderSymptoms.reduce((acc, s) => acc + (s.pain_level || 0), 0) / olderSymptoms.length;
    
    if (recentAvg > olderAvg + 1) return 'increasing';
    if (recentAvg < olderAvg - 1) return 'decreasing';
    return 'stable';
  };

  const trend = calculateTrend();
  const chartData = prepareChartData();
  const severityData = prepareSeverityData();

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "mild":
        return <Badge className="bg-success/10 text-success border-success/20">Mild</Badge>;
      case "moderate":
        return <Badge className="bg-warning/10 text-warning border-warning/20">Moderate</Badge>;
      case "severe":
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Severe</Badge>;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Symptom Tracking
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Log and monitor patient-reported symptoms over time
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[120px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="gradient" size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Log Symptom
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Log New Symptom</DialogTitle>
                <DialogDescription>
                  Record a symptom experienced by the patient.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Symptom Type</Label>
                  <Select 
                    value={newSymptom.symptom_type_id}
                    onValueChange={(v) => setNewSymptom(prev => ({ ...prev, symptom_type_id: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a symptom..." />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <div key={category}>
                          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                            {category}
                          </div>
                          {symptomTypes
                            .filter(s => s.category === category)
                            .map(symptom => (
                              <SelectItem key={symptom.id} value={symptom.id}>
                                {symptom.name}
                              </SelectItem>
                            ))
                          }
                        </div>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Severity</Label>
                  <Select 
                    value={newSymptom.severity}
                    onValueChange={(v) => setNewSymptom(prev => ({ ...prev, severity: v as "mild" | "moderate" | "severe" }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mild">Mild</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="severe">Severe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Pain Level: {newSymptom.pain_level}/10</Label>
                  <Slider
                    value={[newSymptom.pain_level]}
                    onValueChange={(v) => setNewSymptom(prev => ({ ...prev, pain_level: v[0] }))}
                    min={1}
                    max={10}
                    step={1}
                    className="py-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>No pain</span>
                    <span>Extreme pain</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Notes (Optional)</Label>
                  <Textarea
                    value={newSymptom.notes}
                    onChange={(e) => setNewSymptom(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional details about the symptom..."
                    className="min-h-[80px]"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={logSymptom}>Log Symptom</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-secondary/30">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Activity className="h-4 w-4" />
              <span className="text-xs font-medium">Total Symptoms</span>
            </div>
            <p className="text-2xl font-bold">{timeRangeSymptoms.length}</p>
          </div>
          <div className="p-4 rounded-lg bg-secondary/30">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <AlertCircle className="h-4 w-4" />
              <span className="text-xs font-medium">Severe</span>
            </div>
            <p className="text-2xl font-bold text-destructive">
              {timeRangeSymptoms.filter(s => s.severity === 'severe').length}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-secondary/30">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              {trend === 'increasing' && <TrendingUp className="h-4 w-4 text-destructive" />}
              {trend === 'decreasing' && <TrendingDown className="h-4 w-4 text-success" />}
              {trend === 'stable' && <Minus className="h-4 w-4" />}
              <span className="text-xs font-medium">Trend</span>
            </div>
            <p className={cn(
              "text-lg font-bold capitalize",
              trend === 'increasing' && "text-destructive",
              trend === 'decreasing' && "text-success"
            )}>
              {trend}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-secondary/30">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Clock className="h-4 w-4" />
              <span className="text-xs font-medium">Avg Pain</span>
            </div>
            <p className="text-2xl font-bold">
              {timeRangeSymptoms.length > 0 
                ? (timeRangeSymptoms.reduce((acc, s) => acc + (s.pain_level || 0), 0) / timeRangeSymptoms.length).toFixed(1)
                : '—'}
            </p>
          </div>
        </div>

        <Tabs defaultValue="trends" className="space-y-4">
          <TabsList>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="distribution">Distribution</TabsTrigger>
          </TabsList>

          <TabsContent value="trends" className="space-y-4">
            {/* Symptom Count Over Time */}
            <div className="p-4 rounded-lg border">
              <h4 className="text-sm font-semibold mb-4">Symptom Frequency</h4>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="count" 
                      stroke="hsl(var(--primary))" 
                      fillOpacity={1} 
                      fill="url(#colorCount)" 
                      name="Symptoms"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Average Pain Level Over Time */}
            <div className="p-4 rounded-lg border">
              <h4 className="text-sm font-semibold mb-4">Average Pain Level</h4>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis domain={[0, 10]} className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="avgPain" 
                      stroke="hsl(var(--destructive))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--destructive))' }}
                      name="Avg Pain"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Symptom History List */}
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : timeRangeSymptoms.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No symptoms logged in this time range</p>
                </div>
              ) : (
                timeRangeSymptoms.map((symptom) => (
                  <div
                    key={symptom.id}
                    className="flex items-start justify-between p-4 rounded-lg border hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "p-2 rounded-lg",
                        symptom.severity === 'severe' ? "bg-destructive/10" :
                        symptom.severity === 'moderate' ? "bg-warning/10" : "bg-success/10"
                      )}>
                        <Activity className={cn(
                          "h-4 w-4",
                          symptom.severity === 'severe' ? "text-destructive" :
                          symptom.severity === 'moderate' ? "text-warning" : "text-success"
                        )} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {symptom.symptom_types?.name || 'Unknown Symptom'}
                          </span>
                          {getSeverityBadge(symptom.severity)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {symptom.symptom_types?.category}
                        </p>
                        {symptom.notes && (
                          <p className="text-sm text-muted-foreground mt-2">
                            {symptom.notes}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-sm">
                        <span className="font-medium">Pain: {symptom.pain_level}/10</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(symptom.reported_at)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="distribution" className="space-y-4">
            {/* Severity Distribution */}
            <div className="p-4 rounded-lg border">
              <h4 className="text-sm font-semibold mb-4">Severity Distribution</h4>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={severityData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis dataKey="name" type="category" tick={{ fill: 'hsl(var(--muted-foreground))' }} width={80} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="value" name="Count" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Symptoms */}
            <div className="p-4 rounded-lg border">
              <h4 className="text-sm font-semibold mb-4">Most Reported Symptoms</h4>
              <div className="space-y-3">
                {(() => {
                  const symptomCounts: { [key: string]: { name: string; count: number } } = {};
                  timeRangeSymptoms.forEach(s => {
                    const name = s.symptom_types?.name || 'Unknown';
                    if (!symptomCounts[name]) {
                      symptomCounts[name] = { name, count: 0 };
                    }
                    symptomCounts[name].count++;
                  });
                  
                  return Object.values(symptomCounts)
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 5)
                    .map((symptom, index) => (
                      <div key={symptom.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-muted-foreground w-4">
                            {index + 1}.
                          </span>
                          <span className="text-sm font-medium">{symptom.name}</span>
                        </div>
                        <Badge variant="secondary">{symptom.count} reports</Badge>
                      </div>
                    ));
                })()}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
