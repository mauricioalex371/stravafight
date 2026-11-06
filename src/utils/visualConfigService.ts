/**
 * Serviço para gerenciar configurações visuais
 */

import { VisualConfig, DEFAULT_VISUAL_CONFIG } from '../types/visualConfig';

const STORAGE_KEY = 'sf_visual_config';

export class VisualConfigService {
  /**
   * Carrega a configuração salva ou retorna a padrão
   */
  static load(): VisualConfig {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const config = JSON.parse(saved);
        // Merge com defaults para garantir que novos campos existam
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
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      // Disparar evento para componentes escutarem
      window.dispatchEvent(new CustomEvent('visualConfigChanged', { detail: config }));
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
