import { useState } from "react";
import { CropTool } from "@/components/CropTool";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { CropData } from "@/types";
import { useToast } from "@/hooks/use-toast";

interface Step2CropProps {
  imageUrl: string;
  imageId: string;
  onCropComplete: (croppedImage: string, cropData: CropData) => void;
}

const Step2Crop = ({ imageUrl, imageId, onCropComplete }: Step2CropProps) => {
  const { toast } = useToast();
  const [cropData, setCropData] = useState<CropData | null>(null);

  const handleCropChange = (data: CropData) => {
    setCropData(data);
  };

  const handleContinue = async () => {
    if (!cropData) {
      toast({
        title: "Adjust crop area",
        description: "Please position the crop area over your face",
        variant: "destructive",
      });
      return;
    }

    if (!cropData.naturalWidth || !cropData.naturalHeight) {
      toast({
        title: "Image not loaded",
        description: "Please wait for the image to load completely",
        variant: "destructive",
      });
      return;
    }

    if (cropData.x < 0 || cropData.x > 1 || cropData.y < 0 || cropData.y > 1) {
      toast({
        title: "Invalid crop position",
        description: "Please adjust the crop area within the image",
        variant: "destructive",
      });
      return;
    }

    if (cropData.width <= 0 || cropData.width > 1 || cropData.height <= 0 || cropData.height > 1) {
      toast({
        title: "Invalid crop size",
        description: "Please adjust the crop area to a valid size",
        variant: "destructive",
      });
      return;
    }

    onCropComplete(imageUrl, cropData);
  };

  return (
    <div className="h-[calc(100vh-180px)] flex flex-col">
      <div className="flex-1 relative">
        <CropTool 
          imageUrl={imageUrl} 
          onCropChange={handleCropChange}
        />
      </div>

      <div className="p-4">
        <Button 
          onClick={handleContinue} 
          disabled={!cropData}
          className="w-full gap-2"
          size="lg"
        >
          Continue
          <ArrowRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export default Step2Crop;
