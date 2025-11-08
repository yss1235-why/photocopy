import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";
import { CropData } from "@/types";

interface Step4ProcessingProps {
  originalImage: string;
  imageId: string;
  cropData: CropData | null;
  onProcessingComplete: (beforeImage: string, afterImage: string, processedImageId: string) => void;
}

const Step4Processing = ({ 
  originalImage,
  imageId,
  cropData,
  onProcessingComplete 
}: Step4ProcessingProps) => {
  const { toast } = useToast();
  const [processing, setProcessing] = useState(true);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("Preparing your photo...");

  useEffect(() => {
    processImage();
  }, []);

  const processImage = async () => {
    setProcessing(true);
    
    // Simulate progress with status messages
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        
        // Update status message based on progress
        if (prev < 30) {
          setStatusMessage("Detecting face...");
        } else if (prev < 60) {
          setStatusMessage("Removing background...");
        } else {
          setStatusMessage("Enhancing quality...");
        }
        
        return prev + 10;
      });
    }, 300);

    try {
      console.log("🎨 Starting image processing...");
      console.log(`   Image ID: ${imageId}`);
      console.log(`   Crop data:`, cropData);
      
      // Process with passport mode (40% enhancement) - no parameters needed
      const response = await apiService.processPhoto(
        imageId,
        cropData || undefined
      );
      
      clearInterval(progressInterval);
      setProgress(100);
      setStatusMessage("Complete!");
      
      if (response.success && response.data) {
        console.log("✅ Processing successful");
        console.log(`   Response:`, response.data);
        
        // CRITICAL FIX: Extract images and processed ID from response
        const beforeImage = response.data.before_image || response.data.processed_image;
        const afterImage = response.data.after_image || response.data.processed_image;
        
        // CRITICAL FIX: Use the standardized image_id from response
        // This ensures the preview/print steps use the correct file
        const processedImageId = response.data.image_id || imageId;
        
        console.log("📋 Processing complete:");
        console.log(`   Original ID: ${imageId}`);
        console.log(`   Processed ID: ${processedImageId}`);
        console.log(`   Before image: ${beforeImage ? beforeImage.substring(0, 50) + '...' : 'none'}`);
        console.log(`   After image: ${afterImage ? afterImage.substring(0, 50) + '...' : 'none'}`);
        
        // Validate we have both images
        if (!beforeImage || !afterImage) {
          throw new Error("Missing before or after image in response");
        }
        
        // CRITICAL FIX: Validate the processed ID exists
        if (!processedImageId) {
          throw new Error("No processed image ID returned from server");
        }
        
        // Wait 500ms before showing results
        setTimeout(() => {
          onProcessingComplete(beforeImage, afterImage, processedImageId);
        }, 500);
      } else {
        throw new Error(response.error || "Processing failed");
      }
    } catch (error) {
      clearInterval(progressInterval);
      console.error("❌ Processing error:", error);
      
      // Show detailed error message
      let errorMessage = "Please try again";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Processing failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      // Log detailed error info for debugging
      console.error("Detailed error info:");
      console.error(`   Image ID: ${imageId}`);
      console.error(`   Crop data:`, cropData);
      console.error(`   Error:`, error);
    }
  };

  return (
    <div className="h-[calc(100vh-180px)] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Circular Progress Indicator */}
        <div className="w-32 h-32 mx-auto mb-8 relative">
          <div className="w-full h-full border-8 border-primary/20 rounded-full" />
          <div 
            className="absolute inset-0 border-8 border-primary border-t-transparent rounded-full animate-spin"
            style={{
              animationDuration: "1s"
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-primary">{progress}%</span>
          </div>
        </div>
        
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Creating your passport photo...
        </h2>
        
        <div className="w-full bg-secondary rounded-full h-3 overflow-hidden mb-4">
          <div
            className="bg-primary h-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <p className="text-lg text-muted-foreground mb-2">
          {statusMessage}
        </p>
        
        <p className="text-sm text-muted-foreground/70">
          Using professional passport standards
        </p>
      </div>
    </div>
  );
};

export default Step4Processing;
