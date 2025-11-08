export type ProcessingMode = "passport" | "studio";

export interface PhotoData {
  original: string | null;
  processed: string | null;
  cropped: string | null;
  final: string | null;
  imageId?: string;
}

export interface CropData {
  x: number;
  y: number;
  width: number;
  height: number;
  displayWidth: number;
  displayHeight: number;
  naturalWidth: number;
  naturalHeight: number;
  zoom: number;
}

export interface ProcessingStatus {
  isProcessing: boolean;
  progress: number;
  message: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface UploadResponse {
  image_id: string;
  face_detected: boolean;
  dimensions: number[];
  status: string;
}

export interface ProcessResponse {
  processed_image: string;
  face_confidence: number;
  bg_removed: boolean;
  status: string;
}

export interface SheetPreviewResponse {
  preview_sheet: string;
  sheet_size: string;
  dpi: number;
  file_path?: string;
  layout_info?: {
    type: string;
    photos_count: number;
    orientation: string;
  };
}
