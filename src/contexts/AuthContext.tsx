/**
 * STRAVA FIGHT — Auth Context com SF Business Sync Integration
 * Gerencia ciclo de vida completo: login, logout, sessão, renovação, troca de conta
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { supabase, isSupabaseReady } from '../lib/supabase';
import { AuthService } from '../services/supabase/authService';
import { BusinessService } from '../services/businessService';
import { StorageService } from '../services/storageService';
import { BusinessMigrationModal } from '../components/BusinessMigrationModal';
import type { UserProfile } from '../types';

// ============================================================================
// TYPES
// ============================================================================

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserProfile | null;
  session: any | null;
  error: string | null;
}

interface AuthContextValue extends AuthState {
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  clearError: () => void;
  showMigrationModal: boolean;
  setShowMigrationModal: (show: boolean) => void;
}

// ============================================================================
// CONTEXT
// ============================================================================

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// ============================================================================
// PROVIDER
// ============================================================================

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    session: null,
    error: null
  });

  // Estado do modal de migração
  const [showMigrationModal, setShowMigrationModal] = useState(false);

  // Flags de controle para evitar inicializações duplicadas
  const syncInitializedRef = useRef(false);
  const currentUserIdRef = useRef<string | null>(null);
  const isInitializingRef = useRef(false);
  const migrationCheckedRef = useRef(false);

  // ============================================================================
  // SYNC LIFECYCLE MANAGEMENT
  // ============================================================================

  /**
   * Inicializa sincronização SF Business com proteção contra duplicatas
   */
  const initializeBusinessSync = useCallback(async (userId: string, accessToken: string) => {
    // Proteção: não inicializar se já foi inicializado para este usuário
    if (syncInitializedRef.current && currentUserIdRef.current === userId) {
      console.info('[AuthContext] Sync já inicializado para este usuário, skipping...');
      return;
    }

    // Proteção: não inicializar se já está em processo de inicialização
    if (isInitializingRef.current) {
      console.info('[AuthContext] Sync initialization já em progresso, skipping...');
      return;
    }

    try {
      isInitializingRef.current = true;

      console.info('[AuthContext] Inicializando SF Business Sync...', { userId });

      // Inicializar sync service
      BusinessService.initializeSync(userId, accessToken);

      // Marcar como inicializado
      syncInitializedRef.current = true;
      currentUserIdRef.current = userId;

      // Sincronizar operações pendentes imediatamente
      await BusinessService.syncNow();

      console.info('[AuthContext] SF Business Sync inicializado com sucesso');
    } catch (error) {
      console.error('[AuthContext] Erro ao inicializar SF Business Sync:', error);
      // Não bloquear o login por falha de sync
    } finally {
      isInitializingRef.current = false;
    }
  }, []);

  /**
   * Encerra sincronização SF Business com limpeza completa
   */
  const shutdownBusinessSync = useCallback(async () => {
    if (!syncInitializedRef.current) {
      console.info('[AuthContext] Sync não estava inicializado, skipping shutdown...');
      return;
    }

    try {
      console.info('[AuthContext] Encerrando SF Business Sync...');

      // Sincronizar operações pendentes antes de encerrar
      await BusinessService.syncNow();

      // Shutdown completo
      await BusinessService.shutdownSync();

      // Limpar flags
      syncInitializedRef.current = false;
      currentUserIdRef.current = null;

      console.info('[AuthContext] SF Business Sync encerrado com sucesso');
    } catch (error) {
      console.error('[AuthContext] Erro ao encerrar SF Business Sync:', error);
      // Forçar limpeza dos flags mesmo com erro
      syncInitializedRef.current = false;
      currentUserIdRef.current = null;
    }
  }, []);

  /**
   * Troca de conta: encerrar sync da conta anterior
   */
  const handleAccountSwitch = useCallback(async (newUserId: string) => {
    console.info('[AuthContext] Troca de conta detectada', {
      previous: currentUserIdRef.current,
      new: newUserId
    });

    // Se sync estava ativo para outro usuário, encerrar
    if (syncInitializedRef.current && currentUserIdRef.current !== newUserId) {
      await shutdownBusinessSync();
    }
  }, [shutdownBusinessSync]);

  // ============================================================================
  // AUTHENTICATION METHODS
  // ============================================================================

  /**
   * Login com email e senha
   */
  const signIn = useCallback(async (email: string, password: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await AuthService.signIn(email, password);

      if (!result.success) {
        setState((prev) => ({ ...prev, isLoading: false, error: result.error || 'Login falhou' }));
        return { success: false, error: result.error };
      }

      const { session, user: authUser } = result.data || {};

      if (!session || !authUser) {
        setState((prev) => ({ ...prev, isLoading: false, error: 'Sessão inválida' }));
        return { success: false, error: 'Sessão inválida' };
      }

      // Buscar perfil completo do usuário
      let userProfile: UserProfile;

      if (isSupabaseReady()) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();

        if (profile) {
          userProfile = {
            id: profile.id,
            username: profile.username,
            fullName: profile.full_name,
            role: profile.role,
            avatarUrl: profile.avatar_url,
            coverUrl: profile.cover_url,
            bio: profile.bio,
            modalities: [profile.primary_modality || 'MMA'],
            affiliatedAcademyName: profile.academy,
            location: profile.location,
            followersCount: profile.followers_count || 0,
            followingCount: profile.following_count || 0,
            postsCount: profile.posts_count || 0,
            friendsCount: 0,
            streakDays: 0,
            totalCheckIns: 0,
            xpPoints: 0,
            beltRankSocial: profile.belt_rank || 'Iniciante',
            badges: [],
            isVerified: profile.is_verified || false
          };
        } else {
          // Fallback se perfil não existe no banco
          userProfile = StorageService.getCurrentUser();
          userProfile.id = authUser.id;
        }
      } else {
        // Modo local/fallback
        userProfile = StorageService.getCurrentUser();
        userProfile.id = authUser.id;
      }

      // Salvar usuário no localStorage
      StorageService.saveCurrentUser(userProfile);

      // Verificar troca de conta
      await handleAccountSwitch(authUser.id);

      // Inicializar SF Business Sync
      if (session.access_token) {
        await initializeBusinessSync(authUser.id, session.access_token);
      }

      // Detectar dados legados e mostrar modal de migração
      if (!migrationCheckedRef.current) {
        const hasLegacy = await BusinessService.hasLegacyBusinessData();
        if (hasLegacy) {
          console.info('[AuthContext] Dados legados detectados, abrindo modal de migração');
          setShowMigrationModal(true);
        }
        migrationCheckedRef.current = true;
      }

      setState({
        isAuthenticated: true,
        isLoading: false,
        user: userProfile,
        session,
        error: null
      });

      return { success: true };
    } catch (error: any) {
      console.error('[AuthContext] SignIn error:', error);
      setState((prev) => ({ ...prev, isLoading: false, error: error.message }));
      return { success: false, error: error.message };
    }
  }, [initializeBusinessSync, handleAccountSwitch]);

  /**
   * Logout
   */
  const signOut = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      // Encerrar SF Business Sync ANTES do logout
      await shutdownBusinessSync();

      // Logout do Supabase
      await AuthService.signOut();

      // Resetar flags
      migrationCheckedRef.current = false;
      setShowMigrationModal(false);

      // Limpar estado
      setState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        session: null,
        error: null
      });

      console.info('[AuthContext] Logout concluído com sucesso');
    } catch (error: any) {
      console.error('[AuthContext] SignOut error:', error);
      // Mesmo com erro, limpar estado local
      migrationCheckedRef.current = false;
      setShowMigrationModal(false);
      setState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        session: null,
        error: null
      });
    }
  }, [shutdownBusinessSync]);

  /**
   * Renovar sessão expirada
   */
  const refreshSession = useCallback(async () => {
    if (!isSupabaseReady()) return;

    try {
      const { data, error } = await supabase.auth.refreshSession();

      if (error) {
        console.error('[AuthContext] Session refresh failed:', error);
        // Forçar logout se renovação falhar
        await signOut();
        return;
      }

      if (data.session && data.user) {
        console.info('[AuthContext] Sessão renovada com sucesso');

        // Reinicializar sync com novo token
        if (syncInitializedRef.current) {
          await shutdownBusinessSync();
          await initializeBusinessSync(data.user.id, data.session.access_token);
        }

        setState((prev) => ({
          ...prev,
          session: data.session
        }));
      }
    } catch (error) {
      console.error('[AuthContext] RefreshSession error:', error);
      await signOut();
    }
  }, [signOut, initializeBusinessSync, shutdownBusinessSync]);

  /**
   * Limpar erro
   */
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  // ============================================================================
  // INITIALIZATION & AUTH STATE LISTENER
  // ============================================================================

  useEffect(() => {
    let mounted = true;
    let authSubscription: any = null;

    const initialize = async () => {
      if (!mounted) return;

      try {
        // Verificar sessão existente
        const session = await AuthService.getSession();

        if (session && session.user) {
          console.info('[AuthContext] Sessão existente encontrada, restaurando...');

          // Buscar perfil do usuário
          let userProfile: UserProfile;

          if (isSupabaseReady()) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (profile) {
              userProfile = {
                id: profile.id,
                username: profile.username,
                fullName: profile.full_name,
                role: profile.role,
                avatarUrl: profile.avatar_url,
                coverUrl: profile.cover_url,
                bio: profile.bio,
                modalities: [profile.primary_modality || 'MMA'],
                affiliatedAcademyName: profile.academy,
                location: profile.location,
                followersCount: profile.followers_count || 0,
                followingCount: profile.following_count || 0,
                postsCount: profile.posts_count || 0,
                friendsCount: 0,
                streakDays: 0,
                totalCheckIns: 0,
                xpPoints: 0,
                beltRankSocial: profile.belt_rank || 'Iniciante',
                badges: [],
                isVerified: profile.is_verified || false
              };
            } else {
              userProfile = StorageService.getCurrentUser();
              userProfile.id = session.user.id;
            }
          } else {
            userProfile = StorageService.getCurrentUser();
            userProfile.id = session.user.id;
          }

          StorageService.saveCurrentUser(userProfile);

          // Inicializar sync com sessão restaurada
          if (session.access_token) {
            await initializeBusinessSync(session.user.id, session.access_token);
          }

          if (mounted) {
            setState({
              isAuthenticated: true,
              isLoading: false,
              user: userProfile,
              session,
              error: null
            });
          }
        } else {
          if (mounted) {
            setState((prev) => ({ ...prev, isLoading: false }));
          }
        }

        // Listener para mudanças de estado de autenticação
        authSubscription = AuthService.onAuthStateChange(async (event, session) => {
          if (!mounted) return;

          console.info('[AuthContext] Auth state changed:', event);

          if (event === 'SIGNED_OUT') {
            await shutdownBusinessSync();
            setState({
              isAuthenticated: false,
              isLoading: false,
              user: null,
              session: null,
              error: null
            });
          } else if (event === 'TOKEN_REFRESHED' && session) {
            console.info('[AuthContext] Token refreshed, reinitializing sync...');
            if (syncInitializedRef.current && session.user) {
              await shutdownBusinessSync();
              await initializeBusinessSync(session.user.id, session.access_token);
            }
            setState((prev) => ({ ...prev, session }));
          } else if (event === 'SIGNED_IN' && session && session.user) {
            // Login externo (ex: OAuth)
            const userProfile = StorageService.getCurrentUser();
            userProfile.id = session.user.id;
            StorageService.saveCurrentUser(userProfile);

            await handleAccountSwitch(session.user.id);

            if (session.access_token) {
              await initializeBusinessSync(session.user.id, session.access_token);
            }

            setState({
              isAuthenticated: true,
              isLoading: false,
              user: userProfile,
              session,
              error: null
            });
          }
        });
      } catch (error) {
        console.error('[AuthContext] Initialization error:', error);
        if (mounted) {
          setState((prev) => ({ ...prev, isLoading: false }));
        }
      }
    };

    initialize();

    return () => {
      mounted = false;
      if (authSubscription && typeof authSubscription.unsubscribe === 'function') {
        authSubscription.unsubscribe();
      }
    };
  }, [initializeBusinessSync, shutdownBusinessSync, handleAccountSwitch]);

  // ============================================================================
  // RENDER
  // ============================================================================

  const value: AuthContextValue = {
    ...state,
    signIn,
    signOut,
    refreshSession,
    clearError,
    showMigrationModal,
    setShowMigrationModal
  };

  const handleCloseMigrationModal = () => {
    setShowMigrationModal(false);
    // Marcar como checked para não reabrir automaticamente
    migrationCheckedRef.current = true;
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      {showMigrationModal && state.user && state.session && (
        <BusinessMigrationModal
          isOpen={showMigrationModal}
          onClose={handleCloseMigrationModal}
          userId={state.user.id}
          accessToken={state.session.access_token}
        />
      )}
    </AuthContext.Provider>
  );
};
