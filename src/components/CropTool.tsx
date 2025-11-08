import { useState, useRef, useEffect } from "react";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CropData } from "@/types";

interface CropToolProps {
  imageUrl: string;
  onCropChange: (cropData: CropData) => void;
}

export const CropTool = ({ imageUrl, onCropChange }: CropToolProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const cropBoxRef = useRef<HTMLDivElement>(null);
  
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [naturalDimensions, setNaturalDimensions] = useState({ width: 0, height: 0 });

  const CROP_ASPECT_RATIO = 3.5 / 4.5;

  useEffect(() => {
    if (imageLoaded && naturalDimensions.width > 0) {
      updateCropData();
    }
  }, [zoom, position, imageLoaded, naturalDimensions]);

  const updateCropData = () => {
    if (!containerRef.current || !imageRef.current || !cropBoxRef.current) return;

    const container = containerRef.current.getBoundingClientRect();
    const image = imageRef.current;
    
    const displayWidth = image.offsetWidth;
    const displayHeight = image.offsetHeight;
    
    // ✅ FIX: Get actual crop box dimensions from the rendered element
    const cropBox = cropBoxRef.current;
    const cropWidth = cropBox.offsetWidth;
    const cropHeight = cropBox.offsetHeight;
    
    const containerCenterX = container.width / 2;
    const containerCenterY = container.height / 2;
    
    const cropCenterX = containerCenterX;
    const cropCenterY = containerCenterY;
    
    const imageLeft = containerCenterX + position.x - (displayWidth * zoom) / 2;
    const imageTop = containerCenterY + position.y - (displayHeight * zoom) / 2;
    
    const cropLeftOnImage = (cropCenterX - cropWidth / 2 - imageLeft) / zoom;
    const cropTopOnImage = (cropCenterY - cropHeight / 2 - imageTop) / zoom;
    const cropWidthOnImage = cropWidth / zoom;
    const cropHeightOnImage = cropHeight / zoom;
    
    const normalizedX = cropLeftOnImage / displayWidth;
    const normalizedY = cropTopOnImage / displayHeight;
    const normalizedWidth = cropWidthOnImage / displayWidth;
    const normalizedHeight = cropHeightOnImage / displayHeight;
    
    const cropData: CropData = {
      x: normalizedX,
      y: normalizedY,
      width: normalizedWidth,
      height: normalizedHeight,
      displayWidth: displayWidth,
      displayHeight: displayHeight,
      naturalWidth: naturalDimensions.width,
      naturalHeight: naturalDimensions.height,
      zoom: zoom,
    };

    onCropChange(cropData);
  };

  const handleImageLoad = () => {
    if (imageRef.current) {
      setNaturalDimensions({
        width: imageRef.current.naturalWidth,
        height: imageRef.current.naturalHeight
      });
      setImageLoaded(true);
    }
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.1, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.1, 0.5));
  };

  const handleReset = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.touches[0].clientX - position.x,
      y: e.touches[0].clientY - position.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    setPosition({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    });
  };

  const handleEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchend', handleEnd);
      return () => {
        document.removeEventListener('mouseup', handleEnd);
        document.removeEventListener('touchend', handleEnd);
      };
    }
  }, [isDragging]);

  return (
    <div className="h-full flex flex-col">
      {/* Crop Area */}
      <div 
        ref={containerRef}
        className="flex-1 relative bg-muted overflow-hidden"
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
      >
        {/* Image */}
        <div
          className="absolute inset-0 flex items-center justify-center cursor-move touch-none"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
            transition: isDragging ? 'none' : 'transform 0.1s',
          }}
        >
          <img
            ref={imageRef}
            src={imageUrl}
            alt="Crop preview"
            className="max-w-full max-h-full object-contain select-none pointer-events-none"
            draggable={false}
            onLoad={handleImageLoad}
          />
        </div>

        {/* Crop Overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-black/40" />
          
          <div 
            ref={cropBoxRef}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-2 border-primary bg-transparent shadow-lg"
            style={{
              width: `${Math.min(280, containerRef.current?.clientWidth ? containerRef.current.clientWidth * 0.7 : 280)}px`,
              aspectRatio: `${CROP_ASPECT_RATIO}`,
            }}
          >
            <div className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-primary" />
            <div className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-primary" />
            <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-primary" />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-primary" />
            
            <div className="absolute top-1/2 left-0 right-0 h-px bg-primary/30" />
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-primary/30" />
            
            <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[60%] aspect-square rounded-full border-2 border-dashed border-primary/40" />
          </div>

          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-background/90 backdrop-blur px-4 py-2 rounded-full text-sm font-medium">
            {!imageLoaded ? "Loading..." : "Drag to position"}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 flex items-center justify-center gap-2 bg-card border-t border-border">
        <Button
          variant="outline"
          size="sm"
          onClick={handleZoomOut}
          disabled={zoom <= 0.5}
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        
        <div className="px-4 py-2 bg-muted rounded-md text-sm font-medium min-w-[80px] text-center">
          {Math.round(zoom * 100)}%
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleZoomIn}
          disabled={zoom >= 3}
        >
          <ZoomIn className="w-4 h-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="gap-2"
        >
          <Maximize2 className="w-4 h-4" />
          <span className="hidden sm:inline">Reset</span>
        </Button>
      </div>
    </div>
  );
};
