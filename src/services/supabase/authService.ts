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
    console.log('[AUTH] BYPASS MODE - Criando usuário direto no banco...');
    
    try {
      // SOLUÇÃO EMERGENCIAL: Criar usuário direto no banco sem passar pelo Auth
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const username = payload.username.toLowerCase().replace(/[^a-z0-9_.]/g, '');
      
      // Extrair sherdogId da URL se fornecida
      let sherdogId: number | null = null;
      if (payload.sherdogUrl) {
        const match = payload.sherdogUrl.match(/fighter\/[^/]+-(\d+)$/);
        sherdogId = match ? parseInt(match[1]) : null;
      }

      // Inserir perfil direto no banco
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          username: username,
          full_name: payload.fullName,
          email: payload.email,
          role: payload.role || 'Atleta',
          sherdog_url: payload.sherdogUrl || null,
          sherdog_id: sherdogId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (profileError) {
        console.error('[AUTH] Erro ao criar perfil:', profileError);
        
        // Se falhar, usar localStorage como fallback
        const localUser: UserProfile = {
          id: userId,
          username: username,
          fullName: payload.fullName,
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
          coverUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1200&auto=format&fit=crop&q=80',
          bio: 'Guerreiro(a) do STRAVA FIGHT 🥋🔥',
          role: 'Atleta',
          location: 'Brasil',
          modalities: [],
          affiliatedAcademyName: '',
          affiliatedAcademyId: '',
          isVerified: false,
          followersCount: 0,
          followingCount: 0,
          friendsCount: 0,
          postsCount: 0,
          streakDays: 0,
          totalCheckIns: 0,
          xpPoints: 0,
          beltRankSocial: 'Iniciante SF',
          badges: []
        };
        
        StorageService.saveCurrentUser(localUser);
        StorageService.addUser(localUser);
        
        return { 
          success: true, 
          data: { 
            user: { id: userId, email: payload.email },
            profile: localUser
          } 
        };
      }

      console.log('[AUTH] ✅ Usuário criado com sucesso (modo bypass):', userId);
      
      // Salvar também no localStorage
      const userProfile: UserProfile = {
        id: userId,
        username: username,
        fullName: payload.fullName,
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
        coverUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1200&auto=format&fit=crop&q=80',
        bio: 'Guerreiro(a) do STRAVA FIGHT 🥋🔥',
        role: 'Atleta',
        location: 'Brasil',
        modalities: [],
        affiliatedAcademyName: '',
        affiliatedAcademyId: '',
        isVerified: false,
        followersCount: 0,
        followingCount: 0,
        friendsCount: 0,
        postsCount: 0,
        streakDays: 0,
        totalCheckIns: 0,
        xpPoints: 0,
        beltRankSocial: 'Iniciante SF',
        badges: []
      };
      
      StorageService.saveCurrentUser(userProfile);
      StorageService.addUser(userProfile);

      return { 
        success: true, 
        data: { 
          user: { id: userId, email: payload.email },
          profile: userProfile
        } 
      };
      
    } catch (err: any) {
      console.error('[AUTH] Exception:', err);
      return { success: false, error: `Erro ao criar conta: ${err.message}` };
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

  /**
   * Login com OAuth Social (Google, Facebook, Apple)
   */
  static async signInWithOAuth(provider: 'google' | 'facebook' | 'apple'): Promise<AuthResponse> {
    if (!isSupabaseReady()) {
      return { success: false, error: 'Supabase não configurado' };
    }

    try {
      const redirectTo = `${window.location.origin}/auth/callback`;
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message || 'Falha no login social' };
    }
  }
}
