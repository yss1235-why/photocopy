// src/services/api.ts - Hybrid Cloudinary + Python Service

import { 
  ApiResponse, 
  UploadResponse, 
  ProcessResponse, 
  SheetPreviewResponse, 
  CropData
} from "@/types";
import { cloudinaryService } from "./cloudinary";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const USE_CLOUDINARY = import.meta.env.VITE_USE_CLOUDINARY !== "false";

class ApiService {
  private cloudinaryEnabled = USE_CLOUDINARY;
  private cloudinaryFallbackCount = 0;
  private maxCloudinaryAttempts = 3;

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      console.log("API Request:", url);
      
      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error("API Error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  /**
   * Upload photo - Cloudinary primary, Python fallback
   */
  async uploadPhoto(file: File): Promise<ApiResponse<UploadResponse>> {
    // Try Cloudinary first
    if (this.cloudinaryEnabled && this.cloudinaryFallbackCount < this.maxCloudinaryAttempts) {
      console.log("📤 Attempting Cloudinary upload (primary)...");
      
      const cloudinaryResult = await cloudinaryService.uploadImage(file);
      
      if (cloudinaryResult.success) {
        console.log("✅ Cloudinary upload successful");
        this.cloudinaryFallbackCount = 0;
        return cloudinaryResult as ApiResponse<UploadResponse>;
      }
      
      this.cloudinaryFallbackCount++;
      console.warn(`⚠️ Cloudinary failed (${this.cloudinaryFallbackCount}/${this.maxCloudinaryAttempts}), trying Python...`);
    }

    // Python fallback
    console.log("🔄 Using Python backend upload (fallback)...");
    const formData = new FormData();
    formData.append("file", file);
    
    const result = await this.request<UploadResponse>("/upload", {
      method: "POST",
      body: formData,
    });

    if (result.success && result.data) {
      (result.data as any).source = "python";
    }

    return result;
  }

  /**
   * Process photo - Cloudinary primary, Python fallback
   * Always uses passport mode with 40% enhancement (no parameters needed)
   */
  async processPhoto(
    imageId: string,
    cropData?: CropData
  ): Promise<ApiResponse<ProcessResponse>> {
    const isCloudinaryImage = !imageId.startsWith("img_");

    // Try Cloudinary if image is from Cloudinary
    if (this.cloudinaryEnabled && isCloudinaryImage && this.cloudinaryFallbackCount < this.maxCloudinaryAttempts) {
      console.log("🎨 Attempting Cloudinary processing (passport mode, 40% enhancement)...");
      
      const cloudinaryResult = await cloudinaryService.processImage(
        imageId,
        cropData
      );
      
      if (cloudinaryResult.success) {
        console.log("✅ Cloudinary processing successful");
        this.cloudinaryFallbackCount = 0;
        return cloudinaryResult as ApiResponse<ProcessResponse>;
      }
      
      this.cloudinaryFallbackCount++;
      console.warn(`⚠️ Cloudinary processing failed (${this.cloudinaryFallbackCount}/${this.maxCloudinaryAttempts}), trying Python...`);
    }

    // Python fallback
    console.log("🔄 Using Python backend processing (fallback)...");
    const result = await this.request<ProcessResponse>("/process", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image_id: imageId,
        crop_data: cropData,
      }),
    });

    if (result.success && result.data) {
      (result.data as any).source = "python";
    }

    return result;
  }

  /**
   * Preview sheet - Works with both Cloudinary and Python images
   */
  async previewSheet(
    imageId: string,
    layout: "3x4" | "2x3",
    paper: string = "4x6",
    dpi: number = 300
  ): Promise<ApiResponse<SheetPreviewResponse>> {
    return this.request<SheetPreviewResponse>("/preview-sheet", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image_id: imageId,
        layout,
        paper,
        dpi,
      }),
    });
  }

  /**
   * Download sheet
   */
  async downloadSheet(
    imageId: string,
    layout: "3x4" | "2x3"
  ): Promise<ApiResponse<{ 
    file: string; 
    filename: string; 
    size_bytes: number; 
    dimensions: string; 
    dpi: number 
  }>> {
    return this.request("/download", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image_id: imageId,
        layout,
        format: "png",
      }),
    });
  }

  /**
   * Print sheet
   */
  async printSheet(
    imageId: string,
    layout: "3x4" | "2x3",
    copies: number = 1
  ): Promise<ApiResponse<{ 
    job_id: string; 
    printer: string; 
    message: string;
    settings: any;
  }>> {
    return this.request("/print", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image_id: imageId,
        layout,
        printer: null,
        copies,
      }),
    });
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<ApiResponse<{ status: string }>> {
    return this.request<{ status: string }>("/health", {
      method: "GET",
    });
  }

  /**
   * Check Cloudinary quota
   */
  async checkCloudinaryQuota() {
    return await cloudinaryService.checkQuota();
  }

  /**
   * Get processing source info
   */
  getProcessingInfo() {
    return {
      cloudinaryEnabled: this.cloudinaryEnabled,
      cloudinaryFallbackCount: this.cloudinaryFallbackCount,
      usingPythonFallback: this.cloudinaryFallbackCount >= this.maxCloudinaryAttempts
    };
  }
}

export const apiService = new ApiService();
