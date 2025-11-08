import { useState } from "react";
import { UploadArea } from "@/components/UploadArea";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";

interface Step1UploadProps {
  onUploadComplete: (imageUrl: string, imageId: string) => void;
}

const Step1Upload = ({ onUploadComplete }: Step1UploadProps) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpload = async (file: File) => {
    setIsProcessing(true);

    try {
      const response = await apiService.uploadPhoto(file);
      
      if (response.success && response.data) {
        const imageUrl = URL.createObjectURL(file);
        onUploadComplete(imageUrl, response.data.image_id);
      } else {
        throw new Error(response.error || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-[calc(100vh-180px)] flex items-center justify-center px-4">
      <UploadArea onUpload={handleUpload} isProcessing={isProcessing} />
    </div>
  );
};

export default Step1Upload;
