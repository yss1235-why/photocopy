// src/utils/fileValidation.ts

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_BATCH_SIZE = 200;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];
const ALLOWED_PDF_TYPE = 'application/pdf';

export const validateFile = (file: File): { valid: boolean; error?: string } => {
  // Check file type
  if (![...ALLOWED_IMAGE_TYPES, ALLOWED_PDF_TYPE].includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Only PDF, JPG, and PNG files are allowed.'
    };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit.`
    };
  }

  return { valid: true };
};

export const validateBatch = (
  files: File[],
  currentQueueSize: number
): { valid: boolean; error?: string } => {
  const totalSize = currentQueueSize + files.length;

  if (totalSize > MAX_BATCH_SIZE) {
    return {
      valid: false,
      error: `Maximum ${MAX_BATCH_SIZE} documents allowed. You're trying to add ${files.length} more to ${currentQueueSize} existing documents.`
    };
  }

  return { valid: true };
};

export const validateFiles = (files: FileList | File[]): File[] => {
  const fileArray = Array.from(files);
  const validFiles: File[] = [];
  const errors: string[] = [];

  fileArray.forEach(file => {
    const validation = validateFile(file);

    if (validation.valid) {
      validFiles.push(file);
    } else {
      errors.push(`${file.name}: ${validation.error}`);
    }
  });

  if (errors.length > 0) {
    console.warn('File validation errors:', errors);
  }

  return validFiles;
};
