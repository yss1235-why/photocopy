import { useState } from "react";
import { Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Step1Upload from "@/components/steps/Step1Upload";
import Step2Crop from "@/components/steps/Step2Crop";
import Step3Layout from "@/components/steps/Step3Layout";
import Step4Processing from "@/components/steps/Step4Processing";
import Step5BeforeAfter from "@/components/steps/Step5BeforeAfter";
import Step6Final from "@/components/steps/Step6Final";
import StepNavigation from "@/components/StepNavigation";
import { PhotoData, CropData } from "@/types";

const Index = () => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [photoData, setPhotoData] = useState<PhotoData>({
    original: null,
    processed: null,
    cropped: null,
    final: null,
    imageId: undefined,
  });
  const [cropData, setCropData] = useState<CropData | null>(null);
  const [selectedLayout, setSelectedLayout] = useState<"standard" | "custom">("standard");

  // ADDED: Track the processed image ID separately
  const [processedImageId, setProcessedImageId] = useState<string | undefined>(undefined);

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

  const handleRetake = () => {
    console.log("🔄 Retaking photo, resetting all state");
    setCurrentStep(1);
    setPhotoData({
      original: null,
      processed: null,
      cropped: null,
      final: null,
      imageId: undefined,
    });
    setCropData(null);
    setSelectedLayout("standard");
    setProcessedImageId(undefined);
  };

  const handleUploadComplete = (imageUrl: string, imageId: string) => {
    console.log("📤 Upload complete:");
    console.log(`   Image ID: ${imageId}`);
    console.log(`   Image URL: ${imageUrl.substring(0, 50)}...`);
    
    setPhotoData({ ...photoData, original: imageUrl, imageId });
    handleNext();
  };

  const handleCropComplete = (croppedImage: string, cropCoords: CropData) => {
    console.log("✂️ Crop complete:");
    console.log(`   Crop data:`, cropCoords);
    
    setPhotoData({ ...photoData, cropped: croppedImage });
    setCropData(cropCoords);
    handleNext();
  };

  const handleLayoutSelect = (layout: "standard" | "custom") => {
    console.log(`📐 Layout selected: ${layout}`);
    setSelectedLayout(layout);
    handleNext();
  };

  const handleProcessingComplete = (beforeImage: string, afterImage: string, newProcessedImageId: string) => {
    console.log("✅ Processing complete:");
    console.log(`   Original ID: ${photoData.imageId}`);
    console.log(`   Processed ID: ${newProcessedImageId}`);
    console.log(`   Before image: ${beforeImage.substring(0, 50)}...`);
    console.log(`   After image: ${afterImage.substring(0, 50)}...`);
    
    // CRITICAL FIX: Update both the processed image AND the processed ID
    setPhotoData({ 
      ...photoData, 
      processed: afterImage,
      cropped: beforeImage // Store before image as cropped for comparison
    });
    setProcessedImageId(newProcessedImageId);
    
    handleNext();
  };

  const handlePrint = () => {
    toast({
      title: "✅ Print initiated",
      description: "Check your print dialog",
    });
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1Upload onUploadComplete={handleUploadComplete} />;
      
      case 2:
        return (
          <Step2Crop
            imageUrl={photoData.original!}
            imageId={photoData.imageId!}
            onCropComplete={handleCropComplete}
          />
        );
      
      case 3:
        return (
          <Step3Layout
            selectedLayout={selectedLayout}
            onLayoutSelect={handleLayoutSelect}
          />
        );
      
      case 4:
        return (
          <Step4Processing
            originalImage={photoData.cropped || photoData.original!}
            imageId={photoData.imageId!}
            cropData={cropData}
            onProcessingComplete={handleProcessingComplete}
          />
        );
      
      case 5:
        return (
          <Step5BeforeAfter
            originalImage={photoData.cropped || photoData.original!}
            processedImage={photoData.processed!}
            onContinue={handleNext}
            onRetake={handleRetake}
          />
        );
      
      case 6:
        // CRITICAL FIX: Use processedImageId for final step
        const imageIdForPrint = processedImageId || photoData.imageId!;
        console.log(`📄 Final step using image ID: ${imageIdForPrint}`);
        
        return (
          <Step6Final
            imageId={imageIdForPrint}
            layout={selectedLayout}
            onPrint={handlePrint}
            onRetake={handleRetake}
          />
        );
      
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
              <Camera className="w-5 h-5 md:w-6 md:h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-foreground">
                Passport Photo Studio
              </h1>
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
          mode="passport"
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
