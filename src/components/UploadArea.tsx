import { Upload } from "lucide-react";
import { useCallback } from "react";

interface UploadAreaProps {
  onUpload: (file: File) => void;
  isProcessing?: boolean;
}

export const UploadArea = ({ onUpload, isProcessing = false }: UploadAreaProps) => {
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      onUpload(file);
    }
  }, [onUpload]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="relative w-full h-full min-h-[500px] border-4 border-dashed border-primary/30 hover:border-primary rounded-2xl transition-all duration-300 bg-card hover:bg-primary/5 cursor-pointer group flex items-center justify-center"
    >
      <input
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        disabled={isProcessing}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
      />
      <div className="flex flex-col items-center gap-6 pointer-events-none">
        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
          {isProcessing ? (
            <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          ) : (
            <Upload className="w-12 h-12 md:w-16 md:h-16 text-primary" />
          )}
        </div>
        <h2 className="text-2xl md:text-4xl font-bold text-foreground text-center">
          {isProcessing ? "Processing..." : "Click here to upload your photo"}
        </h2>
      </div>
    </div>
  );
};
