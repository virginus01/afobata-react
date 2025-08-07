import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock } from "lucide-react";

interface ProcessStepProps {
  label: string;
  isCompleted: boolean;
}

export const ProcessStep = ({ label, isCompleted }: ProcessStepProps) => {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg bg-white shadow-sm border border-gray-100">
      <span className="text-xs sm:text-xs text-gray-700">{label}</span>
      {isCompleted ? (
        <Badge
          variant="default"
          className="bg-green-100 text-green-800 flex items-center gap-1 text-xs sm:text-xs"
        >
          <CheckCircle className="w-4 h-4" />
          <span>Complete</span>
        </Badge>
      ) : (
        <Badge
          variant="secondary"
          className="bg-blue-50 text-blue-700 flex items-center gap-1 text-xs sm:text-xs"
        >
          <Clock className="w-4 h-4 animate-pulse" />
          <span>In Progress</span>
        </Badge>
      )}
    </div>
  );
};
