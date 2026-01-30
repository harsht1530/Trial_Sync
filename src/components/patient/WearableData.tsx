import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Watch, 
  Heart, 
  Footprints, 
  Moon, 
  Flame,
  Activity,
  Battery,
  Wifi
} from "lucide-react";

interface WearableDataProps {
  patientId: string;
}

export const WearableData = ({ patientId }: WearableDataProps) => {
  // Mock wearable data
  const wearableInfo = {
    device: "Fitbit Sense 2",
    lastSync: "2024-01-20T14:32:00",
    batteryLevel: 78,
    connectionStatus: "Connected"
  };

  const metrics = [
    {
      icon: Heart,
      label: "Heart Rate",
      value: "72",
      unit: "bpm",
      trend: "Normal",
      trendColor: "text-success",
      bgColor: "bg-destructive/10",
      iconColor: "text-destructive"
    },
    {
      icon: Footprints,
      label: "Steps Today",
      value: "8,432",
      unit: "steps",
      trend: "+12%",
      trendColor: "text-success",
      bgColor: "bg-primary/10",
      iconColor: "text-primary"
    },
    {
      icon: Moon,
      label: "Sleep",
      value: "7.2",
      unit: "hours",
      trend: "Good",
      trendColor: "text-success",
      bgColor: "bg-accent/10",
      iconColor: "text-accent"
    },
    {
      icon: Flame,
      label: "Calories",
      value: "1,847",
      unit: "kcal",
      trend: "On track",
      trendColor: "text-success",
      bgColor: "bg-warning/10",
      iconColor: "text-warning"
    }
  ];

  const recentReadings = [
    { time: "14:32", heartRate: 72, steps: 8432, activity: "Resting" },
    { time: "13:00", heartRate: 98, steps: 7856, activity: "Walking" },
    { time: "12:00", heartRate: 68, steps: 6234, activity: "Resting" },
    { time: "11:00", heartRate: 112, steps: 5890, activity: "Exercise" },
    { time: "10:00", heartRate: 74, steps: 4123, activity: "Resting" }
  ];

  return (
    <Card className="h-fit">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Watch className="h-5 w-5 text-primary" />
            Wearable Data
          </CardTitle>
          <Badge 
            variant="outline" 
            className="bg-success/10 text-success border-success/20"
          >
            <Wifi className="h-3 w-3 mr-1" />
            {wearableInfo.connectionStatus}
          </Badge>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
          <span>{wearableInfo.device}</span>
          <span className="flex items-center gap-1">
            <Battery className="h-3 w-3" />
            {wearableInfo.batteryLevel}%
          </span>
          <span>
            Last sync: {new Date(wearableInfo.lastSync).toLocaleTimeString()}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          {metrics.map((metric, index) => (
            <div 
              key={index}
              className={`p-3 rounded-lg ${metric.bgColor}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <metric.icon className={`h-4 w-4 ${metric.iconColor}`} />
                <span className="text-xs text-muted-foreground">{metric.label}</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-semibold">{metric.value}</span>
                <span className="text-xs text-muted-foreground">{metric.unit}</span>
              </div>
              <span className={`text-xs ${metric.trendColor}`}>{metric.trend}</span>
            </div>
          ))}
        </div>

        {/* Activity Goal Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Daily Step Goal</span>
            <span className="font-medium">8,432 / 10,000</span>
          </div>
          <Progress value={84} className="h-2" />
        </div>

        {/* Recent Readings */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm flex items-center gap-2">
            <Activity className="h-4 w-4 text-accent" />
            Recent Readings
          </h4>
          <div className="space-y-2">
            {recentReadings.map((reading, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-2 bg-muted/30 rounded-lg text-sm"
              >
                <span className="text-muted-foreground w-14">{reading.time}</span>
                <span className="flex items-center gap-1">
                  <Heart className="h-3 w-3 text-destructive" />
                  {reading.heartRate}
                </span>
                <span className="flex items-center gap-1">
                  <Footprints className="h-3 w-3 text-primary" />
                  {reading.steps.toLocaleString()}
                </span>
                <Badge variant="outline" className="text-xs">
                  {reading.activity}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
