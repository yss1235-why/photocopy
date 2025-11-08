// src/pages/Index.tsx

import { useState } from "react";
import { Printer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Step1Upload from "@/components/steps/Step1Upload";
import Step2Processing from "@/components/steps/Step2Processing";
import Step3Pairing from "@/components/steps/Step3Pairing";
import Step4Review from "@/components/steps/Step4Review";
import Step5PrintSetup from "@/components/steps/Step5PrintSetup";
import Step6Confirmation from "@/components/steps/Step6Confirmation";
import StepNavigation from "@/components/StepNavigation";
import type { 
  UploadedDocument, 
  CleanedDocument, 
  PairedIDCard,
  PrintConfig
} from "@/types";

const Index = () => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);
  const [cleanedDocuments, setCleanedDocuments] = useState<CleanedDocument[]>([]);
  const [pairedIDs, setPairedIDs] = useState<PairedIDCard[]>([]);
  const [singleDocuments, setSingleDocuments] = useState<CleanedDocument[]>([]);
  const [printConfig, setPrintConfig] = useState<PrintConfig | null>(null);

  const totalSteps = 6;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleReset = () => {
    console.log("🔄 Resetting application");
    setCurrentStep(1);
    setUploadedDocuments([]);
    setCleanedDocuments([]);
    setPairedIDs([]);
    setSingleDocuments([]);
    setPrintConfig(null);
  };

  const handleUploadComplete = (documents: UploadedDocument[]) => {
    console.log("📤 Upload complete:", documents.length, "documents");
    setUploadedDocuments(documents);
    handleNext();
  };

  const handleProcessingComplete = (cleaned: CleanedDocument[]) => {
    console.log("✅ Processing complete:", cleaned.length, "documents");
    setCleanedDocuments(cleaned);
    handleNext();
  };

  const handlePairingComplete = (
    paired: PairedIDCard[],
    singles: CleanedDocument[]
  ) => {
    console.log("🔗 Pairing complete:", paired.length, "pairs,", singles.length, "singles");
    setPairedIDs(paired);
    setSingleDocuments(singles);
    handleNext();
  };

  const handleReviewComplete = () => {
    console.log("📋 Review complete");
    handleNext();
  };

  const handlePrintSetupComplete = (config: PrintConfig) => {
    console.log("🖨️ Print setup complete:", config);
    setPrintConfig(config);
    handleNext();
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1Upload onUploadComplete={handleUploadComplete} />;
      
      case 2:
        return (
          <Step2Processing
            uploadedDocuments={uploadedDocuments}
            onProcessingComplete={handleProcessingComplete}
          />
        );
      
      case 3:
        return (
          <Step3Pairing
            cleanedDocuments={cleanedDocuments}
            onPairingComplete={handlePairingComplete}
          />
        );
      
      case 4:
        return (
          <Step4Review
            pairedIDs={pairedIDs}
            singleDocuments={singleDocuments}
            onContinue={handleReviewComplete}
          />
        );
      
      case 5:
        return (
          <Step5PrintSetup
            pairedIDs={pairedIDs}
            singleDocuments={singleDocuments}
            onContinue={handlePrintSetupComplete}
          />
        );
      
      case 6:
        return printConfig ? (
          <Step6Confirmation
            pairedIDs={pairedIDs}
            singleDocuments={singleDocuments}
            printConfig={printConfig}
            onStartNewBatch={handleReset}
          />
        ) : null;
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-primary rounded-lg flex items-center justify-center">
              <Printer className="w-5 h-5 md:w-6 md:h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-foreground">
                Document Printing System
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground">
                Professional batch document processing & printing
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Navigation */}
      {currentStep > 1 && currentStep < 6 && (
        <StepNavigation
          currentStep={currentStep}
          totalSteps={totalSteps}
          onBack={handleBack}
        />
      )}

      {/* Main Content */}
      <main className="container mx-auto">
        {renderStep()}
      </main>
    </div>
  );
};

export default Index;
