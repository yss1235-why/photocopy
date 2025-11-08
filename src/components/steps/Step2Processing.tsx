// src/components/steps/Step2Processing.tsx

import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";
import { documentService } from "@/services/documentService";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { 
  UploadedDocument, 
  ProcessingDocument, 
  CleanedDocument, 
  DocumentStats 
} from "@/types";

interface Step2ProcessingProps {
  uploadedDocuments: UploadedDocument[];
  onProcessingComplete: (cleanedDocs: CleanedDocument[]) => void;
}

const Step2Processing = ({ 
  uploadedDocuments, 
  onProcessingComplete 
}: Step2ProcessingProps) => {
  const { toast } = useToast();
  const [processingDocs, setProcessingDocs] = useState<ProcessingDocument[]>([]);
  const [cleanedDocs, setCleanedDocs] = useState<CleanedDocument[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);
  const [stats, setStats] = useState<DocumentStats>({
    total: 0,
    idCards: 0,
    singleDocuments: 0,
    paired: 0,
    unpaired: 0,
    failed: 0
  });

  useEffect(() => {
    processDocuments();
  }, []);

  const processDocuments = async () => {
    // Initialize processing docs
    const initialProcessing: ProcessingDocument[] = uploadedDocuments.map(doc => ({
      id: `processing_${doc.id}`,
      originalId: doc.id,
      status: 'queued',
      progress: 0,
      originalImage: doc.thumbnail
    }));

    setProcessingDocs(initialProcessing);

    // Upload all documents first
    const uploadedIds: string[] = [];
    try {
      const uploadResult = await apiService.uploadDocuments(
        uploadedDocuments.map(d => d.file)
      );

      if (!uploadResult.success || !uploadResult.data) {
        throw new Error("Upload failed");
      }

      uploadedIds.push(...uploadResult.data.map(r => r.id));
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
      return;
    }

    // Process each document
    const cleaned: CleanedDocument[] = [];
    const total = uploadedIds.length;

    for (let i = 0; i < uploadedIds.length; i++) {
      const docId = uploadedIds[i];
      const originalDoc = uploadedDocuments[i];

      // Update status to processing
      setProcessingDocs(prev => prev.map(d =>
        d.originalId === originalDoc.id
          ? { ...d, status: 'processing', progress: 50 }
          : d
      ));

      try {
        const result = await apiService.processDocument(docId);

        if (!result.success || !result.data) {
          throw new Error(result.error || "Processing failed");
        }

        const category = documentService.categorizeDocument(result.data.documentType);

        const cleanedDoc: CleanedDocument = {
          id: result.data.id,
          originalId: originalDoc.id,
          cleanedImage: result.data.cleanedImage,
          originalImage: result.data.originalImage,
          qualityScore: result.data.qualityScore,
          detectedType: result.data.documentType,
          detectedCategory: category,
          rotation: 0,
          dimensions: result.data.dimensions,
          fileSize: result.data.fileSize,
          needsPairing: documentService.needsPairing(result.data.documentType)
        };

        cleaned.push(cleanedDoc);

        // Update status to complete
        setProcessingDocs(prev => prev.map(d =>
          d.originalId === originalDoc.id
            ? { 
                ...d, 
                status: 'complete', 
                progress: 100,
                detectedType: result.data.documentType,
                qualityScore: result.data.qualityScore,
                cleanedImage: result.data.cleanedImage
              }
            : d
        ));

        // Update stats
        setStats(prev => ({
          ...prev,
          total: prev.total + 1,
          idCards: category === 'id_card' ? prev.idCards + 1 : prev.idCards,
          singleDocuments: category === 'single_document' ? prev.singleDocuments + 1 : prev.singleDocuments
        }));

      } catch (error) {
        // Mark as failed
        setProcessingDocs(prev => prev.map(d =>
          d.originalId === originalDoc.id
            ? { 
                ...d, 
                status: 'failed', 
                error: error instanceof Error ? error.message : 'Processing failed' 
              }
            : d
        ));

        setStats(prev => ({ ...prev, failed: prev.failed + 1 }));
      }

      // Update overall progress
      setOverallProgress(((i + 1) / total) * 100);
    }

    setCleanedDocs(cleaned);

    // Auto-proceed when complete
    if (cleaned.length > 0) {
      setTimeout(() => {
        onProcessingComplete(cleaned);
      }, 1000);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete':
        return 'text-success';
      case 'failed':
        return 'text-destructive';
      case 'processing':
        return 'text-primary';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle2 className="w-5 h-5 text-success" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-destructive" />;
      default:
        return <Loader2 className="w-5 h-5 text-primary animate-spin" />;
    }
  };

  return (
    <div className="h-[calc(100vh-180px)] flex flex-col p-4">
      {/* Overall Progress */}
      <Card className="p-6 mb-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Processing Documents</h3>
            <Badge variant="secondary">
              {Math.round(overallProgress)}%
            </Badge>
          </div>

          <Progress value={overallProgress} className="h-2" />

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Processed</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">{stats.idCards}</p>
              <p className="text-sm text-muted-foreground">ID Cards</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">{stats.singleDocuments}</p>
              <p className="text-sm text-muted-foreground">Single Docs</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-success">
                {stats.total - stats.failed}
              </p>
              <p className="text-sm text-muted-foreground">Success</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-destructive">{stats.failed}</p>
              <p className="text-sm text-muted-foreground">Failed</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Processing Queue */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {processingDocs.map((doc) => (
            <Card key={doc.id} className="p-4">
              <div className="flex items-start gap-3">
                {/* Status Icon */}
                <div className="mt-1">
                  {getStatusIcon(doc.status)}
                </div>

                {/* Document Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-sm font-medium truncate">
                      Document {processingDocs.indexOf(doc) + 1}
                    </p>
                    {doc.detectedType && (
                      <Badge variant="outline" className="text-xs">
                        {documentService.formatDocumentType(doc.detectedType)}
                      </Badge>
                    )}
                  </div>

                  <p className={`text-xs mb-2 ${getStatusColor(doc.status)}`}>
                    {doc.status === 'queued' && 'Waiting...'}
                    {doc.status === 'processing' && 'Processing...'}
                    {doc.status === 'complete' && 'Complete'}
                    {doc.status === 'failed' && (doc.error || 'Failed')}
                  </p>

                  {doc.status !== 'queued' && doc.status !== 'failed' && (
                    <Progress value={doc.progress} className="h-1" />
                  )}

                  {doc.qualityScore && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Quality: {doc.qualityScore}%
                    </p>
                  )}
                </div>

                {/* Thumbnail */}
                {doc.cleanedImage && (
                  <div className="w-16 h-16 rounded overflow-hidden bg-muted flex-shrink-0">
                    <img
                      src={doc.cleanedImage}
                      alt="Processed"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Step2Processing;
