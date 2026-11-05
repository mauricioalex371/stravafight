/**
 * STRAVA FIGHT - Upload Service
 * Upload de imagens/vídeos para Supabase Storage
 */

import { supabase, isSupabaseReady } from '../../lib/supabase';

export class UploadService {
  /**
   * Upload de imagem para Supabase Storage
   */
  static async uploadImage(
    file: File,
    bucket: 'avatars' | 'covers' | 'posts' | 'stories' | 'reels',
    userId: string
  ): Promise<{ success: boolean; url?: string; error?: string }> {
    if (!isSupabaseReady()) {
      return { success: false, error: 'Supabase não configurado' };
    }

    try {
      // Gerar nome único
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload para Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('[UploadService] Erro no upload:', error);
        return { success: false, error: error.message };
      }

      // Gerar URL pública
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return { success: true, url: publicUrl };
    } catch (err: any) {
      console.error('[UploadService] Erro inesperado:', err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Comprime e otimiza imagem antes do upload
   */
  static async compressImage(file: File, maxWidth: number = 1920, quality: number = 0.85): Promise<File> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target?.result as string;
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let { width, height } = img;
          
          // Redimensionar mantendo aspect ratio
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressed = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now()
                });
                resolve(compressed);
              } else {
                resolve(file);
              }
            },
            'image/jpeg',
            quality
          );
        };
      };
    });
  }

  /**
   * Upload com compressão automática
   */
  static async uploadImageOptimized(
    file: File,
    bucket: 'avatars' | 'covers' | 'posts' | 'stories' | 'reels',
    userId: string
  ): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      // Comprimir se for imagem grande
      let finalFile = file;
      if (file.size > 500000) { // 500KB
        finalFile = await this.compressImage(file);
      }
      
      return this.uploadImage(finalFile, bucket, userId);
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Deleta arquivo do Storage
   */
  static async deleteFile(
    bucket: 'avatars' | 'covers' | 'posts' | 'stories' | 'reels',
    filePath: string
  ): Promise<boolean> {
    if (!isSupabaseReady()) return false;

    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([filePath]);

      if (error) {
        console.error('[UploadService] Erro ao deletar arquivo:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('[UploadService] Erro inesperado ao deletar:', err);
      return false;
    }
  }
}
