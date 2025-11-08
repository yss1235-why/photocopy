import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProcessingMode } from "@/types";

interface StepNavigationProps {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  mode: ProcessingMode;
}

const getStepLabel = (step: number): string => {
  const labels: { [key: number]: string } = {
    1: "Upload Photo",
    2: "Crop Image",
    3: "Choose Layout",
    4: "Processing",
    5: "Compare Results",
    6: "Print Preview",
  };
  return labels[step] || "";
};

const StepNavigation = ({ currentStep, totalSteps, onBack }: StepNavigationProps) => {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="bg-card border-b border-border sticky top-[73px] md:top-[81px] z-40">
      <div className="container mx-auto px-4 py-3 md:py-4">
        <div className="flex items-center justify-between mb-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>
          <div className="text-center flex-1">
            <p className="text-xs md:text-sm font-medium text-muted-foreground">
              Step {currentStep} of {totalSteps}
            </p>
            <p className="text-sm md:text-base font-semibold text-foreground">
              {getStepLabel(currentStep)}
            </p>
          </div>
          <div className="w-[60px] md:w-[80px]" />
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
          <div
            className="bg-primary h-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default StepNavigation;
