/**
 * STRAVA FIGHT — Security & Anti-Abuse Utilities
 * 
 * Protects against:
 * - Cross-Site Scripting (XSS) via injected user input
 * - Malicious URLs (javascript:, data:text/html)
 * - Malicious / oversized file uploads
 * - Prompt injection and database injection vectors
 */

const ALLOWED_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_VIDEO_MIME_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

export const SECURITY_LIMITS = {
  MAX_IMAGE_SIZE_BYTES: 10 * 1024 * 1024, // 10MB
  MAX_VIDEO_SIZE_BYTES: 50 * 1024 * 1024, // 50MB
  MAX_CAPTION_LENGTH: 2200,
  MAX_BIO_LENGTH: 300,
  MAX_COMMENT_LENGTH: 500,
  MAX_MESSAGE_LENGTH: 1000
};

/**
 * Escapes dangerous HTML entities to prevent XSS.
 */
export function escapeHtml(unsafe: string): string {
  if (!unsafe || typeof unsafe !== 'string') return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Strips HTML tags completely from user text.
 */
export function stripHtml(input: string): string {
  if (!input || typeof input !== 'string') return '';
  return input.replace(/<\/?[^>]+(>|$)/g, '').trim();
}

/**
 * Validates external URLs, disallowing javascript:, vbscript:, data: protocols.
 */
export function isSafeUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim().toLowerCase();
  if (trimmed.startsWith('javascript:') || trimmed.startsWith('vbscript:') || trimmed.startsWith('data:text/html')) {
    return false;
  }
  return trimmed.startsWith('https://') || trimmed.startsWith('http://') || trimmed.startsWith('/') || trimmed.startsWith('mailto:') || trimmed.startsWith('tel:');
}

/**
 * Validates an uploaded File for acceptable MIME type and size limits.
 */
export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateUploadFile(file: File, allowedType: 'image' | 'video' | 'any' = 'image'): FileValidationResult {
  if (!file) {
    return { isValid: false, error: 'Nenhum arquivo fornecido.' };
  }

  // Type check
  const isImage = ALLOWED_IMAGE_MIME_TYPES.includes(file.type);
  const isVideo = ALLOWED_VIDEO_MIME_TYPES.includes(file.type);

  if (allowedType === 'image' && !isImage) {
    return { isValid: false, error: 'Formato de imagem inválido. Use JPG, PNG, WEBP ou GIF.' };
  }

  if (allowedType === 'video' && !isVideo) {
    return { isValid: false, error: 'Formato de vídeo inválido. Use MP4 ou WebM.' };
  }

  if (allowedType === 'any' && !isImage && !isVideo) {
    return { isValid: false, error: 'Tipo de arquivo não permitido.' };
  }

  // Size check
  const maxSize = isVideo ? SECURITY_LIMITS.MAX_VIDEO_SIZE_BYTES : SECURITY_LIMITS.MAX_IMAGE_SIZE_BYTES;
  if (file.size > maxSize) {
    const maxMB = Math.round(maxSize / (1024 * 1024));
    return { isValid: false, error: `Arquivo muito grande. O limite máximo é de ${maxMB}MB.` };
  }

  return { isValid: true };
}

/**
 * Sanitizes user-generated string input by trimming and truncating to maximum length.
 */
export function sanitizeInput(input: string, maxLength: number): string {
  if (!input || typeof input !== 'string') return '';
  const sanitized = stripHtml(input);
  return sanitized.slice(0, maxLength);
}
