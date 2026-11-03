import React, { useState } from 'react';
import { Download, Share, PlusSquare, X, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#F20D18] to-[#FF3B30] text-white text-xs font-black shadow-md shadow-[#F20D18]/25 hover:brightness-110 active:scale-95 transition-all"
        title="Instalar App STRAVA FIGHT"
      >
        <Download className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Instalar App</span>
      </button>
    );
  }

  // iOS Safari flow (guided prompt)
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0D121C] border border-[#171C25] text-[#94A3B8] hover:text-white hover:border-[#F20D18] text-xs font-bold transition-all"
          title="Instalar no iPhone"
        >
          <Smartphone className="w-3.5 h-3.5 text-[#F20D18]" />
          <span className="hidden sm:inline">Instalar</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in select-none">
            <div className="w-full max-w-sm bg-[#071321] border border-[#171C25] rounded-3xl p-6 shadow-2xl relative text-left">
              <button
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-4 right-4 text-[#94A3B8] hover:text-white p-1 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-12 h-12 rounded-2xl bg-[#F20D18]/15 border border-[#F20D18]/30 flex items-center justify-center text-[#F20D18] mb-4">
                <Smartphone className="w-6 h-6" />
              </div>

              <h3 className="text-base font-black text-white">Instalar STRAVA FIGHT no iPhone</h3>
              <p className="text-xs text-[#94A3B8] mt-1 mb-4">
                Tenha a experiência completa de tela cheia sem barras do navegador.
              </p>

              <div className="space-y-3 bg-[#05070B] p-4 rounded-2xl border border-[#171C25] text-xs text-[#CBD5E1]">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#171C25] flex items-center justify-center font-bold text-[#F20D18] shrink-0 text-[11px]">
                    1
                  </div>
                  <p>Toque no ícone de <strong>Compartilhar</strong> <Share className="w-3.5 h-3.5 inline mx-1 text-white" /> na barra inferior do Safari.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#171C25] flex items-center justify-center font-bold text-[#F20D18] shrink-0 text-[11px]">
                    2
                  </div>
                  <p>Role para baixo e selecione <strong>Adicionar à Tela de Início</strong> <PlusSquare className="w-3.5 h-3.5 inline mx-1 text-white" />.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#171C25] flex items-center justify-center font-bold text-[#F20D18] shrink-0 text-[11px]">
                    3
                  </div>
                  <p>Toque em <strong>Adicionar</strong> no canto superior direito.</p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full py-2.5 rounded-xl bg-[#F20D18] text-white text-xs font-black shadow-lg shadow-[#F20D18]/30"
              >
                Entendi, Pronto!
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
