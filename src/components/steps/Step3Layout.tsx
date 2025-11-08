import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface Step3LayoutProps {
  selectedLayout: "standard" | "custom";
  onLayoutSelect: (layout: "standard" | "custom") => void;
}

const Step3Layout = ({ selectedLayout, onLayoutSelect }: Step3LayoutProps) => {
  const handleContinue = () => {
    onLayoutSelect(selectedLayout);
  };

  return (
    <div className="h-[calc(100vh-180px)] flex flex-col justify-center px-4">
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Standard Layout */}
        <button
          onClick={() => onLayoutSelect("standard")}
          className={`p-6 md:p-8 rounded-xl border-2 transition-all duration-200 text-center ${
            selectedLayout === "standard"
              ? "border-primary bg-primary/10 shadow-lg scale-[1.02]"
              : "border-border bg-card hover:border-primary/50"
          }`}
        >
          <div className="aspect-[3/2] bg-muted rounded border-2 border-dashed border-border flex items-center justify-center mb-4">
            <div className="grid grid-cols-4 grid-rows-2 gap-1 p-2 w-full h-full">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-primary/20 rounded" />
              ))}
            </div>
          </div>
          <h3 className="text-lg md:text-xl font-bold text-foreground mb-2">
            Indian Official Standard
          </h3>
          <p className="text-sm md:text-base text-muted-foreground">
            8 Passport Photos
          </p>
          <p className="text-sm md:text-base text-muted-foreground">
            4×6 Landscape
          </p>
          {selectedLayout === "standard" && (
            <div className="mt-3 w-6 h-6 mx-auto rounded-full bg-primary flex items-center justify-center">
              <svg className="w-4 h-4 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </button>

        {/* Custom Layout */}
        <button
          onClick={() => onLayoutSelect("custom")}
          className={`p-6 md:p-8 rounded-xl border-2 transition-all duration-200 text-center ${
            selectedLayout === "custom"
              ? "border-primary bg-primary/10 shadow-lg scale-[1.02]"
              : "border-border bg-card hover:border-primary/50"
          }`}
        >
          <div className="aspect-[2/3] bg-muted rounded border-2 border-dashed border-border flex items-center justify-center mb-4">
            <div className="grid grid-cols-3 grid-rows-4 gap-0.5 p-2 w-full h-full">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="bg-primary/20 rounded" />
              ))}
            </div>
          </div>
          <h3 className="text-lg md:text-xl font-bold text-foreground mb-2">
            Custom Size
          </h3>
          <p className="text-sm md:text-base text-muted-foreground">
            12 Passport Photos
          </p>
          <p className="text-sm md:text-base text-muted-foreground">
            4×6 Portrait - Non-standard
          </p>
          {selectedLayout === "custom" && (
            <div className="mt-3 w-6 h-6 mx-auto rounded-full bg-primary flex items-center justify-center">
              <svg className="w-4 h-4 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </button>
      </div>

      <Button
        onClick={handleContinue}
        className="w-full gap-2"
        size="lg"
      >
        Continue
        <ArrowRight className="w-5 h-5" />
      </Button>
    </div>
  );
};

export default Step3Layout;
