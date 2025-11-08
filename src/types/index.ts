// src/types/index.ts - Complete Type Definitions

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

// Cleaned Documents
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

// Print Configuration
export interface PrintConfig {
  documentsPerPage: 1 | 2 | 4 | 8;
  paperSize: 'a4';
  totalPages: number;
  layoutPreview: string[];
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

export interface PrintPreviewRequest {
  pairedIDs: string[];
  singleDocs: string[];
  documentsPerPage: number;
  paperSize: string;
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
