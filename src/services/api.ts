// src/services/api.ts - Complete API Service

import { 
  ApiResponse, 
  UploadResponse, 
  ProcessResponse,
  PairingResponse,
  PrintPreviewRequest,
  PrintJobRequest,
  PrintJob,
  PrintJobStatus
} from "@/types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

class ApiService {
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
   * Upload documents
   */
  async uploadDocuments(files: File[]): Promise<ApiResponse<UploadResponse[]>> {
    const formData = new FormData();
    files.forEach(file => formData.append("files", file));
    
    return this.request<UploadResponse[]>("/upload", {
      method: "POST",
      body: formData,
    });
  }

  /**
   * Process document
   */
  async processDocument(documentId: string): Promise<ApiResponse<ProcessResponse>> {
    return this.request<ProcessResponse>(`/process/${documentId}`, {
      method: "POST",
    });
  }

  /**
   * Auto-pair ID cards
   */
  async autoPairIDCards(documentIds: string[]): Promise<ApiResponse<PairingResponse>> {
    return this.request<PairingResponse>("/pair", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ document_ids: documentIds }),
    });
  }

  /**
   * Update document rotation
   */
  async updateDocumentRotation(documentId: string, rotation: number): Promise<ApiResponse<void>> {
    return this.request<void>(`/documents/${documentId}/rotate`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ rotation }),
    });
  }

  /**
   * Delete document
   */
  async deleteDocument(documentId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/documents/${documentId}`, {
      method: "DELETE",
    });
  }

  /**
   * Generate print preview
   */
  async generatePrintPreview(config: PrintPreviewRequest): Promise<ApiResponse<string[]>> {
    const response = await this.request<{ preview_urls: string[] }>("/print/preview", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(config),
    });

    if (response.success && response.data) {
      return {
        success: true,
        data: response.data.preview_urls,
      };
    }

    return response as ApiResponse<string[]>;
  }

  /**
   * Create print job
   */
  async createPrintJob(config: PrintJobRequest): Promise<ApiResponse<PrintJob>> {
    return this.request<PrintJob>("/print/job", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(config),
    });
  }

  /**
   * Send to printer
   */
  async sendToPrinter(jobId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/print/job/${jobId}/print`, {
      method: "POST",
    });
  }

  /**
   * Get print job status
   */
  async getPrintJobStatus(jobId: string): Promise<ApiResponse<PrintJobStatus>> {
    return this.request<PrintJobStatus>(`/print/job/${jobId}/status`);
  }

  /**
   * Reprocess document
   */
  async reprocessDocument(documentId: string): Promise<ApiResponse<ProcessResponse>> {
    return this.request<ProcessResponse>(`/documents/${documentId}/reprocess`, {
      method: "POST",
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
}

export const apiService = new ApiService();
