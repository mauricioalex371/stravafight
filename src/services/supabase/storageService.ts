import { supabase, isSupabaseReady } from '../../lib/supabase';

export type StorageBucket = 
  | 'avatars' 
  | 'post-media' 
  | 'reels' 
  | 'stories' 
  | 'sf-activities' 
  | 'business-assets';

export interface UploadOptions {
  bucket: StorageBucket;
  file: File | Blob;
  path?: string;
  maxSizeMB?: number;
}

export interface UploadResult {
  success: boolean;
  publicUrl?: string;
  path?: string;
  error?: string;
}

const MAX_IMAGE_SIZE_MB = 5;
const MAX_VIDEO_SIZE_MB = 50;

export class SupabaseStorageService {
  /**
   * Valida tipo de arquivo e tamanho antes do envio
   */
  static validateFile(file: File | Blob, expectedType: 'image' | 'video' | 'any' = 'any'): { valid: boolean; error?: string } {
    const sizeInMB = file.size / (1024 * 1024);

    if (expectedType === 'image' || file.type.startsWith('image/')) {
      if (sizeInMB > MAX_IMAGE_SIZE_MB) {
        return { valid: false, error: `A imagem excede o limite máximo de ${MAX_IMAGE_SIZE_MB}MB (tamanho atual: ${sizeInMB.toFixed(1)}MB).` };
      }
    } else if (expectedType === 'video' || file.type.startsWith('video/')) {
      if (sizeInMB > MAX_VIDEO_SIZE_MB) {
        return { valid: false, error: `O vídeo excede o limite máximo de ${MAX_VIDEO_SIZE_MB}MB (tamanho atual: ${sizeInMB.toFixed(1)}MB).` };
      }
    }

    return { valid: true };
  }

  /**
   * Faz upload de arquivo para o bucket especificado no Supabase Storage.
   * Em ambiente sem Supabase configurado, converte com transparência para DataURL.
   */
  static async uploadMedia(options: UploadOptions): Promise<UploadResult> {
    const { bucket, file, path, maxSizeMB } = options;

    // Validação de limite customizado se fornecido
    if (maxSizeMB && file.size / (1024 * 1024) > maxSizeMB) {
      return {
        success: false,
        error: `O arquivo ultrapassa o limite de ${maxSizeMB}MB.`
      };
    }

    // Validação padrão
    const validation = this.validateFile(file);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Se o Supabase estiver configurado, envia para a nuvem
    if (isSupabaseReady()) {
      try {
        const fileExt = file instanceof File ? file.name.split('.').pop() : 'png';
        const sanitizedExt = fileExt ? fileExt.toLowerCase().replace(/[^a-z0-9]/g, '') : 'png';
        const fileName = path || `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${sanitizedExt}`;

        const { data, error } = await supabase.storage
          .from(bucket)
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: true
          });

        if (error) {
          console.warn('[Supabase Storage] Falha no upload remoto, utilizando fallback local:', error.message);
          return await this.fallbackToDataUrl(file);
        }

        const { data: publicData } = supabase.storage
          .from(bucket)
          .getPublicUrl(data.path);

        return {
          success: true,
          publicUrl: publicData.publicUrl,
          path: data.path
        };
      } catch (err: any) {
        console.warn('[Supabase Storage] Erro inesperado:', err);
        return await this.fallbackToDataUrl(file);
      }
    }

    // Modo de Desenvolvimento / Local Fallback
    return await this.fallbackToDataUrl(file);
  }

  /**
   * Fallback seguro que converte Blob/File em Data URL para renderização imediata na interface
   */
  private static fallbackToDataUrl(file: File | Blob): Promise<UploadResult> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          success: true,
          publicUrl: reader.result as string,
          path: `local_${Date.now()}`
        });
      };
      reader.onerror = () => {
        resolve({
          success: false,
          error: 'Erro ao processar arquivo localmente.'
        });
      };
      reader.readAsDataURL(file);
    });
  }

  /**
   * Remove um arquivo do bucket
   */
  static async removeFile(bucket: StorageBucket, path: string): Promise<boolean> {
    if (!isSupabaseReady()) return true;
    try {
      const { error } = await supabase.storage.from(bucket).remove([path]);
      return !error;
    } catch {
      return false;
    }
  }
}
