import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building2,
  Edit,
  MessageSquare,
  AlertCircle
} from "lucide-react";

interface PatientProfileProps {
  patient: {
    id: string;
    name: string;
    age: number;
    gender: string;
    email: string;
    phone: string;
    enrollmentDate: string;
    trialPhase: string;
    siteId: string;
    status: string;
    avatar: string | null;
    address: string;
    emergencyContact: {
      name: string;
      relationship: string;
      phone: string;
    };
  };
}

export const PatientProfile = ({ patient }: PatientProfileProps) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-success/10 text-success border-success/20";
      case "inactive":
        return "bg-muted text-muted-foreground border-muted";
      case "withdrawn":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-muted text-muted-foreground border-muted";
    }
  };

  const initials = (patient.name || "Subject")
    .split(" ")
    .map((n) => n[0] || "")
    .join("")
    .toUpperCase();

  return (
    <Card className="overflow-hidden">
      <div className="bg-gradient-to-r from-primary to-accent h-24" />
      <CardHeader className="relative pb-0">
        <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-12">
          <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
            <AvatarFallback className="text-2xl font-semibold bg-primary text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 pb-2">
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
              <CardTitle className="text-2xl">{patient.name}</CardTitle>
              <Badge className={getStatusColor(patient.status)}>
                {patient.status}
              </Badge>
              <Badge variant="outline" className="w-fit">
                {patient.trialPhase}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              Subject ID: {patient.id} • {patient.age} years old • {patient.gender}
            </p>
          </div>

          <div className="flex gap-2 pb-2">
            <Button variant="outline" size="sm" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Message
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Contact Information */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Contact Information
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{patient.email || "No email provided"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{patient.phone || "No phone provided"}</span>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span>{patient.address || "No address provided"}</span>
              </div>
            </div>
          </div>

          {/* Trial Information */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Trial Information
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Enrolled: {new Date(patient.enrollmentDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span>Site: {patient.siteId}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>Phase: {patient.trialPhase}</span>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Emergency Contact
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{patient.emergencyContact?.name || "Not specified"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="ml-7">{patient.emergencyContact?.relationship || "N/A"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{patient.emergencyContact?.phone || "No phone"}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
