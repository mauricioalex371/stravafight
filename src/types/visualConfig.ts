/**
 * Sistema de Configuração Visual - STRAVA FIGHT
 * Permite editar qualquer elemento da tela via Admin Panel
 */

export interface VisualConfig {
  pages: {
    inicio: InicioPageConfig;
    login: LoginPageConfig;
    cadastro: CadastroPageConfig;
  };
  global: GlobalConfig;
}

// ========================================
// TELA DE INÍCIO (/inicio)
// ========================================
export interface InicioPageConfig {
  enabled: boolean;
  logo: {
    url: string;
    width: number;
    position: 'left' | 'center' | 'right';
  };
  background: {
    type: 'solid' | 'gradient' | 'video';
    color?: string;
    gradient?: {
      from: string;
      to: string;
      direction: string;
    };
    videoUrl?: string;
    videoOpacity?: number;
  };
  title: {
    text: string;
    color: string;
    fontSize: number;
    fontWeight: 400 | 500 | 600 | 700 | 800 | 900;
    show: boolean;
  };
  subtitle: {
    text: string;
    color: string;
    fontSize: number;
    show: boolean;
  };
  buttons: {
    signup: ButtonConfig;
    login: ButtonConfig;
  };
  spacing: {
    padding: number;
    gap: number;
  };
}

// ========================================
// TELA DE LOGIN (/login)
// ========================================
export interface LoginPageConfig {
  enabled: boolean;
  logo: {
    url: string;
    width: number;
    show: boolean;
  };
  background: {
    type: 'solid' | 'gradient';
    color?: string;
    gradient?: {
      from: string;
      to: string;
    };
  };
  title: {
    text: string;
    color: string;
    fontSize: number;
    show: boolean;
  };
  fields: {
    email: FieldConfig;
    password: FieldConfig;
  };
  buttons: {
    submit: ButtonConfig;
  };
  links: {
    forgotPassword: LinkConfig;
    signup: LinkConfig;
  };
  social: {
    enabled: boolean;
    dividerText: string;
    google: SocialButtonConfig;
    facebook: SocialButtonConfig;
    apple: SocialButtonConfig;
  };
}

// ========================================
// TELA DE CADASTRO (/cadastro)
// ========================================
export interface CadastroPageConfig {
  enabled: boolean;
  logo: {
    url: string;
    width: number;
    show: boolean;
  };
  background: {
    type: 'solid' | 'gradient';
    color?: string;
    gradient?: {
      from: string;
      to: string;
    };
  };
  title: {
    text: string;
    color: string;
    fontSize: number;
    show: boolean;
  };
  fields: {
    email: FieldConfig;
    password: FieldConfig;
    confirmPassword: FieldConfig;
  };
  buttons: {
    submit: ButtonConfig;
  };
  links: {
    login: LinkConfig;
    terms: LinkConfig;
  };
  social: {
    enabled: boolean;
    dividerText: string;
    google: SocialButtonConfig;
    facebook: SocialButtonConfig;
    apple: SocialButtonConfig;
  };
}

// ========================================
// CONFIGURAÇÕES GLOBAIS
// ========================================
export interface GlobalConfig {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    textMuted: string;
  };
  typography: {
    fontFamily: string;
    headingSizes: number[];
    bodySize: number;
  };
}

// ========================================
// TIPOS AUXILIARES
// ========================================
export interface ButtonConfig {
  text: string;
  bgColor: string;
  textColor: string;
  borderRadius: number;
  paddingX: number;
  paddingY: number;
  fontSize: number;
  fontWeight: 400 | 500 | 600 | 700 | 800 | 900;
  show: boolean;
}

export interface FieldConfig {
  label: string;
  placeholder: string;
  labelColor: string;
  show: boolean;
}

export interface LinkConfig {
  text: string;
  color: string;
  show: boolean;
}

export interface SocialButtonConfig {
  enabled: boolean;
  text: string;
  bgColor?: string;
  textColor?: string;
}

// ========================================
// CONFIGURAÇÃO PADRÃO
// ========================================
export const DEFAULT_VISUAL_CONFIG: VisualConfig = {
  pages: {
    inicio: {
      enabled: true,
      logo: {
        url: 'https://res.cloudinary.com/wvucafte/image/upload/f_auto/q_auto/logo_sem_fundo.png',
        width: 320,
        position: 'center'
      },
      background: {
        type: 'gradient',
        gradient: {
          from: '#0D1B2A',
          to: '#071321',
          direction: 'to bottom'
        }
      },
      title: {
        text: 'STRAVA FIGHT',
        color: '#FFFFFF',
        fontSize: 48,
        fontWeight: 900,
        show: true
      },
      subtitle: {
        text: 'Esforço que transforma. Luta que evolui.',
        color: '#90CAF9',
        fontSize: 20,
        show: true
      },
      buttons: {
        signup: {
          text: 'Criar Conta',
          bgColor: '#F20D18',
          textColor: '#FFFFFF',
          borderRadius: 9999,
          paddingX: 48,
          paddingY: 16,
          fontSize: 16,
          fontWeight: 700,
          show: true
        },
        login: {
          text: 'Já tenho conta',
          bgColor: '#1E293B',
          textColor: '#FFFFFF',
          borderRadius: 9999,
          paddingX: 48,
          paddingY: 16,
          fontSize: 16,
          fontWeight: 600,
          show: true
        }
      },
      spacing: {
        padding: 32,
        gap: 16
      }
    },
    
    login: {
      enabled: true,
      logo: {
        url: 'https://res.cloudinary.com/wvucafte/image/upload/f_auto/q_auto/logo_sem_fundo.png',
        width: 200,
        show: true
      },
      background: {
        type: 'solid',
        color: '#0A1929'
      },
      title: {
        text: 'Entrar',
        color: '#FFFFFF',
        fontSize: 32,
        show: true
      },
      fields: {
        email: {
          label: 'Email',
          placeholder: 'seu@email.com',
          labelColor: '#90CAF9',
          show: true
        },
        password: {
          label: 'Senha',
          placeholder: '••••••••',
          labelColor: '#90CAF9',
          show: true
        }
      },
      buttons: {
        submit: {
          text: 'Entrar',
          bgColor: '#F20D18',
          textColor: '#FFFFFF',
          borderRadius: 16,
          paddingX: 32,
          paddingY: 14,
          fontSize: 16,
          fontWeight: 700,
          show: true
        }
      },
      links: {
        forgotPassword: {
          text: 'Esqueci minha senha',
          color: '#42A5F5',
          show: true
        },
        signup: {
          text: 'Criar conta',
          color: '#42A5F5',
          show: true
        }
      },
      social: {
        enabled: true,
        dividerText: 'ou',
        google: {
          enabled: true,
          text: 'Continuar com Google'
        },
        facebook: {
          enabled: true,
          text: 'Continuar com Facebook'
        },
        apple: {
          enabled: true,
          text: 'Continuar com Apple'
        }
      }
    },
    
    cadastro: {
      enabled: true,
      logo: {
        url: 'https://res.cloudinary.com/wvucafte/image/upload/f_auto/q_auto/logo_sem_fundo.png',
        width: 200,
        show: true
      },
      background: {
        type: 'solid',
        color: '#0A1929'
      },
      title: {
        text: 'Criar Conta',
        color: '#FFFFFF',
        fontSize: 32,
        show: true
      },
      fields: {
        email: {
          label: 'Email',
          placeholder: 'seu@email.com',
          labelColor: '#90CAF9',
          show: true
        },
        password: {
          label: 'Senha',
          placeholder: '••••••••',
          labelColor: '#90CAF9',
          show: true
        },
        confirmPassword: {
          label: 'Confirmar Senha',
          placeholder: '••••••••',
          labelColor: '#90CAF9',
          show: true
        }
      },
      buttons: {
        submit: {
          text: 'Criar Conta',
          bgColor: '#F20D18',
          textColor: '#FFFFFF',
          borderRadius: 16,
          paddingX: 32,
          paddingY: 14,
          fontSize: 16,
          fontWeight: 700,
          show: true
        }
      },
      links: {
        login: {
          text: 'Já tenho conta',
          color: '#42A5F5',
          show: true
        },
        terms: {
          text: 'Termos de Uso e Política de Privacidade',
          color: '#64748B',
          show: true
        }
      },
      social: {
        enabled: true,
        dividerText: 'ou',
        google: {
          enabled: true,
          text: 'Continuar com Google'
        },
        facebook: {
          enabled: true,
          text: 'Continuar com Facebook'
        },
        apple: {
          enabled: true,
          text: 'Continuar com Apple'
        }
      }
    }
  },
  
  global: {
    colors: {
      primary: '#F20D18',
      secondary: '#FF4A0F',
      accent: '#42A5F5',
      background: '#0A1929',
      text: '#FFFFFF',
      textMuted: '#90CAF9'
    },
    typography: {
      fontFamily: 'Montserrat, sans-serif',
      headingSizes: [48, 32, 24, 18],
      bodySize: 14
    }
  }
};
