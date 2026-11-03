/**
 * STRAVA FIGHT — Camada Unificada de Integração Supabase
 * Re-exporta cliente oficial, Auth, Storage e banco relacional
 */

export * from '../lib/supabase';
export * from './supabase/authService';
export * from './supabase/storageService';
export * from './supabase/dbService';

import { supabase, isSupabaseReady, getSupabaseConfig } from '../lib/supabase';
import { SupabaseStorageService, StorageBucket } from './supabase/storageService';

export class SupabaseBridge {
  static isReady(): boolean {
    return isSupabaseReady();
  }

  static getClient() {
    return supabase;
  }

  /**
   * Upload de Mídias via Supabase Storage com fallback local
   */
  static async uploadMedia(file: File | Blob, bucket: StorageBucket = 'post-media'): Promise<string> {
    const result = await SupabaseStorageService.uploadMedia({
      bucket,
      file
    });

    if (result.success && result.publicUrl) {
      return result.publicUrl;
    }

    throw new Error(result.error || 'Falha no upload da mídia');
  }
}
