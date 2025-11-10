// src/components/steps/Step6Confirmation.tsx - UPDATED

import { useState, useEffect } from "react";
import { Printer, CheckCircle2, XCircle, Upload, CreditCard, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import type { PairedIDCard, CleanedDocument, PrintConfig, PrintJob } from "@/types";

interface Step6ConfirmationProps {
  pairedIDs: PairedIDCard[];
  singleDocuments: CleanedDocument[];
  printConfig: PrintConfig;
  onStartNewBatch: () => void;
}

const Step6Confirmation = ({ 
  pairedIDs, 
  singleDocuments, 
  printConfig,
  onStartNewBatch
}: Step6ConfirmationProps) => {
  const { toast } = useToast();
  const [printJob, setPrintJob] = useState<PrintJob | null>(null);
  const [status, setStatus] = useState<'preparing' | 'printing' | 'complete' | 'failed'>('preparing');
  const [error, setError] = useState<string | null>(null);

  const handlePrint = async () => {
    setStatus('printing');

    try {
      // Create print job
      const jobResult = await apiService.createPrintJob({
        pairedIDs: pairedIDs.map(p => p.id),
        singleDocuments: singleDocuments.map(d => d.id),
        config: printConfig
      });

      if (!jobResult.success || !jobResult.data) {
        throw new Error(jobResult.error || "Failed to create print job");
      }

      setPrintJob(jobResult.data);

      // Send to printer
      const printResult = await apiService.sendToPrinter(jobResult.data.id);

      if (!printResult.success) {
        throw new Error(printResult.error || "Failed to send to printer");
      }

      // Poll for completion
      await pollPrintStatus(jobResult.data.id);

      setStatus('complete');

      toast({
        title: "Print job complete",
        description: `${pairedIDs.length + singleDocuments.length} documents printed successfully`,
      });

    } catch (err) {
      setStatus('failed');
      setError(err instanceof Error ? err.message : "Print failed");

      toast({
        title: "Print failed",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const pollPrintStatus = async (jobId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const interval = setInterval(async () => {
        try {
          const statusResult = await apiService.getPrintJobStatus(jobId);

          if (!statusResult.success || !statusResult.data) {
            throw new Error("Failed to get status");
          }

          if (statusResult.data.status === 'complete') {
            clearInterval(interval);
            resolve();
          } else if (statusResult.data.status === 'failed') {
            clearInterval(interval);
            reject(new Error(statusResult.data.error || "Print job failed"));
          } else {
            // Update current page
            setPrintJob(prev => prev ? {
              ...prev,
              currentPage: statusResult.data!.currentPage
            } : null);
          }
        } catch (err) {
          clearInterval(interval);
          reject(err);
        }
      }, 2000); // Poll every 2 seconds
    });
  };

  // Get layout icon and description
  const getLayoutInfo = () => {
    if (printConfig.layoutType === 'id_layout') {
      return {
        Icon: CreditCard,
        label: 'ID Card Layout',
        description: 'Cards printed at actual size (8.5cm × 5.4cm)'
      };
    } else {
      return {
        Icon: FileText,
        label: 'Document Layout',
        description: 'One document per page, scaled to fit A4'
      };
    }
  };

  const layoutInfo = getLayoutInfo();
  const LayoutIcon = layoutInfo.Icon;

  if (status === 'preparing') {
    return (
      <div className="h-[calc(100vh-180px)] flex flex-col p-4">
        <Card className="p-6 mb-4">
          <h2 className="text-2xl font-bold mb-2">Print Preview</h2>
          <p className="text-muted-foreground">Review before printing</p>
        </Card>

        <div className="flex-1 overflow-auto space-y-6">
          {/* Layout Info */}
          <Card className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <LayoutIcon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">{layoutInfo.label}</h3>
                <p className="text-sm text-muted-foreground">{layoutInfo.description}</p>
              </div>
            </div>
          </Card>

          {/* Summary */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Print Summary</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Layout Type</span>
                <Badge variant="secondary" className="capitalize">
                  {printConfig.layoutType.replace('_', ' ')}
                </Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total Documents</span>
                <Badge variant="default" className="text-lg px-3 py-1">
                  {pairedIDs.length + singleDocuments.length}
                </Badge>
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
                <Badge variant="secondary" className="text-lg px-3 py-1">
                  {printConfig.totalPages}
                </Badge>
              </div>
            </div>
          </Card>

          {/* Preview Pages */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Page Previews</h3>

            <div className="space-y-4">
              {printConfig.layoutPreview.map((previewUrl, index) => (
                <div key={index}>
                  <p className="text-sm text-muted-foreground mb-2">
                    Page {index + 1} of {printConfig.totalPages}
                  </p>
                  <div className="aspect-[210/297] bg-muted rounded border overflow-hidden">
                    <img
                      src={previewUrl}
                      alt={`Page ${index + 1}`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="mt-4">
          <Button
            onClick={handlePrint}
            className="w-full gap-2"
            size="lg"
          >
            <Printer className="w-5 h-5" />
            Print {printConfig.totalPages} Pages
          </Button>
        </div>
      </div>
    );
  }

  if (status === 'printing') {
    return (
      <div className="h-[calc(100vh-180px)] flex items-center justify-center p-4">
        <Card className="p-8 max-w-md w-full">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            
            <h3 className="text-2xl font-bold mb-2">Printing...</h3>
            <p className="text-muted-foreground mb-6">
              Please wait while your documents are being printed
            </p>

            {printJob && (
              <>
                <Progress 
                  value={((printJob.currentPage || 0) / printConfig.totalPages) * 100} 
                  className="mb-4"
                />
                <p className="text-sm text-muted-foreground">
                  Processing page {printJob.currentPage || 1} of {printConfig.totalPages}
                </p>
              </>
            )}
          </div>
        </Card>
      </div>
    );
  }

  if (status === 'complete') {
    return (
      <div className="h-[calc(100vh-180px)] flex items-center justify-center p-4">
        <Card className="p-8 max-w-md w-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10 text-success" />
            </div>
            
            <h3 className="text-2xl font-bold mb-2">Print Job Complete!</h3>
            <p className="text-muted-foreground mb-6">
              {pairedIDs.length + singleDocuments.length} documents printed successfully
            </p>

            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between p-3 bg-muted rounded">
                <span className="text-sm">Layout</span>
                <Badge variant="secondary" className="capitalize">
                  {printConfig.layoutType.replace('_', ' ')}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded">
                <span className="text-sm">Pages Printed</span>
                <Badge variant="secondary">{printConfig.totalPages}</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded">
                <span className="text-sm">Documents</span>
                <Badge variant="secondary">
                  {pairedIDs.length + singleDocuments.length}
                </Badge>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handlePrint}
                variant="outline"
                className="w-full"
                size="lg"
              >
                <Printer className="w-5 h-5 mr-2" />
                Print Again
              </Button>
              <Button
                onClick={onStartNewBatch}
                className="w-full gap-2"
                size="lg"
              >
                <Upload className="w-5 h-5" />
                Start New Batch
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Failed state
  return (
    <div className="h-[calc(100vh-180px)] flex items-center justify-center p-4">
      <Card className="p-8 max-w-md w-full">
        <div className="text-center">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-10 h-10 text-destructive" />
          </div>
          
          <h3 className="text-2xl font-bold mb-2">Print Job Failed</h3>
          <p className="text-muted-foreground mb-4">{error}</p>

          <div className="space-y-3">
            <Button
              onClick={handlePrint}
              className="w-full"
              size="lg"
            >
              <Printer className="w-5 h-5 mr-2" />
              Try Again
            </Button>
            <Button
              onClick={onStartNewBatch}
              variant="outline"
              className="w-full"
              size="lg"
            >
              Start New Batch
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Step6Confirmation;
