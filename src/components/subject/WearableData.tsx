import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { API_BASE_URL } from "@/lib/api";
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
  Wifi,
  Loader2
} from "lucide-react";
import { useState, useEffect } from "react";

interface WearableDataProps {
  patientId: string;
}

export const WearableData = ({ patientId }: WearableDataProps) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/subjects/${patientId}/wearable-data`)
      .then(res => res.json())
      .then(resData => {
        setData(resData);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [patientId]);

  if (loading || !data || !data.wearableInfo) {
    return (
      <Card className="h-fit">
        <CardContent className="flex flex-col items-center justify-center h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const { wearableInfo, metrics, recentReadings } = data;
  const iconMap: any = { Heart, Footprints, Moon, Flame };

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
          {(metrics || []).map((metric: any, index: number) => {
            const IconComponent = iconMap[metric.iconName] || Activity;
            return (
              <div 
                key={index}
                className={`p-3 rounded-lg ${metric.bgColor || "bg-muted/30"}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <IconComponent className={`h-4 w-4 ${metric.iconColor || "text-muted-foreground"}`} />
                  <span className="text-xs text-muted-foreground">{metric.label || "N/A"}</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-semibold">{metric.value || "0"}</span>
                  <span className="text-xs text-muted-foreground">{metric.unit || ""}</span>
                </div>
                <span className={`text-xs ${metric.trendColor || "text-muted-foreground"}`}>{metric.trend || ""}</span>
              </div>
            );
          })}
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
            {(recentReadings || []).map((reading: any, index: number) => (
              <div 
                key={index}
                className="flex items-center justify-between p-2 bg-muted/30 rounded-lg text-sm"
              >
                <span className="text-muted-foreground w-14">{reading.time || "--:--"}</span>
                <span className="flex items-center gap-1">
                  <Heart className="h-3 w-3 text-destructive" />
                  {reading.heartRate || "--"}
                </span>
                <span className="flex items-center gap-1">
                  <Footprints className="h-3 w-3 text-primary" />
                  {(reading.steps || 0).toLocaleString()}
                </span>
                <Badge variant="outline" className="text-xs">
                  {reading.activity || "None"}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
