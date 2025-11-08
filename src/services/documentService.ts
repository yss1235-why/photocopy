// src/services/documentService.ts - Document Processing Service

import type {
  UploadedDocument,
  CleanedDocument,
  DocumentType,
  DocumentCategory
} from '@/types';

class DocumentService {
  /**
   * Prepare documents for upload
   */
  async prepareDocumentsForUpload(files: File[]): Promise<UploadedDocument[]> {
    const documents: UploadedDocument[] = [];

    for (const file of files) {
      const id = this.generateId();
      const type = this.getFileType(file);
      const pageCount = 1; // Will be updated for PDFs
      const thumbnail = await this.generateImageThumbnail(file);

      documents.push({
        id,
        file,
        filename: file.name,
        type,
        size: file.size,
        pageCount,
        thumbnail,
        uploadStatus: 'pending',
        uploadProgress: 0
      });
    }

    return documents;
  }

  /**
   * Categorize document based on type
   */
  categorizeDocument(detectedType: DocumentType): DocumentCategory {
    const idCardTypes: DocumentType[] = [
      'aadhaar_front',
      'aadhaar_back',
      'driving_license_front',
      'driving_license_back',
      'voter_id_front',
      'voter_id_back'
    ];

    return idCardTypes.includes(detectedType) ? 'id_card' : 'single_document';
  }

  /**
   * Check if document needs pairing
   */
  needsPairing(detectedType: DocumentType): boolean {
    return this.categorizeDocument(detectedType) === 'id_card';
  }

  /**
   * Get document side (front/back)
   */
  getDocumentSide(detectedType: DocumentType): 'front' | 'back' | null {
    if (detectedType.includes('_front')) return 'front';
    if (detectedType.includes('_back')) return 'back';
    return null;
  }

  /**
   * Get matching document type for pairing
   */
  getMatchingType(detectedType: DocumentType): DocumentType | null {
    const matches: Record<string, DocumentType> = {
      'aadhaar_front': 'aadhaar_back',
      'aadhaar_back': 'aadhaar_front',
      'driving_license_front': 'driving_license_back',
      'driving_license_back': 'driving_license_front',
      'voter_id_front': 'voter_id_back',
      'voter_id_back': 'voter_id_front'
    };

    return matches[detectedType] || null;
  }

  /**
   * Filter documents by category
   */
  filterByCategory(
    documents: CleanedDocument[],
    category: DocumentCategory
  ): CleanedDocument[] {
    return documents.filter(doc => doc.detectedCategory === category);
  }

  /**
   * Validate pairing compatibility
   */
  canPair(frontDoc: CleanedDocument, backDoc: CleanedDocument): boolean {
    // Check if both are ID cards
    if (
      frontDoc.detectedCategory !== 'id_card' ||
      backDoc.detectedCategory !== 'id_card'
    ) {
      return false;
    }

    // Check if one is front and other is back
    const frontSide = this.getDocumentSide(frontDoc.detectedType);
    const backSide = this.getDocumentSide(backDoc.detectedType);

    if (frontSide !== 'front' || backSide !== 'back') {
      return false;
    }

    // Check if they are same type
    const frontBase = frontDoc.detectedType.replace('_front', '');
    const backBase = backDoc.detectedType.replace('_back', '');

    return frontBase === backBase;
  }

  /**
   * Format file size
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Format document type label
   */
  formatDocumentType(type: DocumentType): string {
    const labels: Record<string, string> = {
      'aadhaar_front': 'Aadhaar Card (Front)',
      'aadhaar_back': 'Aadhaar Card (Back)',
      'pan_card': 'PAN Card',
      'driving_license_front': 'Driving License (Front)',
      'driving_license_back': 'Driving License (Back)',
      'voter_id_front': 'Voter ID (Front)',
      'voter_id_back': 'Voter ID (Back)',
      'passport': 'Passport',
      'bank_statement': 'Bank Statement',
      'certificate': 'Certificate',
      'generic': 'Document'
    };

    return labels[type] || type;
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get file type from File object
   */
  private getFileType(file: File): 'pdf' | 'image' {
    return file.type === 'application/pdf' ? 'pdf' : 'image';
  }

  /**
   * Generate thumbnail for image files
   */
  private async generateImageThumbnail(file: File): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d')!;

          const maxSize = 200;
          const ratio = Math.min(maxSize / img.width, maxSize / img.height);

          canvas.width = img.width * ratio;
          canvas.height = img.height * ratio;

          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.src = e.target!.result as string;
      };
      reader.readAsDataURL(file);
    });
  }
}

export const documentService = new DocumentService();
