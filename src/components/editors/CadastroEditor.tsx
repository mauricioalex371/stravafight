import React from 'react';
import { CadastroPageConfig } from '../../types/visualConfig';

interface CadastroEditorProps {
  config: CadastroPageConfig;
  onChange: (config: CadastroPageConfig) => void;
}

export const CadastroEditor: React.FC<CadastroEditorProps> = ({ config, onChange }) => {
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
        <h2 className="text-2xl font-black text-white mb-2">Tela de Cadastro</h2>
        <p className="text-sm text-[#94A3B8]">Configure o formulário de cadastro</p>
      </div>

      {/* Logo */}
      <Section title="Logo">
        <ToggleField
          label="Mostrar"
          value={config.logo.show}
          onChange={(v) => update('logo.show', v)}
        />
        {config.logo.show && (
          <>
            <InputField
              label="URL da Logo"
              value={config.logo.url}
              onChange={(v) => update('logo.url', v)}
              placeholder="https://..."
            />
            <SliderField
              label="Largura"
              value={config.logo.width}
              onChange={(v) => update('logo.width', v)}
              min={50}
              max={400}
              unit="px"
            />
          </>
        )}
      </Section>

      {/* Background */}
      <Section title="Fundo">
        <SelectField
          label="Tipo"
          value={config.background.type}
          onChange={(v) => update('background.type', v)}
          options={[
            { value: 'solid', label: 'Cor Sólida' },
            { value: 'gradient', label: 'Gradiente' }
          ]}
        />
        
        {config.background.type === 'solid' && (
          <ColorField
            label="Cor"
            value={config.background.color || '#0A1929'}
            onChange={(v) => update('background.color', v)}
          />
        )}
        
        {config.background.type === 'gradient' && config.background.gradient && (
          <>
            <ColorField
              label="Cor Inicial"
              value={config.background.gradient.from}
              onChange={(v) => update('background.gradient.from', v)}
            />
            <ColorField
              label="Cor Final"
              value={config.background.gradient.to}
              onChange={(v) => update('background.gradient.to', v)}
            />
          </>
        )}
      </Section>

      {/* Title */}
      <Section title="Título">
        <ToggleField
          label="Mostrar"
          value={config.title.show}
          onChange={(v) => update('title.show', v)}
        />
        {config.title.show && (
          <>
            <InputField
              label="Texto"
              value={config.title.text}
              onChange={(v) => update('title.text', v)}
            />
            <ColorField
              label="Cor"
              value={config.title.color}
              onChange={(v) => update('title.color', v)}
            />
            <SliderField
              label="Tamanho"
              value={config.title.fontSize}
              onChange={(v) => update('title.fontSize', v)}
              min={20}
              max={48}
              unit="px"
            />
          </>
        )}
      </Section>

      {/* Submit Button */}
      <Section title="Botão Criar Conta">
        <ToggleField
          label="Mostrar"
          value={config.buttons.submit.show}
          onChange={(v) => update('buttons.submit.show', v)}
        />
        {config.buttons.submit.show && (
          <>
            <InputField
              label="Texto"
              value={config.buttons.submit.text}
              onChange={(v) => update('buttons.submit.text', v)}
            />
            <ColorField
              label="Cor de Fundo"
              value={config.buttons.submit.bgColor}
              onChange={(v) => update('buttons.submit.bgColor', v)}
            />
            <ColorField
              label="Cor do Texto"
              value={config.buttons.submit.textColor}
              onChange={(v) => update('buttons.submit.textColor', v)}
            />
            <SliderField
              label="Borda Arredondada"
              value={config.buttons.submit.borderRadius}
              onChange={(v) => update('buttons.submit.borderRadius', v)}
              min={0}
              max={32}
              unit="px"
            />
          </>
        )}
      </Section>

      {/* Social Login */}
      <Section title="Login Social">
        <ToggleField
          label="Ativar"
          value={config.social.enabled}
          onChange={(v) => update('social.enabled', v)}
        />
        {config.social.enabled && (
          <>
            <InputField
              label="Texto Divisor"
              value={config.social.dividerText}
              onChange={(v) => update('social.dividerText', v)}
            />
            
            <div className="pt-4 space-y-3">
              <ToggleField
                label="Google"
                value={config.social.google.enabled}
                onChange={(v) => update('social.google.enabled', v)}
              />
              <ToggleField
                label="Facebook"
                value={config.social.facebook.enabled}
                onChange={(v) => update('social.facebook.enabled', v)}
              />
              <ToggleField
                label="Apple"
                value={config.social.apple.enabled}
                onChange={(v) => update('social.apple.enabled', v)}
              />
            </div>
          </>
        )}
      </Section>

      {/* Links */}
      <Section title="Links">
        <ToggleField
          label="Mostrar 'Já tenho conta'"
          value={config.links.login.show}
          onChange={(v) => update('links.login.show', v)}
        />
        {config.links.login.show && (
          <>
            <InputField
              label="Texto"
              value={config.links.login.text}
              onChange={(v) => update('links.login.text', v)}
            />
            <ColorField
              label="Cor"
              value={config.links.login.color}
              onChange={(v) => update('links.login.color', v)}
            />
          </>
        )}
      </Section>
    </div>
  );
};

// Componentes auxiliares (mesmos do LoginEditor)
const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-[#0D121C] border border-[#1F2937] rounded-2xl p-6 space-y-4">
    <h3 className="text-lg font-bold text-white">{title}</h3>
    {children}
  </div>
);

const InputField: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}> = ({ label, value, onChange, placeholder }) => (
  <div>
    <label className="text-sm font-bold text-[#CBD5E1] mb-2 block">{label}</label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full h-12 px-4 bg-[#1F2937] border border-[#374151] rounded-xl text-white outline-none focus:border-[#F20D18]"
    />
  </div>
);

const ColorField: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
}> = ({ label, value, onChange }) => (
  <div>
    <label className="text-sm font-bold text-[#CBD5E1] mb-2 block">{label}</label>
    <div className="flex gap-3">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-16 h-12 rounded-xl cursor-pointer"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 h-12 px-4 bg-[#1F2937] border border-[#374151] rounded-xl text-white outline-none focus:border-[#F20D18]"
      />
    </div>
  </div>
);

const SliderField: React.FC<{
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  unit?: string;
}> = ({ label, value, onChange, min, max, unit = '' }) => (
  <div>
    <div className="flex justify-between items-center mb-2">
      <label className="text-sm font-bold text-[#CBD5E1]">{label}</label>
      <span className="text-sm font-bold text-[#F20D18]">{value}{unit}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-2 bg-[#1F2937] rounded-lg appearance-none cursor-pointer accent-[#F20D18]"
    />
  </div>
);

const SelectField: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}> = ({ label, value, onChange, options }) => (
  <div>
    <label className="text-sm font-bold text-[#CBD5E1] mb-2 block">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-12 px-4 bg-[#1F2937] border border-[#374151] rounded-xl text-white outline-none focus:border-[#F20D18]"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

const ToggleField: React.FC<{
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}> = ({ label, value, onChange }) => (
  <div className="flex items-center justify-between">
    <label className="text-sm font-bold text-[#CBD5E1]">{label}</label>
    <button
      onClick={() => onChange(!value)}
      className={`relative w-14 h-8 rounded-full transition-colors ${
        value ? 'bg-[#F20D18]' : 'bg-[#374151]'
      }`}
    >
      <div
        className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${
          value ? 'translate-x-7' : 'translate-x-1'
        }`}
      />
    </button>
  </div>
);
