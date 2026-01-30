import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Pill, 
  Stethoscope, 
  AlertTriangle, 
  Syringe,
  FileText
} from "lucide-react";

interface MedicalHistoryProps {
  patientId: string;
}

export const MedicalHistory = ({ patientId }: MedicalHistoryProps) => {
  // Mock medical history data
  const medicalHistory = {
    conditions: [
      { name: "Type 2 Diabetes", diagnosedDate: "2018-03-15", status: "Ongoing" },
      { name: "Hypertension", diagnosedDate: "2019-08-22", status: "Controlled" },
      { name: "Asthma", diagnosedDate: "2005-01-10", status: "Mild" }
    ],
    medications: [
      { name: "Metformin", dosage: "500mg", frequency: "Twice daily" },
      { name: "Lisinopril", dosage: "10mg", frequency: "Once daily" },
      { name: "Albuterol", dosage: "90mcg", frequency: "As needed" }
    ],
    allergies: [
      { allergen: "Penicillin", severity: "Severe", reaction: "Anaphylaxis" },
      { allergen: "Sulfa drugs", severity: "Moderate", reaction: "Rash" }
    ],
    surgeries: [
      { procedure: "Appendectomy", date: "2010-05-20", notes: "Laparoscopic" },
      { procedure: "Knee Arthroscopy", date: "2015-11-08", notes: "Right knee" }
    ]
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "severe":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "moderate":
        return "bg-warning/10 text-warning border-warning/20";
      default:
        return "bg-muted text-muted-foreground border-muted";
    }
  };

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Medical History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-6">
            {/* Conditions */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-accent" />
                Conditions
              </h4>
              <div className="space-y-2">
                {medicalHistory.conditions.map((condition, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-sm">{condition.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Diagnosed: {new Date(condition.diagnosedDate).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {condition.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Medications */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Pill className="h-4 w-4 text-accent" />
                Current Medications
              </h4>
              <div className="space-y-2">
                {medicalHistory.medications.map((med, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-sm">{med.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {med.dosage} • {med.frequency}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Allergies */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                Allergies
              </h4>
              <div className="space-y-2">
                {medicalHistory.allergies.map((allergy, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-3 bg-destructive/5 rounded-lg border border-destructive/10"
                  >
                    <div>
                      <p className="font-medium text-sm">{allergy.allergen}</p>
                      <p className="text-xs text-muted-foreground">
                        Reaction: {allergy.reaction}
                      </p>
                    </div>
                    <Badge className={getSeverityColor(allergy.severity)}>
                      {allergy.severity}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Surgeries */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Syringe className="h-4 w-4 text-accent" />
                Past Surgeries
              </h4>
              <div className="space-y-2">
                {medicalHistory.surgeries.map((surgery, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-sm">{surgery.procedure}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(surgery.date).toLocaleDateString()} • {surgery.notes}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
