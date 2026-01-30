import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Pill
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
  id: string;
  type: "medication" | "appointment" | "survey" | "follow-up";
  title: string;
  message: string;
  scheduledTime: string;
  frequency: string;
  channel: "call" | "sms" | "email" | "all";
  status: "active" | "paused" | "completed";
  lastSent?: string;
  nextDue?: string;
}

interface CallLog {
  id: string;
  type: "outbound" | "inbound";
  status: "completed" | "no-answer" | "scheduled" | "in-progress";
  duration?: string;
  timestamp: string;
  notes?: string;
  reminderType?: string;
}

interface PatientRemindersProps {
  patientId: string;
}

const mockReminders: Reminder[] = [
  {
    id: "REM-001",
    type: "medication",
    title: "Medication Reminder",
    message: "Time to take your morning medication. Please confirm once completed.",
    scheduledTime: "08:00 AM",
    frequency: "Daily",
    channel: "call",
    status: "active",
    lastSent: "2024-01-18 08:00 AM",
    nextDue: "2024-01-19 08:00 AM"
  },
  {
    id: "REM-002",
    type: "survey",
    title: "Weekly Symptom Survey",
    message: "Please complete your weekly symptom assessment survey.",
    scheduledTime: "10:00 AM",
    frequency: "Weekly",
    channel: "sms",
    status: "active",
    lastSent: "2024-01-15 10:00 AM",
    nextDue: "2024-01-22 10:00 AM"
  },
  {
    id: "REM-003",
    type: "appointment",
    title: "Upcoming Visit Reminder",
    message: "Reminder: You have a scheduled visit at the clinic tomorrow.",
    scheduledTime: "5:00 PM",
    frequency: "One-time",
    channel: "all",
    status: "active",
    nextDue: "2024-01-20 5:00 PM"
  },
  {
    id: "REM-004",
    type: "follow-up",
    title: "Post-Visit Follow-up",
    message: "How are you feeling after your last visit? Any concerns to report?",
    scheduledTime: "2:00 PM",
    frequency: "After visits",
    channel: "call",
    status: "paused",
    lastSent: "2024-01-10 2:00 PM"
  }
];

const mockCallLogs: CallLog[] = [
  {
    id: "CALL-001",
    type: "outbound",
    status: "completed",
    duration: "2:34",
    timestamp: "2024-01-18 08:02 AM",
    notes: "Patient confirmed medication taken. No adverse effects reported.",
    reminderType: "Medication Reminder"
  },
  {
    id: "CALL-002",
    type: "outbound",
    status: "no-answer",
    timestamp: "2024-01-17 08:00 AM",
    reminderType: "Medication Reminder"
  },
  {
    id: "CALL-003",
    type: "inbound",
    status: "completed",
    duration: "5:12",
    timestamp: "2024-01-16 11:30 AM",
    notes: "Patient called to report mild headache. Logged as adverse event."
  },
  {
    id: "CALL-004",
    type: "outbound",
    status: "scheduled",
    timestamp: "2024-01-19 08:00 AM",
    reminderType: "Medication Reminder"
  }
];

export const PatientReminders = ({ patientId }: PatientRemindersProps) => {
  const { toast } = useToast();
  const [reminders, setReminders] = useState<Reminder[]>(mockReminders);
  const [callLogs] = useState<CallLog[]>(mockCallLogs);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isCallDialogOpen, setIsCallDialogOpen] = useState(false);
  const [newReminder, setNewReminder] = useState({
    type: "medication" as Reminder["type"],
    title: "",
    message: "",
    scheduledTime: "",
    frequency: "Daily",
    channel: "call" as Reminder["channel"]
  });

  const toggleReminderStatus = (id: string) => {
    setReminders(prev => prev.map(r => {
      if (r.id === id) {
        const newStatus = r.status === "active" ? "paused" : "active";
        toast({
          title: newStatus === "active" ? "Reminder Activated" : "Reminder Paused",
          description: `${r.title} has been ${newStatus === "active" ? "activated" : "paused"}.`
        });
        return { ...r, status: newStatus };
      }
      return r;
    }));
  };

  const initiateCall = () => {
    setIsCallDialogOpen(false);
    toast({
      title: "Call Initiated",
      description: "Automated call is being placed to the patient.",
    });
  };

  const addReminder = () => {
    if (!newReminder.title || !newReminder.message || !newReminder.scheduledTime) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const reminder: Reminder = {
      id: `REM-${Date.now()}`,
      ...newReminder,
      status: "active",
      nextDue: new Date().toISOString()
    };

    setReminders(prev => [...prev, reminder]);
    setIsAddDialogOpen(false);
    setNewReminder({
      type: "medication",
      title: "",
      message: "",
      scheduledTime: "",
      frequency: "Daily",
      channel: "call"
    });

    toast({
      title: "Reminder Created",
      description: "New reminder has been scheduled successfully."
    });
  };

  const getReminderIcon = (type: Reminder["type"]) => {
    switch (type) {
      case "medication": return Pill;
      case "appointment": return Calendar;
      case "survey": return MessageSquare;
      case "follow-up": return Phone;
      default: return Bell;
    }
  };

  const getChannelIcon = (channel: Reminder["channel"]) => {
    switch (channel) {
      case "call": return Phone;
      case "sms": return MessageSquare;
      case "email": return Mail;
      case "all": return Bell;
    }
  };

  const getStatusBadge = (status: Reminder["status"]) => {
    switch (status) {
      case "active":
        return <Badge className="bg-success/10 text-success border-success/20">Active</Badge>;
      case "paused":
        return <Badge className="bg-warning/10 text-warning border-warning/20">Paused</Badge>;
      case "completed":
        return <Badge className="bg-muted text-muted-foreground">Completed</Badge>;
    }
  };

  const getCallStatusBadge = (status: CallLog["status"]) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-success/10 text-success border-success/20 gap-1"><CheckCircle2 className="h-3 w-3" />Completed</Badge>;
      case "no-answer":
        return <Badge className="bg-warning/10 text-warning border-warning/20 gap-1"><AlertCircle className="h-3 w-3" />No Answer</Badge>;
      case "scheduled":
        return <Badge className="bg-primary/10 text-primary border-primary/20 gap-1"><Clock className="h-3 w-3" />Scheduled</Badge>;
      case "in-progress":
        return <Badge className="bg-accent/10 text-accent border-accent/20 gap-1"><PhoneCall className="h-3 w-3" />In Progress</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Reminders & Automated Calls
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Manage patient reminders and automated calling schedule
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
                  <Label>Reminder Type</Label>
                  <Select 
                    value={newReminder.type} 
                    onValueChange={(v) => setNewReminder(prev => ({ ...prev, type: v as Reminder["type"] }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="medication">Medication</SelectItem>
                      <SelectItem value="appointment">Appointment</SelectItem>
                      <SelectItem value="survey">Survey</SelectItem>
                      <SelectItem value="follow-up">Follow-up</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input 
                    value={newReminder.title}
                    onChange={(e) => setNewReminder(prev => ({ ...prev, title: e.target.value }))}
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
                        <SelectItem value="Once">One-time</SelectItem>
                        <SelectItem value="Daily">Daily</SelectItem>
                        <SelectItem value="Weekly">Weekly</SelectItem>
                        <SelectItem value="Monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Delivery Channel</Label>
                  <Select 
                    value={newReminder.channel}
                    onValueChange={(v) => setNewReminder(prev => ({ ...prev, channel: v as Reminder["channel"] }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="call">Voice Call</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="all">All Channels</SelectItem>
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
              const ReminderIcon = getReminderIcon(reminder.type);
              const ChannelIcon = getChannelIcon(reminder.channel);
              
              return (
                <div
                  key={reminder.id}
                  className={cn(
                    "p-4 rounded-lg border transition-colors",
                    reminder.status === "paused" ? "bg-muted/30 border-muted" : "bg-card border-border hover:border-primary/30"
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "p-2 rounded-lg",
                        reminder.status === "paused" ? "bg-muted" : "bg-primary/10"
                      )}>
                        <ReminderIcon className={cn(
                          "h-4 w-4",
                          reminder.status === "paused" ? "text-muted-foreground" : "text-primary"
                        )} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{reminder.title}</span>
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
                            {reminder.channel === "all" ? "All channels" : reminder.channel.toUpperCase()}
                          </span>
                        </div>
                        {reminder.nextDue && (
                          <p className="text-xs text-primary mt-1">
                            Next: {reminder.nextDue}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={reminder.status === "active"}
                        onCheckedChange={() => toggleReminderStatus(reminder.id)}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => toggleReminderStatus(reminder.id)}
                      >
                        {reminder.status === "active" ? (
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
                key={call.id}
                className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2 rounded-full",
                    call.type === "outbound" ? "bg-primary/10" : "bg-accent/10"
                  )}>
                    {call.type === "outbound" ? (
                      <PhoneCall className="h-4 w-4 text-primary" />
                    ) : (
                      <Phone className="h-4 w-4 text-accent" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium capitalize">{call.type} Call</span>
                      {getCallStatusBadge(call.status)}
                    </div>
                    {call.reminderType && (
                      <p className="text-xs text-muted-foreground">{call.reminderType}</p>
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
                    <p className="text-xs text-muted-foreground">Duration: {call.duration}</p>
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
