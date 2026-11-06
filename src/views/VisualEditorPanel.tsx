import React, { useState, useEffect } from 'react';
import { 
  Save, 
  Eye, 
  Monitor, 
  Smartphone, 
  Settings,
  LogOut,
  Check,
  Download,
  Upload,
  RotateCcw,
  Palette,
  Type,
  Image as ImageIcon,
  Layout,
  Sliders
} from 'lucide-react';
import { VisualConfigService } from '../utils/visualConfigService';
import { VisualConfig } from '../types/visualConfig';
import { InicioEditor } from '../components/editors/InicioEditor';
import { LoginEditor } from '../components/editors/LoginEditor';
import { CadastroEditor } from '../components/editors/CadastroEditor';
import { InicioPreview } from '../components/previews/InicioPreview';
import { LoginPreview } from '../components/previews/LoginPreview';
import { CadastroPreview } from '../components/previews/CadastroPreview';

export const VisualEditorPanel: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [config, setConfig] = useState<VisualConfig>(VisualConfigService.load());
  const [activeTab, setActiveTab] = useState<'inicio' | 'login' | 'cadastro' | 'global'>('inicio');
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('mobile');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem('sf_admin_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginForm.username === 'stravafight' && loginForm.password === '137713') {
      setIsAuthenticated(true);
      localStorage.setItem('sf_admin_auth', 'true');
    } else {
      alert('❌ Usuário ou senha incorretos!');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('sf_admin_auth');
  };

  const handleSave = () => {
    try {
      setIsSaving(true);
      VisualConfigService.save(config);
      
      setTimeout(() => {
        setIsSaving(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        alert('✅ CONFIGURAÇÕES SALVAS!\n\nAs mudanças foram aplicadas.');
      }, 800);
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('❌ Erro ao salvar. Tente novamente.');
      setIsSaving(false);
    }
  };

  const handleExport = () => {
    const json = VisualConfigService.export();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'stravafight-config.json';
    a.click();
    setShowExportModal(false);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = event.target?.result as string;
        VisualConfigService.import(json);
        setConfig(VisualConfigService.load());
        alert('✅ Configuração importada com sucesso!');
        setShowImportModal(false);
      } catch (error) {
        alert('❌ Arquivo inválido!');
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (confirm('⚠️ Tem certeza que deseja resetar TODAS as configurações?\n\nIsso não pode ser desfeito!')) {
      VisualConfigService.reset();
      setConfig(VisualConfigService.load());
      alert('✅ Configurações resetadas para o padrão!');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-[#05070B] via-[#1F2937] to-[#0D121C] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-[#0D121C] border border-[#1F2937] rounded-3xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-[#F20D18] to-[#FF4A0F] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Settings className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-black text-white mb-2">Editor Visual</h1>
              <p className="text-sm text-[#94A3B8]">STRAVA FIGHT - Gestão Completa</p>
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

  return (
    <div className="fixed inset-0 bg-[#05070B] flex flex-col overflow-hidden">
      {/* BOTÃO SALVAR FLUTUANTE */}
      <div className="fixed bottom-6 right-6 z-[9999] flex gap-3">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-black text-base transition-all shadow-2xl ${
            saveSuccess
              ? 'bg-green-600 text-white animate-bounce'
              : isSaving
              ? 'bg-[#374151] text-[#94A3B8] cursor-wait'
              : 'bg-gradient-to-r from-[#F20D18] to-[#FF4A0F] text-white hover:scale-105 shadow-[#F20D18]/50'
          }`}
        >
          {saveSuccess ? (
            <>
              <Check className="w-6 h-6" />
              <span>Salvo!</span>
            </>
          ) : isSaving ? (
            <>
              <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
              <span>Salvando...</span>
            </>
          ) : (
            <>
              <Save className="w-6 h-6" />
              <span>SALVAR</span>
            </>
          )}
        </button>

        <button
          onClick={handleLogout}
          className="flex items-center justify-center w-14 h-14 bg-[#1F2937] text-white rounded-2xl hover:bg-[#374151] transition-all shadow-xl"
          title="Sair"
        >
          <LogOut className="w-6 h-6" />
        </button>
      </div>

      {/* Header */}
      <div className="flex-none h-20 bg-[#0D121C] border-b border-[#1F2937] flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-[#F20D18] to-[#FF4A0F] rounded-xl flex items-center justify-center">
            <Palette className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">Editor Visual</h1>
            <p className="text-xs text-[#64748B]">Personalize tudo</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowExportModal(true)}
            className="p-2 rounded-lg bg-[#1F2937] text-white hover:bg-[#374151] transition-colors"
            title="Exportar"
          >
            <Download className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="p-2 rounded-lg bg-[#1F2937] text-white hover:bg-[#374151] transition-colors"
            title="Importar"
          >
            <Upload className="w-5 h-5" />
          </button>
          <button
            onClick={handleReset}
            className="p-2 rounded-lg bg-[#1F2937] text-white hover:bg-[#374151] transition-colors"
            title="Resetar"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Tabs */}
        <div className="w-64 bg-[#0D121C] border-r border-[#1F2937] overflow-y-auto">
          <div className="p-4 space-y-2">
            <TabButton
              icon={Layout}
              label="Tela Início"
              active={activeTab === 'inicio'}
              onClick={() => setActiveTab('inicio')}
            />
            <TabButton
              icon={Type}
              label="Tela Login"
              active={activeTab === 'login'}
              onClick={() => setActiveTab('login')}
            />
            <TabButton
              icon={ImageIcon}
              label="Tela Cadastro"
              active={activeTab === 'cadastro'}
              onClick={() => setActiveTab('cadastro')}
            />
            <TabButton
              icon={Sliders}
              label="Global"
              active={activeTab === 'global'}
              onClick={() => setActiveTab('global')}
            />
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            {activeTab === 'inicio' && (
              <InicioEditor 
                config={config.pages.inicio} 
                onChange={(newConfig) => setConfig({ ...config, pages: { ...config.pages, inicio: newConfig }})}
              />
            )}
            {activeTab === 'login' && (
              <LoginEditor 
                config={config.pages.login} 
                onChange={(newConfig) => setConfig({ ...config, pages: { ...config.pages, login: newConfig }})}
              />
            )}
            {activeTab === 'cadastro' && (
              <CadastroEditor 
                config={config.pages.cadastro} 
                onChange={(newConfig) => setConfig({ ...config, pages: { ...config.pages, cadastro: newConfig }})}
              />
            )}
            {activeTab === 'global' && (
              <div className="text-white">
                <h2 className="text-2xl font-black mb-4">Configurações Globais</h2>
                <p className="text-[#94A3B8]">Em breve: cores globais, tipografia, etc.</p>
              </div>
            )}
          </div>
        </div>

        {/* Preview */}
        <div className="w-[480px] bg-[#0D121C] border-l border-[#1F2937] overflow-hidden flex flex-col">
          <div className="flex-none p-4 border-b border-[#1F2937]">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">👁️ Preview ao Vivo</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setPreviewMode('mobile')}
                  className={`p-2 rounded-lg transition-all ${
                    previewMode === 'mobile'
                      ? 'bg-[#F20D18] text-white shadow-lg shadow-[#F20D18]/50'
                      : 'bg-[#1F2937] text-[#94A3B8] hover:bg-[#374151]'
                  }`}
                  title="Mobile"
                >
                  <Smartphone className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPreviewMode('desktop')}
                  className={`p-2 rounded-lg transition-all ${
                    previewMode === 'desktop'
                      ? 'bg-[#F20D18] text-white shadow-lg shadow-[#F20D18]/50'
                      : 'bg-[#1F2937] text-[#94A3B8] hover:bg-[#374151]'
                  }`}
                  title="Desktop"
                >
                  <Monitor className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-[#0D121C] to-[#1F2937]/30">
            <div className="flex flex-col items-center justify-start gap-4">
              <div className="bg-[#1A1F2E] rounded-xl shadow-2xl border border-[#2D3748] overflow-hidden">
                {activeTab === 'inicio' && (
                  <div style={{ transform: 'scale(0.6)', transformOrigin: 'top center' }}>
                    <InicioPreview config={config.pages.inicio} scale={1} />
                  </div>
                )}
                {activeTab === 'login' && (
                  <div style={{ transform: 'scale(0.6)', transformOrigin: 'top center' }}>
                    <LoginPreview config={config.pages.login} scale={1} />
                  </div>
                )}
                {activeTab === 'cadastro' && (
                  <div style={{ transform: 'scale(0.6)', transformOrigin: 'top center' }}>
                    <CadastroPreview config={config.pages.cadastro} scale={1} />
                  </div>
                )}
                {activeTab === 'global' && (
                  <div className="text-center text-xs text-[#94A3B8] p-12 w-[225px] h-[400px] flex items-center justify-center">
                    <div>
                      <Settings className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p>Nenhum preview<br/>disponível</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="text-xs text-[#64748B] text-center">
                <p className="font-bold">Aba: {activeTab === 'inicio' ? 'Início' : activeTab === 'login' ? 'Login' : activeTab === 'cadastro' ? 'Cadastro' : 'Global'}</p>
                <p className="mt-1 opacity-60">Atualização automática</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[10000]">
          <div className="bg-[#0D121C] border border-[#1F2937] rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">Exportar Configuração</h3>
            <p className="text-sm text-[#94A3B8] mb-6">
              Baixe um arquivo JSON com todas as suas configurações visuais.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleExport}
                className="flex-1 py-3 bg-gradient-to-r from-[#F20D18] to-[#FF4A0F] text-white font-bold rounded-xl"
              >
                Baixar JSON
              </button>
              <button
                onClick={() => setShowExportModal(false)}
                className="px-6 py-3 bg-[#1F2937] text-white rounded-xl"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[10000]">
          <div className="bg-[#0D121C] border border-[#1F2937] rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">Importar Configuração</h3>
            <p className="text-sm text-[#94A3B8] mb-6">
              Selecione um arquivo JSON exportado anteriormente.
            </p>
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="w-full mb-4 text-white"
            />
            <button
              onClick={() => setShowImportModal(false)}
              className="w-full py-3 bg-[#1F2937] text-white rounded-xl"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

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
