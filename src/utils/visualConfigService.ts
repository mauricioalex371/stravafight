/**
 * Serviço para gerenciar configurações visuais
 */

import { VisualConfig, DEFAULT_VISUAL_CONFIG } from '../types/visualConfig';

const STORAGE_KEY = 'sf_visual_config';
const DRAFT_KEY = 'sf_visual_config_draft';

export class VisualConfigService {
  /**
   * Carrega a configuração salva ou retorna a padrão
   * Se houver draft, carrega o draft
   */
  static load(): VisualConfig {
    try {
      // Primeiro tenta carregar draft (edição em andamento)
      const draft = localStorage.getItem(DRAFT_KEY);
      if (draft) {
        const config = JSON.parse(draft);
        return this.mergeWithDefaults(config);
      }
      
      // Se não houver draft, carrega a config salva
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const config = JSON.parse(saved);
        return this.mergeWithDefaults(config);
      }
    } catch (error) {
      console.error('Erro ao carregar config visual:', error);
    }
    return DEFAULT_VISUAL_CONFIG;
  }

  /**
   * Salva a configuração
   */
  static save(config: VisualConfig): void {
    try {
      // Salvar permanente
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      // Limpar draft
      localStorage.removeItem(DRAFT_KEY);
      // Disparar evento para componentes escutarem
      window.dispatchEvent(new CustomEvent('visualConfigChanged', { detail: config }));
      console.log('✅ Config salva com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar config visual:', error);
      throw error;
    }
  }

  /**
   * Reseta para configuração padrão
   */
  static reset(): void {
    this.save(DEFAULT_VISUAL_CONFIG);
  }

  /**
   * Exporta configuração como JSON
   */
  static export(): string {
    const config = this.load();
    return JSON.stringify(config, null, 2);
  }

  /**
   * Importa configuração de JSON
   */
  static import(jsonString: string): void {
    try {
      const config = JSON.parse(jsonString);
      this.save(config);
    } catch (error) {
      console.error('Erro ao importar config:', error);
      throw new Error('JSON inválido');
    }
  }

  /**
   * Merge config carregada com defaults (para novos campos)
   */
  private static mergeWithDefaults(config: Partial<VisualConfig>): VisualConfig {
    return {
      ...DEFAULT_VISUAL_CONFIG,
      ...config,
      pages: {
        ...DEFAULT_VISUAL_CONFIG.pages,
        ...config.pages
      },
      global: {
        ...DEFAULT_VISUAL_CONFIG.global,
        ...config.global
      }
    };
  }
}
