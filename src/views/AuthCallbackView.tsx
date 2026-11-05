import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Flame } from 'lucide-react';

export const AuthCallbackView: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Obter sessão do OAuth callback
        const { data, error } = await supabase.auth.getSession();
        
        if (error) throw error;

        if (data.session) {
          setStatus('success');
          
          // Criar perfil no banco se não existir
          const user = data.session.user;
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', user.id)
            .single();

          if (!existingProfile) {
            // Criar perfil inicial
            await supabase.from('profiles').insert({
              id: user.id,
              username: user.user_metadata.full_name?.toLowerCase().replace(/\s+/g, '') || `user_${user.id.slice(0, 8)}`,
              full_name: user.user_metadata.full_name || user.email?.split('@')[0] || 'Guerreiro',
              email: user.email,
              avatar_url: user.user_metadata.avatar_url || user.user_metadata.picture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
              bio: 'Guerreiro(a) do STRAVA FIGHT 🥋🔥',
              role: 'Atleta',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
          }

          // Redirecionar para home após 1 segundo
          setTimeout(() => {
            window.location.href = '/';
          }, 1000);
        }
      } catch (err) {
        console.error('OAuth callback error:', err);
        setStatus('error');
        
        // Redirecionar para login após 3 segundos
        setTimeout(() => {
          window.location.href = '/';
        }, 3000);
      }
    };

    handleCallback();
  }, []);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#05070B] via-[#0D121C] to-[#1F2937] flex items-center justify-center">
      <div className="text-center">
        {status === 'loading' && (
          <>
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-[#F20D18]/20"></div>
              <div className="absolute inset-0 rounded-full border-4 border-[#F20D18] border-t-transparent animate-spin"></div>
              <Flame className="absolute inset-0 m-auto w-10 h-10 text-[#F20D18] fill-[#F20D18] animate-pulse" />
            </div>
            <p className="text-xl font-black text-white mb-2">Conectando com STRAVA FIGHT...</p>
            <p className="text-sm text-[#94A3B8]">Aguarde um momento</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
              <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-xl font-black text-white mb-2">Autenticado com sucesso!</p>
            <p className="text-sm text-[#94A3B8]">Redirecionando...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
              <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-xl font-black text-white mb-2">Erro na autenticação</p>
            <p className="text-sm text-[#94A3B8]">Tente novamente</p>
          </>
        )}
      </div>
    </div>
  );
};
