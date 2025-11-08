// src/services/cloudinary.ts

import { ApiResponse, ProcessResponse, UploadResponse, CropData } from "@/types";

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

class CloudinaryService {
  private cloudName = CLOUDINARY_CLOUD_NAME;
  private uploadPreset = CLOUDINARY_UPLOAD_PRESET;

  async uploadImage(file: File): Promise<ApiResponse<UploadResponse>> {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_BASE_URL}/upload-cloudinary`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        success: true,
        data: {
          image_id: data.image_id,
          status: data.status,
          face_detected: data.face_detected,
          face_confidence: data.face_confidence || 0,
          dimensions: data.dimensions,
          source: "cloudinary",
        },
      };
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Upload failed",
      };
    }
  }

  async processImage(
    imageId: string,
    cropData?: CropData
  ): Promise<ApiResponse<ProcessResponse>> {
    try {
      const response = await fetch(`${API_BASE_URL}/process-cloudinary`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image_id: imageId,
          crop_data: cropData,
        }),
      });

      if (!response.ok) {
        throw new Error(`Processing failed: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        success: true,
        data: {
          image_id: data.image_id,
          processed_image: data.after_image,
          before_image: data.before_image,
          after_image: data.after_image,
          face_confidence: data.face_confidence,
          bg_removed: data.bg_removed,
          source: "cloudinary",
        },
      };
    } catch (error) {
      console.error("Cloudinary processing error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Processing failed",
      };
    }
  }

  async checkQuota() {
    try {
      const response = await fetch(`${API_BASE_URL}/cloudinary-quota`);
      
      if (!response.ok) {
        throw new Error("Quota check failed");
      }

      return await response.json();
    } catch (error) {
      console.error("Quota check error:", error);
      return null;
    }
  }
}

export const cloudinaryService = new CloudinaryService();
