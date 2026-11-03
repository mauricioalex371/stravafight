import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RotateCcw } from 'lucide-react';
import { Logger } from '../utils/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    Logger.error('Unhandled UI exception in component tree', error, {
      componentStack: errorInfo.componentStack
    });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-[#05070B] text-white flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-[#071321] border border-[#171C25] rounded-3xl p-8 text-center space-y-4 shadow-2xl">
            <div className="w-16 h-16 rounded-3xl bg-[#F20D18]/15 border border-[#F20D18]/30 flex items-center justify-center mx-auto text-[#F20D18]">
              <AlertOctagon className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-black uppercase tracking-widest text-[#F20D18]">
                STRAVA FIGHT • TATAME SEGURO
              </span>
              <h2 className="text-xl font-black text-white">Falha Temporária na Aplicação</h2>
              <p className="text-xs text-[#94A3B8]">
                Ocorreu uma instabilidade na interface. Seus dados e treinos permanecem salvos com segurança.
              </p>
            </div>

            <button
              onClick={this.handleReset}
              className="w-full py-3 rounded-2xl bg-[#F20D18] hover:bg-[#d00a14] text-white text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-[#F20D18]/30 transition-all active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Voltar ao Tatame</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
