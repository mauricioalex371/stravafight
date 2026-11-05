import { supabase, isSupabaseReady } from '../../lib/supabase';
import { UserProfile } from '../../types';
import { StorageService } from '../storageService';

export interface SignUpPayload {
  email: string;
  password: string;
  fullName: string;
  username: string;
  role?: string;
  modality?: string;
  sherdogUrl?: string;
}

export interface AuthResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export class AuthService {
  /**
   * Registra um novo usuário no Supabase Auth e inicializa o perfil público em `profiles`.
   */
  static async signUp(payload: SignUpPayload): Promise<AuthResponse<{ user: any; profile?: UserProfile }>> {
    if (!isSupabaseReady()) {
      // Local fallback para desenvolvimento e testes
      const currentUser = StorageService.getCurrentUser();
      const updated: UserProfile = {
        ...currentUser,
        id: `usr_${Date.now()}`,
        fullName: payload.fullName,
        username: payload.username.toLowerCase().replace(/[^a-z0-9_.]/g, ''),
        role: (payload.role as any) || 'Atleta'
      };
      StorageService.saveCurrentUser(updated);
      return { success: true, data: { user: { id: updated.id, email: payload.email }, profile: updated } };
    }

    try {
      console.log('[AUTH] Iniciando cadastro...', { email: payload.email, supabaseUrl: supabase.supabaseUrl });
      
      const { data, error } = await supabase.auth.signUp({
        email: payload.email,
        password: payload.password,
        options: {
          // URGENTE: Tentar bypass de confirmação de email
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: payload.fullName,
            username: payload.username.toLowerCase().replace(/[^a-z0-9_.]/g, ''),
            role: payload.role || 'Atleta',
            initial_modality: payload.modality || 'Jiu-Jitsu'
          }
        }
      });

      if (error) {
        console.error('[AUTH] Erro do Supabase:', error);
        return { success: false, error: `Erro ao criar conta: ${error.message}. Por favor, verifique sua conexão e tente novamente.` };
      }

      // Se o usuário foi criado, insere ou atualiza o perfil público
      if (data.user) {
        // Extrair sherdogId da URL se fornecida
        let sherdogId: number | null = null;
        if (payload.sherdogUrl) {
          const match = payload.sherdogUrl.match(/fighter\/[^/]+-(\d+)$/);
          sherdogId = match ? parseInt(match[1]) : null;
        }

        await supabase.from('profiles').upsert({
          id: data.user.id,
          username: payload.username.toLowerCase().replace(/[^a-z0-9_.]/g, ''),
          full_name: payload.fullName,
          role: payload.role || 'Atleta',
          sherdog_url: payload.sherdogUrl || null,
          sherdog_id: sherdogId,
          created_at: new Date().toISOString()
        });
      }

      return { success: true, data };
    } catch (err: any) {
      console.error('[AUTH] Exception ao cadastrar:', err);
      return { success: false, error: `Falha ao conectar: ${err.message || 'Erro inesperado'}. Verifique sua internet e tente novamente.` };
    }
  }

  /**
   * Efetua login com e-mail e senha
   */
  static async signIn(email: string, password: string): Promise<AuthResponse<{ session: any; user: any }>> {
    if (!isSupabaseReady()) {
      const user = StorageService.getCurrentUser();
      return { success: true, data: { session: { access_token: 'demo-token' }, user: { id: user.id, email } } };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message || 'Falha ao realizar login' };
    }
  }

  /**
   * Finaliza a sessão do usuário
   */
  static async signOut(): Promise<AuthResponse> {
    if (!isSupabaseReady()) {
      return { success: true };
    }

    try {
      const { error } = await supabase.auth.signOut();
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Solicita e-mail de recuperação de senha
   */
  static async resetPassword(email: string): Promise<AuthResponse> {
    if (!isSupabaseReady()) {
      return {
        success: true,
        data: 'Simulação: e-mail de redefinição enviado com sucesso (modo de desenvolvimento).'
      };
    }

    try {
      const redirectTo = `${window.location.origin}/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo
      });
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Atualiza a senha do usuário logado
   */
  static async updatePassword(newPassword: string): Promise<AuthResponse> {
    if (!isSupabaseReady()) {
      return { success: true };
    }

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Obtém a sessão ativa
   */
  static async getSession() {
    if (!isSupabaseReady()) return null;
    const { data } = await supabase.auth.getSession();
    return data.session;
  }

  /**
   * Escuta mudanças no estado de autenticação (SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED)
   */
  static onAuthStateChange(callback: (event: string, session: any) => void) {
    if (!isSupabaseReady()) {
      return { unsubscribe: () => {} };
    }
    const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
    return subscription;
  }
}
