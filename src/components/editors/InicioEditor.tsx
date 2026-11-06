import React from 'react';
import { InicioPageConfig } from '../../types/visualConfig';

interface InicioEditorProps {
  config: InicioPageConfig;
  onChange: (config: InicioPageConfig) => void;
}

export const InicioEditor: React.FC<InicioEditorProps> = ({ config, onChange }) => {
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
        <h2 className="text-2xl font-black text-white mb-2">Tela de Início</h2>
        <p className="text-sm text-[#94A3B8]">Personalize a primeira tela que os usuários veem</p>
      </div>

      {/* Logo */}
      <Section title="Logo">
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
          min={100}
          max={500}
          unit="px"
        />
        <SelectField
          label="Posição"
          value={config.logo.position}
          onChange={(v) => update('logo.position', v)}
          options={[
            { value: 'left', label: 'Esquerda' },
            { value: 'center', label: 'Centro' },
            { value: 'right', label: 'Direita' }
          ]}
        />
      </Section>

      {/* Background */}
      <Section title="Fundo">
        <SelectField
          label="Tipo"
          value={config.background.type}
          onChange={(v) => update('background.type', v)}
          options={[
            { value: 'solid', label: 'Cor Sólida' },
            { value: 'gradient', label: 'Gradiente' },
            { value: 'video', label: 'Vídeo' }
          ]}
        />
        
        {config.background.type === 'solid' && (
          <ColorField
            label="Cor"
            value={config.background.color || '#0A1929'}
            onChange={(v) => update('background.color', v)}
          />
        )}
        
        {config.background.type === 'gradient' && (
          <>
            <ColorField
              label="Cor Inicial"
              value={config.background.gradient?.from || '#0D1B2A'}
              onChange={(v) => update('background.gradient.from', v)}
            />
            <ColorField
              label="Cor Final"
              value={config.background.gradient?.to || '#071321'}
              onChange={(v) => update('background.gradient.to', v)}
            />
            <InputField
              label="Direção"
              value={config.background.gradient?.direction || 'to bottom'}
              onChange={(v) => update('background.gradient.direction', v)}
              placeholder="to bottom"
            />
          </>
        )}
        
        {config.background.type === 'video' && (
          <>
            <InputField
              label="URL do Vídeo"
              value={config.background.videoUrl || ''}
              onChange={(v) => update('background.videoUrl', v)}
              placeholder="https://..."
            />
            <SliderField
              label="Opacidade"
              value={config.background.videoOpacity || 0.3}
              onChange={(v) => update('background.videoOpacity', v)}
              min={0}
              max={1}
              step={0.1}
            />
          </>
        )}
      </Section>

      {/* Title */}
      <Section title="Título Principal">
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
              min={24}
              max={72}
              unit="px"
            />
            <SliderField
              label="Peso"
              value={config.title.fontWeight}
              onChange={(v) => update('title.fontWeight', v)}
              min={400}
              max={900}
              step={100}
            />
          </>
        )}
      </Section>

      {/* Subtitle */}
      <Section title="Subtítulo">
        <ToggleField
          label="Mostrar"
          value={config.subtitle.show}
          onChange={(v) => update('subtitle.show', v)}
        />
        {config.subtitle.show && (
          <>
            <InputField
              label="Texto"
              value={config.subtitle.text}
              onChange={(v) => update('subtitle.text', v)}
            />
            <ColorField
              label="Cor"
              value={config.subtitle.color}
              onChange={(v) => update('subtitle.color', v)}
            />
            <SliderField
              label="Tamanho"
              value={config.subtitle.fontSize}
              onChange={(v) => update('subtitle.fontSize', v)}
              min={12}
              max={32}
              unit="px"
            />
          </>
        )}
      </Section>

      {/* Botão Criar Conta */}
      <Section title="Botão Criar Conta">
        <ToggleField
          label="Mostrar"
          value={config.buttons.signup.show}
          onChange={(v) => update('buttons.signup.show', v)}
        />
        {config.buttons.signup.show && (
          <>
            <InputField
              label="Texto"
              value={config.buttons.signup.text}
              onChange={(v) => update('buttons.signup.text', v)}
            />
            <ColorField
              label="Cor de Fundo"
              value={config.buttons.signup.bgColor}
              onChange={(v) => update('buttons.signup.bgColor', v)}
            />
            <ColorField
              label="Cor do Texto"
              value={config.buttons.signup.textColor}
              onChange={(v) => update('buttons.signup.textColor', v)}
            />
            <SliderField
              label="Borda Arredondada"
              value={config.buttons.signup.borderRadius}
              onChange={(v) => update('buttons.signup.borderRadius', v)}
              min={0}
              max={9999}
              unit="px"
            />
            <SliderField
              label="Padding Horizontal"
              value={config.buttons.signup.paddingX}
              onChange={(v) => update('buttons.signup.paddingX', v)}
              min={16}
              max={80}
              unit="px"
            />
            <SliderField
              label="Padding Vertical"
              value={config.buttons.signup.paddingY}
              onChange={(v) => update('buttons.signup.paddingY', v)}
              min={8}
              max={32}
              unit="px"
            />
          </>
        )}
      </Section>

      {/* Botão Login */}
      <Section title="Botão Login">
        <ToggleField
          label="Mostrar"
          value={config.buttons.login.show}
          onChange={(v) => update('buttons.login.show', v)}
        />
        {config.buttons.login.show && (
          <>
            <InputField
              label="Texto"
              value={config.buttons.login.text}
              onChange={(v) => update('buttons.login.text', v)}
            />
            <ColorField
              label="Cor de Fundo"
              value={config.buttons.login.bgColor}
              onChange={(v) => update('buttons.login.bgColor', v)}
            />
            <ColorField
              label="Cor do Texto"
              value={config.buttons.login.textColor}
              onChange={(v) => update('buttons.login.textColor', v)}
            />
          </>
        )}
      </Section>

      {/* Espaçamentos */}
      <Section title="Espaçamentos">
        <SliderField
          label="Padding Geral"
          value={config.spacing.padding}
          onChange={(v) => update('spacing.padding', v)}
          min={16}
          max={64}
          unit="px"
        />
        <SliderField
          label="Espaço entre elementos"
          value={config.spacing.gap}
          onChange={(v) => update('spacing.gap', v)}
          min={8}
          max={48}
          unit="px"
        />
      </Section>
    </div>
  );
};

// Componentes auxiliares
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
  step?: number;
  unit?: string;
}> = ({ label, value, onChange, min, max, step = 1, unit = '' }) => (
  <div>
    <div className="flex justify-between items-center mb-2">
      <label className="text-sm font-bold text-[#CBD5E1]">{label}</label>
      <span className="text-sm font-bold text-[#F20D18]">{value}{unit}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
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
