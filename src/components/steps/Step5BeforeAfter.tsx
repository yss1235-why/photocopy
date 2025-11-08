import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Upload } from "lucide-react";

interface Step5BeforeAfterProps {
  originalImage: string;
  processedImage: string;
  onContinue: () => void;
  onRetake: () => void;
}

const Step5BeforeAfter = ({
  originalImage,
  processedImage,
  onContinue,
  onRetake,
}: Step5BeforeAfterProps) => {
  const [dividerPosition, setDividerPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const updatePosition = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    setDividerPosition(Math.max(0, Math.min(100, percentage)));
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    updatePosition(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    e.preventDefault();
    updatePosition(e.touches[0].clientX);
  };

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleTouchStart = () => {
    setIsDragging(true);
  };

  const handleEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    const handleGlobalTouchEnd = () => setIsDragging(false);

    if (isDragging) {
      document.addEventListener('mouseup', handleGlobalMouseUp);
      document.addEventListener('touchend', handleGlobalTouchEnd);
    }

    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('touchend', handleGlobalTouchEnd);
    };
  }, [isDragging]);

  return (
    <div className="h-[calc(100vh-180px)] flex flex-col">
      {/* Comparison Slider */}
      <div className="flex-1 relative">
        <div
          ref={containerRef}
          className="relative h-full rounded-lg overflow-hidden cursor-col-resize select-none border border-border shadow-lg touch-none bg-muted"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleEnd}
        >
          {/* Original Image (Background) */}
          <img
            src={originalImage}
            alt="Original"
            className="absolute inset-0 w-full h-full object-contain pointer-events-none"
            draggable={false}
          />

          {/* Processed Image with Clip */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ clipPath: `inset(0 ${100 - dividerPosition}% 0 0)` }}
          >
            <img
              src={processedImage}
              alt="Processed"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none"
              draggable={false}
            />
          </div>

          {/* Labels */}
          <div className="absolute top-4 left-4 bg-background/90 backdrop-blur px-3 py-1.5 rounded-full text-sm font-medium pointer-events-none">
            Before
          </div>
          <div className="absolute top-4 right-4 bg-background/90 backdrop-blur px-3 py-1.5 rounded-full text-sm font-medium pointer-events-none">
            After
          </div>

          {/* Divider */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-primary shadow-lg pointer-events-none"
            style={{ left: `${dividerPosition}%` }}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-lg">
              <div className="flex gap-1">
                <div className="w-0.5 h-4 bg-primary-foreground" />
                <div className="w-0.5 h-4 bg-primary-foreground" />
              </div>
            </div>
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/90 backdrop-blur px-4 py-2 rounded-full text-xs md:text-sm font-medium pointer-events-none">
            Drag to compare
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 space-y-3">
        <Button onClick={onContinue} className="w-full gap-2" size="lg">
          Continue to Print
          <ArrowRight className="w-5 h-5" />
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

export default Step5BeforeAfter;
