import { Printer, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ActionButtonsProps {
  onPrint: () => void;
  onBack?: () => void;
  disabled?: boolean;
  showBackButton?: boolean;
}

export const ActionButtons = ({ 
  onPrint, 
  onBack,
  disabled = false,
  showBackButton = true
}: ActionButtonsProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full">
      {showBackButton && onBack && (
        <Button 
          onClick={onBack} 
          disabled={disabled}
          variant="outline"
          className="flex-1 gap-2 order-2 sm:order-1"
          size="lg"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Edit
        </Button>
      )}
      <Button 
        onClick={onPrint} 
        disabled={disabled}
        className="flex-1 gap-2 order-1 sm:order-2"
        size="lg"
      >
        <Printer className="w-5 h-5" />
        Print Photo Sheet
      </Button>
    </div>
  );
};
