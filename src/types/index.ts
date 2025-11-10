// src/types/index.ts - Complete Type Definitions (UPDATED)

// Document Categories
export type DocumentCategory = 'id_card' | 'single_document';

// Document Types
export type IDCardType =
  | 'aadhaar_front'
  | 'aadhaar_back'
  | 'driving_license_front'
  | 'driving_license_back'
  | 'voter_id_front'
  | 'voter_id_back';

export type SingleDocumentType =
  | 'pan_card'
  | 'passport'
  | 'bank_statement'
  | 'certificate'
  | 'generic';

export type DocumentType = IDCardType | SingleDocumentType;

// NEW: Layout Types (replacing documentsPerPage)
export type LayoutType = 'id_layout' | 'document_layout';

// Upload Stage
export interface UploadedDocument {
  id: string;
  file: File;
  filename: string;
  type: 'pdf' | 'image';
  size: number;
  pageCount: number;
  thumbnail: string;
  uploadStatus: 'pending' | 'uploading' | 'complete' | 'error';
  uploadProgress: number;
  error?: string;
}

// Processing Stage
export interface ProcessingDocument {
  id: string;
  originalId: string;
  status: 'queued' | 'processing' | 'complete' | 'failed';
  progress: number;
  qualityScore?: number;
  detectedType?: DocumentType;
  detectedCategory?: DocumentCategory;
  cleanedImage?: string;
  originalImage: string;
  error?: string;
}

// Cleaned Documents (UPDATED with AI metadata)
export interface CleanedDocument {
  id: string;
  originalId: string;
  cleanedImage: string;
  originalImage: string;
  qualityScore: number;
  detectedType: DocumentType;
  detectedCategory: DocumentCategory;
  rotation: 0 | 90 | 180 | 270;
  dimensions: { width: number; height: number };
  fileSize: number;
  needsPairing: boolean;
  
  // NEW: AI detection metadata (optional)
  detectionMethod?: 'ai' | 'ocr' | 'hybrid';
  detectionConfidence?: number;
  aiFeatures?: {
    hasQRCode?: boolean;
    colorProfile?: string;
    layoutScore?: number;
  };
}

// ID Card Pairing
export interface PairedIDCard {
  id: string;
  frontDoc: CleanedDocument;
  backDoc: CleanedDocument;
  confidence: number;
  pairingMethod: 'auto' | 'manual';
  status: 'paired';
  idNumber?: string;
}

export interface UnpairedIDCard {
  id: string;
  document: CleanedDocument;
  side: 'front' | 'back';
  status: 'unpaired';
  reason: 'no_match' | 'low_confidence' | 'multiple_candidates';
}

// Print Configuration (UPDATED - simplified)
export interface PrintConfig {
  layoutType: LayoutType;  // NEW: replaced documentsPerPage
  paperSize: 'a4';
  totalPages: number;
  layoutPreview: string[];
  
  // Removed: documentsPerPage (no longer needed)
}

// Print Job
export interface PrintJob {
  id: string;
  pairedIDs: PairedIDCard[];
  singleDocuments: CleanedDocument[];
  config: PrintConfig;
  totalDocuments: number;
  status: 'preparing' | 'printing' | 'complete' | 'failed';
  currentPage?: number;
  error?: string;
}

// Failed Documents
export interface FailedDocument {
  id: string;
  originalDocument: UploadedDocument;
  error: string;
  canRotate: boolean;
  canDelete: boolean;
  canRetryPairing: boolean;
}

// Document Statistics
export interface DocumentStats {
  total: number;
  idCards: number;
  singleDocuments: number;
  paired: number;
  unpaired: number;
  failed: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface UploadResponse {
  id: string;
  filename: string;
  status: string;
}

export interface ProcessResponse {
  id: string;
  documentType: DocumentType;
  category: DocumentCategory;
  qualityScore: number;
  cleanedImage: string;
  originalImage: string;
  dimensions: { width: number; height: number };
  fileSize: number;
}

export interface PairingResponse {
  paired: PairedIDCard[];
  unpaired: UnpairedIDCard[];
}

// NEW: Updated print preview request
export interface PrintPreviewRequest {
  pairedIDs: string[];
  singleDocs: string[];
  layoutType: LayoutType;  // NEW: layout type instead of docs per page
  paperSize: 'a4';
}

export interface PrintJobRequest {
  pairedIDs: string[];
  singleDocuments: string[];
  config: PrintConfig;
}

export interface PrintJobStatus {
  id: string;
  status: 'preparing' | 'printing' | 'complete' | 'failed';
  currentPage?: number;
  totalPages: number;
  error?: string;
}

// NEW: Layout descriptions for UI
export interface LayoutOption {
  type: LayoutType;
  label: string;
  description: string;
  icon: string;
  bestFor: string[];
}
