import { useEffect, useState } from "react";
import { Printer, Upload } from "lucide-react";
import { apiService } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

interface Step6FinalProps {
  imageId: string;
  layout: "standard" | "custom";
  onPrint: () => void;
  onRetake: () => void;
}

const Step6Final = ({ 
  imageId, 
  layout, 
  onPrint,
  onRetake 
}: Step6FinalProps) => {
  const { toast } = useToast();
  const [sheetPreview, setSheetPreview] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    generateSheetPreview();
  }, [imageId, layout]);

  const generateSheetPreview = async () => {
    setIsGenerating(true);
    
    try {
      const apiLayout = layout === "standard" ? "3x4" : "2x3";
      const response = await apiService.previewSheet(imageId, apiLayout);
      
      if (response.success && response.data) {
        setSheetPreview(response.data.preview_sheet);
      } else {
        throw new Error(response.error || "Preview generation failed");
      }
    } catch (error) {
      console.error("Preview error:", error);
      toast({
        title: "Preview failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = async () => {
    setIsPrinting(true);

    try {
      const apiLayout = layout === "standard" ? "3x4" : "2x3";
      const response = await apiService.printSheet(imageId, apiLayout, 1);

      if (response.success && response.data) {
        toast({
          title: "✅ Print job sent",
          description: `Printing to ${response.data.printer}`,
        });
        onPrint();
      } else {
        // Try download and print
        const downloadResponse = await apiService.downloadSheet(imageId, apiLayout);
        
        if (downloadResponse.success && downloadResponse.data) {
          const printWindow = window.open("", "_blank");
          if (printWindow) {
            const paperWidth = layout === "standard" ? "6in" : "4in";
            const paperHeight = layout === "standard" ? "4in" : "6in";
            
            printWindow.document.write(`
              <html>
                <head>
                  <title>Print Passport Photo Sheet</title>
                  <style>
                    @page {
                      size: ${paperWidth} ${paperHeight};
                      margin: 0;
                    }
                    @media print {
                      body { 
                        margin: 0; 
                        padding: 0;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                      }
                      img { 
                        width: ${paperWidth};
                        height: ${paperHeight};
                        object-fit: contain;
                        display: block;
                      }
                    }
                    body {
                      margin: 0;
                      padding: 20px;
                      display: flex;
                      justify-content: center;
                      align-items: center;
                      min-height: 100vh;
                      background: #f5f5f5;
                    }
                    img {
                      max-width: 100%;
                      height: auto;
                      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                    }
                  </style>
                </head>
                <body>
                  <img src="${downloadResponse.data.file}" alt="Passport Photo Sheet" />
                  <script>
                    window.onload = function() {
                      setTimeout(function() {
                        window.print();
                      }, 500);
                    }
                  </script>
                </body>
              </html>
            `);
            printWindow.document.close();
          }
          
          toast({
            title: "✅ Opening print dialog",
            description: "Print dialog opened",
          });
        }
      }
    } catch (error) {
      console.error("Print error:", error);
      toast({
        title: "Print failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <div className="h-[calc(100vh-180px)] flex flex-col">
      <div className="flex-1 relative overflow-hidden bg-white">
        {isGenerating ? (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Preparing print sheet...</p>
            </div>
          </div>
        ) : sheetPreview ? (
          <img
            src={sheetPreview}
            alt="Print sheet preview"
            className="w-full h-full object-contain"
            style={{ imageRendering: 'high-quality' }}
          />
        ) : null}
      </div>

      {/* Action Buttons */}
      <div className="p-4 space-y-3">
        <Button 
          onClick={handlePrint}
          disabled={isGenerating || isPrinting}
          className="w-full gap-2"
          size="lg"
        >
          <Printer className="w-5 h-5" />
          {isPrinting ? "Printing..." : "Print Now"}
        </Button>
        <Button 
          onClick={onRetake}
          variant="outline"
          className="w-full gap-2"
          size="lg"
        >
          <Upload className="w-5 h-5" />
          Retake Photo
        </Button>
      </div>
    </div>
  );
};

export default Step6Final;
