import React, { useState, useEffect } from 'react';
import { 
  Save, 
  Eye, 
  Monitor, 
  Smartphone, 
  Image, 
  Video, 
  Type, 
  Palette,
  Upload,
  LogOut,
  Settings,
  Check,
  X
} from 'lucide-react';

interface AppConfig {
  // Onboarding / Splash
  splashVideoUrl: string;
  
  // Auth Screen
  authLogo: string;
  authBackground: string;
  authTagline: string;
  authSubtitle: string;
  authButtonColor: string;
  
  // Onboarding Slides
  onboardingSlides: Array<{
    title: string;
    description: string;
    image: string;
  }>;
  
  // General Branding
  primaryColor: string;
  secondaryColor: string;
  brandName: string;
}

const DEFAULT_CONFIG: AppConfig = {
  splashVideoUrl: '/assets/aistudio/stravafight.mp4',
  authLogo: '/assets/aistudio/LOGO_47d32ee0.jpg',
  authBackground: 'gradient-to-br from-[#05070B] via-[#0D121C] to-[#1F2937]',
  authTagline: 'Esforço que transforma. Luta que evolui.',
  authSubtitle: 'A rede social das artes marciais',
  authButtonColor: '#F20D18',
  onboardingSlides: [
    {
      title: 'Registre Seus Treinos',
      description: 'Check-in diário, SF Activity filter e acompanhe sua evolução no tatame com métricas avançadas.',
      image: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=800&auto=format&fit=crop&q=80'
    },
    {
      title: 'Conecte-se com Lutadores',
      description: 'Siga atletas, compartilhe técnicas, troque experiências e construa sua rede no mundo das lutas.',
      image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80'
    },
    {
      title: 'Desafios e Conquistas',
      description: 'Participe de desafios, ganhe XP, desbloqueie badges e evolua seu ranking social nas artes marciais.',
      image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop&q=80'
    }
  ],
  primaryColor: '#F20D18',
  secondaryColor: '#FF4A0F',
  brandName: 'STRAVA FIGHT'
};

export const AdminPanel: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [activeTab, setActiveTab] = useState<'splash' | 'auth' | 'onboarding' | 'branding'>('splash');
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('mobile');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Carregar configuração salva
  useEffect(() => {
    const savedConfig = localStorage.getItem('sf_admin_config');
    if (savedConfig) {
      try {
        setConfig(JSON.parse(savedConfig));
      } catch (e) {
        console.error('Erro ao carregar config:', e);
      }
    }
  }, []);

  // Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginForm.username === 'stravafight' && loginForm.password === '137713') {
      setIsAuthenticated(true);
      localStorage.setItem('sf_admin_auth', 'true');
    } else {
      alert('❌ Usuário ou senha incorretos!');
    }
  };

  // Logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('sf_admin_auth');
  };

  // Salvar configuração
  const handleSave = () => {
    setIsSaving(true);
    localStorage.setItem('sf_admin_config', JSON.stringify(config));
    
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    }, 1000);
  };

  // Verificar autenticação salva
  useEffect(() => {
    const auth = localStorage.getItem('sf_admin_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // Tela de Login
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-[#05070B] via-[#1F2937] to-[#0D121C] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-[#0D121C] border border-[#1F2937] rounded-3xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-[#F20D18] to-[#FF4A0F] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Settings className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-black text-white mb-2">Admin Panel</h1>
              <p className="text-sm text-[#94A3B8]">STRAVA FIGHT - Gerenciamento Visual</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-sm font-bold text-[#CBD5E1] mb-2 block">Usuário</label>
                <input
                  type="text"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                  className="w-full h-12 px-4 bg-[#1F2937] border border-[#374151] rounded-xl text-white outline-none focus:border-[#F20D18]"
                  placeholder="stravafight"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-bold text-[#CBD5E1] mb-2 block">Senha</label>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  className="w-full h-12 px-4 bg-[#1F2937] border border-[#374151] rounded-xl text-white outline-none focus:border-[#F20D18]"
                  placeholder="••••••"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-[#F20D18] to-[#FF4A0F] text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
              >
                Entrar
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Painel Admin
  return (
    <div className="fixed inset-0 bg-[#05070B] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="h-16 bg-[#0D121C] border-b border-[#1F2937] flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-[#F20D18] to-[#FF4A0F] rounded-lg flex items-center justify-center">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-black text-white">Admin Panel</h1>
            <p className="text-xs text-[#64748B]">Gerenciamento Visual</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${
              saveSuccess
                ? 'bg-green-600 text-white'
                : isSaving
                ? 'bg-[#374151] text-[#94A3B8] cursor-wait'
                : 'bg-[#F20D18] text-white hover:bg-[#d00a14]'
            }`}
          >
            {saveSuccess ? (
              <>
                <Check className="w-4 h-4" />
                Salvo!
              </>
            ) : isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Salvar
              </>
            )}
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-[#1F2937] text-white rounded-lg hover:bg-[#374151] transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Tabs */}
        <div className="w-64 bg-[#0D121C] border-r border-[#1F2937] overflow-y-auto">
          <div className="p-4 space-y-2">
            <TabButton
              icon={Video}
              label="Vídeo Splash"
              active={activeTab === 'splash'}
              onClick={() => setActiveTab('splash')}
            />
            <TabButton
              icon={Image}
              label="Tela de Login"
              active={activeTab === 'auth'}
              onClick={() => setActiveTab('auth')}
            />
            <TabButton
              icon={Eye}
              label="Onboarding"
              active={activeTab === 'onboarding'}
              onClick={() => setActiveTab('onboarding')}
            />
            <TabButton
              icon={Palette}
              label="Marca & Cores"
              active={activeTab === 'branding'}
              onClick={() => setActiveTab('branding')}
            />
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            {activeTab === 'splash' && (
              <SplashEditor config={config} setConfig={setConfig} />
            )}
            {activeTab === 'auth' && (
              <AuthEditor config={config} setConfig={setConfig} />
            )}
            {activeTab === 'onboarding' && (
              <OnboardingEditor config={config} setConfig={setConfig} />
            )}
            {activeTab === 'branding' && (
              <BrandingEditor config={config} setConfig={setConfig} />
            )}
          </div>
        </div>

        {/* Preview */}
        <div className="w-96 bg-[#0D121C] border-l border-[#1F2937] overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white">Preview</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setPreviewMode('mobile')}
                  className={`p-2 rounded-lg transition-colors ${
                    previewMode === 'mobile'
                      ? 'bg-[#F20D18] text-white'
                      : 'bg-[#1F2937] text-[#94A3B8]'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPreviewMode('desktop')}
                  className={`p-2 rounded-lg transition-colors ${
                    previewMode === 'desktop'
                      ? 'bg-[#F20D18] text-white'
                      : 'bg-[#1F2937] text-[#94A3B8]'
                  }`}
                >
                  <Monitor className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="bg-[#1F2937] rounded-xl p-4 text-center">
              <p className="text-xs text-[#94A3B8]">
                Preview em desenvolvimento
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Tab Button Component
const TabButton: React.FC<{
  icon: React.FC<any>;
  label: string;
  active: boolean;
  onClick: () => void;
}> = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
      active
        ? 'bg-[#F20D18] text-white'
        : 'text-[#94A3B8] hover:bg-[#1F2937]'
    }`}
  >
    <Icon className="w-5 h-5" />
    <span className="font-bold text-sm">{label}</span>
  </button>
);

// Splash Editor
const SplashEditor: React.FC<{
  config: AppConfig;
  setConfig: (config: AppConfig) => void;
}> = ({ config, setConfig }) => (
  <div className="space-y-6">
    <div>
      <h2 className="text-2xl font-black text-white mb-2">Vídeo Splash</h2>
      <p className="text-sm text-[#94A3B8]">Vídeo exibido na primeira abertura do app</p>
    </div>

    <div className="bg-[#0D121C] border border-[#1F2937] rounded-2xl p-6 space-y-4">
      <div>
        <label className="text-sm font-bold text-[#CBD5E1] mb-2 block">URL do Vídeo</label>
        <input
          type="text"
          value={config.splashVideoUrl}
          onChange={(e) => setConfig({ ...config, splashVideoUrl: e.target.value })}
          className="w-full h-12 px-4 bg-[#1F2937] border border-[#374151] rounded-xl text-white outline-none focus:border-[#F20D18]"
          placeholder="/assets/video.mp4"
        />
        <p className="text-xs text-[#64748B] mt-2">
          Cole a URL do vídeo hospedado no Supabase Storage ou external CDN
        </p>
      </div>

      <div className="p-4 bg-[#1F2937] rounded-xl">
        <video 
          src={config.splashVideoUrl} 
          className="w-full rounded-lg"
          controls
          onError={(e) => {
            e.currentTarget.poster = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>';
          }}
        />
      </div>
    </div>
  </div>
);

// Auth Editor
const AuthEditor: React.FC<{
  config: AppConfig;
  setConfig: (config: AppConfig) => void;
}> = ({ config, setConfig }) => (
  <div className="space-y-6">
    <div>
      <h2 className="text-2xl font-black text-white mb-2">Tela de Login</h2>
      <p className="text-sm text-[#94A3B8]">Logo, textos e cores da autenticação</p>
    </div>

    <div className="bg-[#0D121C] border border-[#1F2937] rounded-2xl p-6 space-y-6">
      <div>
        <label className="text-sm font-bold text-[#CBD5E1] mb-2 block">Logo URL</label>
        <input
          type="text"
          value={config.authLogo}
          onChange={(e) => setConfig({ ...config, authLogo: e.target.value })}
          className="w-full h-12 px-4 bg-[#1F2937] border border-[#374151] rounded-xl text-white outline-none focus:border-[#F20D18]"
        />
        <div className="mt-3 p-4 bg-[#1F2937] rounded-xl flex justify-center">
          <img src={config.authLogo} alt="Logo" className="max-h-24" onError={(e) => e.currentTarget.style.display = 'none'} />
        </div>
      </div>

      <div>
        <label className="text-sm font-bold text-[#CBD5E1] mb-2 block">Tagline Principal</label>
        <input
          type="text"
          value={config.authTagline}
          onChange={(e) => setConfig({ ...config, authTagline: e.target.value })}
          className="w-full h-12 px-4 bg-[#1F2937] border border-[#374151] rounded-xl text-white outline-none focus:border-[#F20D18]"
        />
      </div>

      <div>
        <label className="text-sm font-bold text-[#CBD5E1] mb-2 block">Subtítulo</label>
        <input
          type="text"
          value={config.authSubtitle}
          onChange={(e) => setConfig({ ...config, authSubtitle: e.target.value })}
          className="w-full h-12 px-4 bg-[#1F2937] border border-[#374151] rounded-xl text-white outline-none focus:border-[#F20D18]"
        />
      </div>

      <div>
        <label className="text-sm font-bold text-[#CBD5E1] mb-2 block">Cor do Botão</label>
        <div className="flex gap-3">
          <input
            type="color"
            value={config.authButtonColor}
            onChange={(e) => setConfig({ ...config, authButtonColor: e.target.value })}
            className="w-16 h-12 rounded-xl cursor-pointer"
          />
          <input
            type="text"
            value={config.authButtonColor}
            onChange={(e) => setConfig({ ...config, authButtonColor: e.target.value })}
            className="flex-1 h-12 px-4 bg-[#1F2937] border border-[#374151] rounded-xl text-white outline-none focus:border-[#F20D18]"
          />
        </div>
      </div>
    </div>
  </div>
);

// Onboarding Editor
const OnboardingEditor: React.FC<{
  config: AppConfig;
  setConfig: (config: AppConfig) => void;
}> = ({ config, setConfig }) => (
  <div className="space-y-6">
    <div>
      <h2 className="text-2xl font-black text-white mb-2">Onboarding Slides</h2>
      <p className="text-sm text-[#94A3B8]">Edite os 3 slides de boas-vindas</p>
    </div>

    {config.onboardingSlides.map((slide, index) => (
      <div key={index} className="bg-[#0D121C] border border-[#1F2937] rounded-2xl p-6 space-y-4">
        <h3 className="text-lg font-bold text-white">Slide {index + 1}</h3>
        
        <div>
          <label className="text-sm font-bold text-[#CBD5E1] mb-2 block">Título</label>
          <input
            type="text"
            value={slide.title}
            onChange={(e) => {
              const newSlides = [...config.onboardingSlides];
              newSlides[index].title = e.target.value;
              setConfig({ ...config, onboardingSlides: newSlides });
            }}
            className="w-full h-12 px-4 bg-[#1F2937] border border-[#374151] rounded-xl text-white outline-none focus:border-[#F20D18]"
          />
        </div>

        <div>
          <label className="text-sm font-bold text-[#CBD5E1] mb-2 block">Descrição</label>
          <textarea
            value={slide.description}
            onChange={(e) => {
              const newSlides = [...config.onboardingSlides];
              newSlides[index].description = e.target.value;
              setConfig({ ...config, onboardingSlides: newSlides });
            }}
            className="w-full h-24 px-4 py-3 bg-[#1F2937] border border-[#374151] rounded-xl text-white outline-none focus:border-[#F20D18] resize-none"
          />
        </div>

        <div>
          <label className="text-sm font-bold text-[#CBD5E1] mb-2 block">Imagem URL</label>
          <input
            type="text"
            value={slide.image}
            onChange={(e) => {
              const newSlides = [...config.onboardingSlides];
              newSlides[index].image = e.target.value;
              setConfig({ ...config, onboardingSlides: newSlides });
            }}
            className="w-full h-12 px-4 bg-[#1F2937] border border-[#374151] rounded-xl text-white outline-none focus:border-[#F20D18]"
          />
          <div className="mt-3 p-2 bg-[#1F2937] rounded-xl">
            <img src={slide.image} alt={slide.title} className="w-full h-32 object-cover rounded-lg" onError={(e) => e.currentTarget.style.display = 'none'} />
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Branding Editor
const BrandingEditor: React.FC<{
  config: AppConfig;
  setConfig: (config: AppConfig) => void;
}> = ({ config, setConfig }) => (
  <div className="space-y-6">
    <div>
      <h2 className="text-2xl font-black text-white mb-2">Marca & Cores</h2>
      <p className="text-sm text-[#94A3B8]">Identidade visual da plataforma</p>
    </div>

    <div className="bg-[#0D121C] border border-[#1F2937] rounded-2xl p-6 space-y-6">
      <div>
        <label className="text-sm font-bold text-[#CBD5E1] mb-2 block">Nome da Marca</label>
        <input
          type="text"
          value={config.brandName}
          onChange={(e) => setConfig({ ...config, brandName: e.target.value })}
          className="w-full h-12 px-4 bg-[#1F2937] border border-[#374151] rounded-xl text-white outline-none focus:border-[#F20D18]"
        />
      </div>

      <div>
        <label className="text-sm font-bold text-[#CBD5E1] mb-2 block">Cor Primária</label>
        <div className="flex gap-3">
          <input
            type="color"
            value={config.primaryColor}
            onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
            className="w-16 h-12 rounded-xl cursor-pointer"
          />
          <input
            type="text"
            value={config.primaryColor}
            onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
            className="flex-1 h-12 px-4 bg-[#1F2937] border border-[#374151] rounded-xl text-white outline-none focus:border-[#F20D18]"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-bold text-[#CBD5E1] mb-2 block">Cor Secundária</label>
        <div className="flex gap-3">
          <input
            type="color"
            value={config.secondaryColor}
            onChange={(e) => setConfig({ ...config, secondaryColor: e.target.value })}
            className="w-16 h-12 rounded-xl cursor-pointer"
          />
          <input
            type="text"
            value={config.secondaryColor}
            onChange={(e) => setConfig({ ...config, secondaryColor: e.target.value })}
            className="flex-1 h-12 px-4 bg-[#1F2937] border border-[#374151] rounded-xl text-white outline-none focus:border-[#F20D18]"
          />
        </div>
      </div>

      <div className="pt-4 border-t border-[#1F2937]">
        <h4 className="text-sm font-bold text-white mb-3">Preview de Cores</h4>
        <div className="grid grid-cols-2 gap-3">
          <div 
            className="h-24 rounded-xl flex items-center justify-center text-white font-bold"
            style={{ backgroundColor: config.primaryColor }}
          >
            Primária
          </div>
          <div 
            className="h-24 rounded-xl flex items-center justify-center text-white font-bold"
            style={{ backgroundColor: config.secondaryColor }}
          >
            Secundária
          </div>
        </div>
      </div>
    </div>
  </div>
);
