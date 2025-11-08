// src/components/steps/Step5PrintSetup.tsx

import { useState, useEffect } from "react";
import { ArrowRight, Printer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { PairedIDCard, CleanedDocument, PrintConfig } from "@/types";

interface Step5PrintSetupProps {
  pairedIDs: PairedIDCard[];
  singleDocuments: CleanedDocument[];
  onContinue: (config: PrintConfig) => void;
}

const Step5PrintSetup = ({ 
  pairedIDs, 
  singleDocuments, 
  onContinue 
}: Step5PrintSetupProps) => {
  const { toast } = useToast();
  const [printConfig, setPrintConfig] = useState<PrintConfig>({
    documentsPerPage: 2,
    paperSize: 'a4',
    totalPages: 0,
    layoutPreview: []
  });
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);

  useEffect(() => {
    calculateTotalPages(printConfig.documentsPerPage);
  }, []);

  const calculateTotalPages = (documentsPerPage: number) => {
    // Paired IDs count as 1 document (front + back on same page)
    const totalDocuments = pairedIDs.length + singleDocuments.length;
    const pages = Math.ceil(totalDocuments / documentsPerPage);

    setPrintConfig(prev => ({
      ...prev,
      documentsPerPage,
      totalPages: pages
    }));

    generatePreview(documentsPerPage);
  };

  const generatePreview = async (documentsPerPage: number) => {
    setIsGeneratingPreview(true);

    try {
      const result = await apiService.generatePrintPreview({
        pairedIDs: pairedIDs.map(p => p.id),
        singleDocs: singleDocuments.map(d => d.id),
        documentsPerPage,
        paperSize: 'a4'
      });

      if (result.success && result.data) {
        setPrintConfig(prev => ({
          ...prev,
          layoutPreview: result.data!
        }));
      } else {
        throw new Error(result.error || "Preview generation failed");
      }
    } catch (error) {
      toast({
        title: "Preview failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPreview(false);
    }
  };

  const handleLayoutChange = (documentsPerPage: 1 | 2 | 4 | 8) => {
    calculateTotalPages(documentsPerPage);
  };

  const handleContinue = () => {
    if (printConfig.layoutPreview.length === 0) {
      toast({
        title: "No preview",
        description: "Please wait for preview generation",
        variant: "destructive",
      });
      return;
    }

    onContinue(printConfig);
  };

  const layoutOptions = [
    { value: 1, label: '1 per page', description: 'Large, full page' },
    { value: 2, label: '2 per page', description: 'Half page each' },
    { value: 4, label: '4 per page', description: 'Quarter page each' },
    { value: 8, label: '8 per page', description: 'Small, 8 per sheet' }
  ];

  return (
    <div className="h-[calc(100vh-180px)] flex flex-col p-4">
      {/* Header */}
      <Card className="p-6 mb-4">
        <h2 className="text-2xl font-bold mb-2">Configure Print Layout</h2>
        <p className="text-muted-foreground">
          {pairedIDs.length} paired IDs + {singleDocuments.length} single documents
        </p>
      </Card>

      <div className="flex-1 overflow-auto space-y-6">
        {/* Layout Selection */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Documents Per Page</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {layoutOptions.map(option => (
              <button
                key={option.value}
                onClick={() => handleLayoutChange(option.value as 1 | 2 | 4 | 8)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  printConfig.documentsPerPage === option.value
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold">{option.label}</p>
                    <p className="text-sm text-muted-foreground">
                      {option.description}
                    </p>
                  </div>
                  {printConfig.documentsPerPage === option.value && (
                    <Badge variant="default">Selected</Badge>
                  )}
                </div>

                {/* Visual representation */}
                <div className="aspect-[210/297] bg-muted rounded border-2 border-dashed border-border p-2 mt-3">
                  <div 
                    className={`grid gap-1 h-full ${
                      option.value === 1 ? 'grid-cols-1' :
                      option.value === 2 ? 'grid-cols-1' :
                      option.value === 4 ? 'grid-cols-2' :
                      'grid-cols-2'
                    } ${
                      option.value === 2 ? 'grid-rows-2' :
                      option.value === 4 ? 'grid-rows-2' :
                      option.value === 8 ? 'grid-rows-4' :
                      'grid-rows-1'
                    }`}
                  >
                    {Array.from({ length: option.value }).map((_, i) => (
                      <div 
                        key={i} 
                        className="bg-primary/20 rounded"
                      />
                    ))}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Paper Size */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Paper Size</h3>
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <p className="font-semibold">A4 (210 × 297 mm)</p>
              <p className="text-sm text-muted-foreground">Standard printing paper</p>
            </div>
            <Badge variant="secondary">Fixed</Badge>
          </div>
        </Card>

        {/* Print Summary */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Print Summary</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total Documents</span>
              <span className="font-semibold">
                {pairedIDs.length + singleDocuments.length}
              </span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Paired ID Cards</span>
              <span className="font-semibold">{pairedIDs.length}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Single Documents</span>
              <span className="font-semibold">{singleDocuments.length}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total Pages</span>
              <Badge variant="default" className="text-lg px-3 py-1">
                {printConfig.totalPages}
              </Badge>
            </div>
          </div>
        </Card>

        {/* Layout Preview */}
        {isGeneratingPreview ? (
          <Card className="p-6">
            <div className="text-center py-8">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Generating preview...</p>
            </div>
          </Card>
        ) : printConfig.layoutPreview.length > 0 ? (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              Layout Preview - Page 1 of {printConfig.totalPages}
            </h3>

            <div className="space-y-4">
              {printConfig.layoutPreview.slice(0, 3).map((previewUrl, index) => (
                <div key={index}>
                  <p className="text-sm text-muted-foreground mb-2">
                    Page {index + 1}
                  </p>
                  <div className="aspect-[210/297] bg-muted rounded border overflow-hidden">
                    <img
                      src={previewUrl}
                      alt={`Preview page ${index + 1}`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              ))}

              {printConfig.totalPages > 3 && (
                <p className="text-sm text-center text-muted-foreground">
                  + {printConfig.totalPages - 3} more pages
                </p>
              )}
            </div>
          </Card>
        ) : null}
      </div>

      {/* Continue Button */}
      <div className="mt-4">
        <Button
          onClick={handleContinue}
          disabled={isGeneratingPreview || printConfig.layoutPreview.length === 0}
          className="w-full gap-2"
          size="lg"
        >
          Continue to Print
          <ArrowRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export default Step5PrintSetup;
