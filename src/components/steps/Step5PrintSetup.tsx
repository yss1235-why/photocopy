// src/components/steps/Step5PrintSetup.tsx - UPDATED for new layout system

import { useState, useEffect } from "react";
import { ArrowRight, Printer, CreditCard, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { PairedIDCard, CleanedDocument, PrintConfig, LayoutType } from "@/types";

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
    layoutType: 'document_layout',
    paperSize: 'a4',
    totalPages: 0,
    layoutPreview: []
  });
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);

  useEffect(() => {
    // Auto-select layout based on document types
    const hasIDCards = pairedIDs.length > 0;
    const hasOnlyIDCards = pairedIDs.length > 0 && singleDocuments.length === 0;
    
    const initialLayout: LayoutType = hasOnlyIDCards ? 'id_layout' : 'document_layout';
    
    setPrintConfig(prev => ({
      ...prev,
      layoutType: initialLayout
    }));
    
    calculateTotalPages(initialLayout);
  }, []);

  const calculateTotalPages = (layoutType: LayoutType) => {
    let pages = 0;
    
    if (layoutType === 'id_layout') {
      // ID Layout: 2 IDs per page (front + back, or 2 fronts)
      const totalIDs = pairedIDs.length + singleDocuments.length;
      pages = Math.ceil(totalIDs / 2);
    } else {
      // Document Layout: 1 document per page
      pages = pairedIDs.length + singleDocuments.length;
    }

    setPrintConfig(prev => ({
      ...prev,
      layoutType,
      totalPages: pages
    }));

    generatePreview(layoutType);
  };

  const generatePreview = async (layoutType: LayoutType) => {
    setIsGeneratingPreview(true);

    try {
      const result = await apiService.generatePrintPreview({
        pairedIDs: pairedIDs.map(p => p.id),
        singleDocs: singleDocuments.map(d => d.id),
        layoutType: layoutType,
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

  const handleLayoutChange = (layoutType: LayoutType) => {
    calculateTotalPages(layoutType);
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

  // Layout options with clear descriptions
  const layoutOptions = [
    {
      type: 'id_layout' as LayoutType,
      icon: CreditCard,
      label: 'ID Card Layout',
      description: 'Print ID cards at actual size',
      details: '8.5cm × 5.4cm per card, 2 cards per A4 page',
      bestFor: 'Aadhaar, PAN, DL, Voter ID',
      pageCount: Math.ceil((pairedIDs.length + singleDocuments.length) / 2)
    },
    {
      type: 'document_layout' as LayoutType,
      icon: FileText,
      label: 'Document Layout',
      description: 'One document per page, scaled to fit',
      details: 'Full A4 page with 10mm margins',
      bestFor: 'Certificates, statements, forms',
      pageCount: pairedIDs.length + singleDocuments.length
    }
  ];

  return (
    <div className="h-[calc(100vh-180px)] flex flex-col p-4">
      {/* Header */}
      <Card className="p-6 mb-4">
        <h2 className="text-2xl font-bold mb-2">Choose Print Layout</h2>
        <p className="text-muted-foreground">
          {pairedIDs.length} paired IDs + {singleDocuments.length} single documents
        </p>
      </Card>

      <div className="flex-1 overflow-auto space-y-6">
        {/* Layout Selection */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Print Layout</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {layoutOptions.map(option => {
              const Icon = option.icon;
              const isSelected = printConfig.layoutType === option.type;
              
              return (
                <button
                  key={option.type}
                  onClick={() => handleLayoutChange(option.type)}
                  className={`p-6 rounded-lg border-2 transition-all text-left ${
                    isSelected
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    {isSelected && (
                      <Badge variant="default">Selected</Badge>
                    )}
                  </div>

                  <h4 className="font-semibold text-lg mb-2">{option.label}</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    {option.description}
                  </p>
                  
                  <div className="space-y-2 mb-3">
                    <p className="text-xs font-medium text-muted-foreground">
                      Details:
                    </p>
                    <p className="text-xs">{option.details}</p>
                  </div>

                  <div className="space-y-2 mb-4">
                    <p className="text-xs font-medium text-muted-foreground">
                      Best for:
                    </p>
                    <p className="text-xs">{option.bestFor}</p>
                  </div>

                  <Separator className="my-3" />

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Total pages:
                    </span>
                    <Badge variant="secondary" className="text-base">
                      {option.pageCount}
                    </Badge>
                  </div>

                  {/* Visual representation */}
                  <div className="aspect-[210/297] bg-muted rounded border-2 border-dashed border-border p-2 mt-4">
                    <div className="h-full flex flex-col items-center justify-center gap-2">
                      {option.type === 'id_layout' ? (
                        <>
                          <div className="w-3/4 h-1/3 bg-primary/20 rounded border border-primary/30" />
                          <div className="w-3/4 h-1/3 bg-primary/20 rounded border border-primary/30" />
                        </>
                      ) : (
                        <div className="w-11/12 h-5/6 bg-primary/20 rounded border border-primary/30" />
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Paper Size Info */}
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
              <span className="text-muted-foreground">Layout Type</span>
              <span className="font-semibold capitalize">
                {printConfig.layoutType.replace('_', ' ')}
              </span>
            </div>
            <Separator />
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
              <span className="text-muted-foreground">Total Pages to Print</span>
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
          <Printer className="w-5 h-5" />
          Continue to Print ({printConfig.totalPages} pages)
          <ArrowRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export default Step5PrintSetup;
