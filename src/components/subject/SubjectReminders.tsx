import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { API_BASE_URL } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Bell,
  Phone,
  MessageSquare,
  Mail,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Play,
  Pause,
  PhoneCall,
  Calendar,
  Pill,
  Loader2
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Reminder {
  _id: string;
  name: string;
  message: string;
  scheduledTime: string;
  frequency: string;
  channel: "CALL" | "SMS" | "All channels";
  status: "Active" | "Paused";
  nextTrigger?: string;
}

interface CallLog {
  _id: string;
  direction: "Outbound" | "Inbound";
  outcome: "Completed" | "No Answer" | "Scheduled" | "In-progress";
  duration?: string;
  timestamp: string;
  notes?: string;
  reminderName?: string;
}

interface PatientRemindersProps {
  patientId: string;
}



export const PatientReminders = ({ patientId }: PatientRemindersProps) => {
  const { toast } = useToast();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isCallDialogOpen, setIsCallDialogOpen] = useState(false);
  const [newReminder, setNewReminder] = useState({
    name: "",
    message: "",
    scheduledTime: "",
    frequency: "Daily",
    channel: "CALL" as "CALL" | "SMS" | "All channels"
  });

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE_URL}/api/communications/reminders?patientId=${patientId}`).then(r => r.json()),
      fetch(`${API_BASE_URL}/api/communications/calls?patientId=${patientId}`).then(r => r.json())
    ])
      .then(([remindersData, callLogsData]) => {
        setReminders(remindersData || []);
        setCallLogs(callLogsData || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [patientId]);

  const toggleReminderStatus = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "Active" ? "Paused" : "Active";
    fetch(`${API_BASE_URL}/api/communications/reminders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    })
      .then(res => res.json())
      .then(updated => {
        setReminders(prev => prev.map(r => r._id === id ? updated : r));
        toast({
          title: newStatus === "Active" ? "Reminder Activated" : "Reminder Paused",
          description: `${updated.name} has been ${newStatus === "Active" ? "activated" : "paused"}.`
        });
      })
      .catch(console.error);
  };

  const initiateCall = () => {
    fetch(`${API_BASE_URL}/api/communications/calls/now`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientId, reminderName: 'Manual Check-in' })
    })
      .then(res => res.json())
      .then(data => {
        setCallLogs(prev => [data.call, ...prev]);
        setIsCallDialogOpen(false);
        toast({
          title: "Call Initiated",
          description: "Automated call is being placed to the patient.",
        });
      })
      .catch(console.error);
  };

  const addReminder = () => {
    if (!newReminder.name || !newReminder.message || !newReminder.scheduledTime) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const reminderPayload = {
      ...newReminder,
      patientId,
      status: "Active",
      nextTrigger: new Date().toLocaleDateString() + ' ' + newReminder.scheduledTime
    };

    fetch(`${API_BASE_URL}/api/communications/reminders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reminderPayload)
    })
      .then(res => res.json())
      .then(created => {
        setReminders(prev => [...prev, created]);
        setIsAddDialogOpen(false);
        setNewReminder({
          name: "",
          message: "",
          scheduledTime: "",
          frequency: "Daily",
          channel: "CALL"
        });

        toast({
          title: "Reminder Created",
          description: "New reminder has been scheduled successfully."
        });
      })
      .catch(console.error);
  };

  const getReminderIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes("medication")) return Pill;
    if (lowerName.includes("visit") || lowerName.includes("appointment")) return Calendar;
    if (lowerName.includes("survey")) return MessageSquare;
    if (lowerName.includes("follow-up") || lowerName.includes("call")) return Phone;
    return Bell;
  };

  const getChannelIcon = (channel: Reminder["channel"]) => {
    switch (channel) {
      case "CALL": return Phone;
      case "SMS": return MessageSquare;
      case "All channels": return Bell;
      default: return Bell;
    }
  };

  const getStatusBadge = (status: Reminder["status"]) => {
    switch (status) {
      case "Active":
        return <Badge className="bg-success/10 text-success border-success/20">Active</Badge>;
      case "Paused":
        return <Badge className="bg-warning/10 text-warning border-warning/20">Paused</Badge>;
      default:
        return <Badge className="bg-muted text-muted-foreground">{status}</Badge>;
    }
  };

  const getCallStatusBadge = (status: CallLog["outcome"]) => {
    switch (status) {
      case "Completed":
        return <Badge className="bg-success/10 text-success border-success/20 gap-1"><CheckCircle2 className="h-3 w-3" />Completed</Badge>;
      case "No Answer":
        return <Badge className="bg-warning/10 text-warning border-warning/20 gap-1"><AlertCircle className="h-3 w-3" />No Answer</Badge>;
      case "Scheduled":
        return <Badge className="bg-primary/10 text-primary border-primary/20 gap-1"><Clock className="h-3 w-3" />Scheduled</Badge>;
      case "In-progress":
        return <Badge className="bg-accent/10 text-accent border-accent/20 gap-1"><PhoneCall className="h-3 w-3" />In Progress</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Reminders & Automated Calls
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Manage subject reminders and automated calling schedule
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isCallDialogOpen} onOpenChange={setIsCallDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <PhoneCall className="h-4 w-4" />
                Call Now
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Initiate Automated Call</DialogTitle>
                <DialogDescription>
                  Start an automated voice call to the patient for check-in or reminder.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Call Type</Label>
                  <Select defaultValue="check-in">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="check-in">Symptom Check-in</SelectItem>
                      <SelectItem value="medication">Medication Reminder</SelectItem>
                      <SelectItem value="appointment">Appointment Reminder</SelectItem>
                      <SelectItem value="follow-up">Follow-up Call</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Custom Message (Optional)</Label>
                  <Textarea
                    placeholder="Enter a custom message for the call..."
                    className="min-h-[80px]"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCallDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={initiateCall} className="gap-2">
                  <PhoneCall className="h-4 w-4" />
                  Start Call
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="gradient" size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Reminder
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Reminder</DialogTitle>
                <DialogDescription>
                  Set up an automated reminder for the patient.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Reminder Name</Label>
                  <Input
                    value={newReminder.name}
                    onChange={(e) => setNewReminder(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Morning Medication Reminder"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Message</Label>
                  <Textarea
                    value={newReminder.message}
                    onChange={(e) => setNewReminder(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Message to be delivered to the patient..."
                    className="min-h-[80px]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Time</Label>
                    <Input
                      type="time"
                      value={newReminder.scheduledTime}
                      onChange={(e) => setNewReminder(prev => ({ ...prev, scheduledTime: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Frequency</Label>
                    <Select
                      value={newReminder.frequency}
                      onValueChange={(v) => setNewReminder(prev => ({ ...prev, frequency: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="One-time">One-time</SelectItem>
                        <SelectItem value="Daily">Daily</SelectItem>
                        <SelectItem value="Weekly">Weekly</SelectItem>
                        <SelectItem value="After visits">After visits</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Delivery Channel</Label>
                  <Select
                    value={newReminder.channel}
                    onValueChange={(v) => setNewReminder(prev => ({ ...prev, channel: v as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CALL">Voice Call</SelectItem>
                      <SelectItem value="SMS">SMS</SelectItem>
                      <SelectItem value="All channels">All Channels</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={addReminder}>Create Reminder</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Active Reminders */}
        <div>
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Scheduled Reminders
          </h4>
          <div className="space-y-3">
            {reminders.map((reminder) => {
              const ReminderIcon = getReminderIcon(reminder.name);
              const ChannelIcon = getChannelIcon(reminder.channel);

              return (
                <div
                  key={reminder._id}
                  className={cn(
                    "p-4 rounded-lg border transition-colors",
                    reminder.status === "Paused" ? "bg-muted/30 border-muted" : "bg-card border-border hover:border-primary/30"
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "p-2 rounded-lg",
                        reminder.status === "Paused" ? "bg-muted" : "bg-primary/10"
                      )}>
                        <ReminderIcon className={cn(
                          "h-4 w-4",
                          reminder.status === "Paused" ? "text-muted-foreground" : "text-primary"
                        )} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{reminder.name}</span>
                          {getStatusBadge(reminder.status)}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {reminder.message}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {reminder.scheduledTime} • {reminder.frequency}
                          </span>
                          <span className="flex items-center gap-1">
                            <ChannelIcon className="h-3 w-3" />
                            {reminder.channel}
                          </span>
                        </div>
                        {reminder.nextTrigger && (
                          <p className="text-xs text-primary mt-1">
                            Next: {reminder.nextTrigger}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={reminder.status === "Active"}
                        onCheckedChange={() => toggleReminderStatus(reminder._id, reminder.status)}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => toggleReminderStatus(reminder._id, reminder.status)}
                      >
                        {reminder.status === "Active" ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Call History */}
        <div>
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Recent Call History
          </h4>
          <div className="space-y-2">
            {callLogs.map((call) => (
              <div
                key={call._id}
                className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2 rounded-full",
                    call.direction === "Outbound" ? "bg-primary/10" : "bg-accent/10"
                  )}>
                    {call.direction === "Outbound" ? (
                      <PhoneCall className="h-4 w-4 text-primary" />
                    ) : (
                      <Phone className="h-4 w-4 text-accent" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium capitalize">{call.direction} Call</span>
                      {getCallStatusBadge(call.outcome)}
                    </div>
                    {call.reminderName && (
                      <p className="text-xs text-muted-foreground">{call.reminderName}</p>
                    )}
                    {call.notes && (
                      <p className="text-xs text-muted-foreground mt-1 max-w-md truncate">
                        {call.notes}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm">{call.timestamp}</p>
                  {call.duration && (
                    <p className="text-sm text-muted-foreground">Duration: {call.duration}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
