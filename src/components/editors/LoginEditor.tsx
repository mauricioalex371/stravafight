import React from 'react';
import { LoginPageConfig } from '../../types/visualConfig';

interface LoginEditorProps {
  config: LoginPageConfig;
  onChange: (config: LoginPageConfig) => void;
}

export const LoginEditor: React.FC<LoginEditorProps> = ({ config, onChange }) => {
  const update = (path: string, value: any) => {
    const keys = path.split('.');
    const newConfig = JSON.parse(JSON.stringify(config));
    let current: any = newConfig;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    onChange(newConfig);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-white mb-2">Tela de Login</h2>
        <p className="text-sm text-[#94A3B8]">Configure o formulário de login</p>
      </div>

      <div className="bg-[#0D121C] border border-[#1F2937] rounded-2xl p-6 space-y-4">
        <h3 className="text-lg font-bold text-white">⚙️ Em Desenvolvimento</h3>
        <p className="text-sm text-[#94A3B8]">
          Editor completo será adicionado em breve.<br/>
          Por enquanto, você pode editar o JSON diretamente.
        </p>
      </div>
    </div>
  );
};
