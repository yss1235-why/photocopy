// src/components/steps/Step1Upload.tsx

import { useState } from "react";
import { Upload, X, FileText, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { documentService } from "@/services/documentService";
import { validateFiles, validateBatch } from "@/utils/fileValidation";
import type { UploadedDocument } from "@/types";

interface Step1UploadProps {
  onUploadComplete: (documents: UploadedDocument[]) => void;
}

const Step1Upload = ({ onUploadComplete }: Step1UploadProps) => {
  const { toast } = useToast();
  const [uploadQueue, setUploadQueue] = useState<UploadedDocument[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const validation = validateBatch(Array.from(files), uploadQueue.length);
    if (!validation.valid) {
      toast({
        title: "Upload limit exceeded",
        description: validation.error,
        variant: "destructive",
      });
      return;
    }

    const validFiles = validateFiles(files);
    if (validFiles.length === 0) {
      toast({
        title: "No valid files",
        description: "Please select valid image or PDF files",
        variant: "destructive",
      });
      return;
    }

    try {
      const documents = await documentService.prepareDocumentsForUpload(validFiles);
      setUploadQueue(prev => [...prev, ...documents]);

      toast({
        title: "Files added",
        description: `${documents.length} documents added to queue`,
      });
    } catch (error) {
      toast({
        title: "Failed to add files",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const removeFromQueue = (id: string) => {
    setUploadQueue(prev => prev.filter(doc => doc.id !== id));
  };

  const handleContinue = () => {
    if (uploadQueue.length === 0) {
      toast({
        title: "No documents",
        description: "Please add documents to continue",
        variant: "destructive",
      });
      return;
    }

    onUploadComplete(uploadQueue);
  };

  return (
    <div className="h-[calc(100vh-180px)] flex flex-col p-4">
      {/* Upload Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative border-4 border-dashed rounded-2xl transition-all duration-300 flex-1 min-h-[300px] ${
          isDragging
            ? "border-primary bg-primary/10"
            : "border-border hover:border-primary/50"
        }`}
      >
        <input
          type="file"
          accept="image/*,.pdf"
          multiple
          onChange={(e) => handleFileSelect(e.target.files)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />

        {uploadQueue.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 pointer-events-none">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-primary/10 flex items-center justify-center">
              <Upload className="w-12 h-12 md:w-16 md:h-16 text-primary" />
            </div>
            <div className="text-center">
              <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-2">
                Click or drag files here
              </h2>
              <p className="text-muted-foreground">
                Upload up to 200 documents (PDF, JPG, PNG)
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Max 50MB per file
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 overflow-auto h-full">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{uploadQueue.length} documents</Badge>
                <Badge variant="outline">
                  {documentService.formatFileSize(
                    uploadQueue.reduce((sum, doc) => sum + doc.size, 0)
                  )}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setUploadQueue([])}
              >
                Clear All
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {uploadQueue.map((doc) => (
                <Card key={doc.id} className="relative group">
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    onClick={() => removeFromQueue(doc.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>

                  <div className="aspect-square bg-muted rounded-t-lg overflow-hidden flex items-center justify-center">
                    {doc.thumbnail ? (
                      <img
                        src={doc.thumbnail}
                        alt={doc.filename}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                        {doc.type === 'pdf' ? (
                          <FileText className="w-8 h-8 text-primary" />
                        ) : (
                          <ImageIcon className="w-8 h-8 text-primary" />
                        )}
                      </div>
                    )}
                  </div>

                  <div className="p-3">
                    <p className="text-sm font-medium truncate">{doc.filename}</p>
                    <div className="flex items-center justify-between mt-1">
                      <Badge variant="outline" className="text-xs">
                        {doc.type.toUpperCase()}
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        {documentService.formatFileSize(doc.size)}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Continue Button */}
      {uploadQueue.length > 0 && (
        <div className="mt-4">
          <Button
            onClick={handleContinue}
            className="w-full"
            size="lg"
          >
            Continue with {uploadQueue.length} documents
          </Button>
        </div>
      )}
    </div>
  );
};

export default Step1Upload;
