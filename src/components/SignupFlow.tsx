import React, { useState, useEffect } from 'react';
import { User, MapPin, Trophy, GraduationCap, Building2, Check, ArrowLeft, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { UserProfile } from '../types';
import { generateUUID } from '../utils/formatters';
import { Analytics } from '../utils/analytics';
import { StorageService } from '../services/storageService';

interface SignupFlowProps {
  onComplete: (user: UserProfile) => void;
  onBack: () => void;
}

const MODALITIES = [
  'Jiu-Jitsu',
  'Muay Thai',
  'MMA',
  'Boxe',
  'Judô',
  'Wrestling',
  'Karatê',
  'Taekwondo',
  'Kickboxing',
  'Sambo'
];

const BELTS_BY_MODALITY: Record<string, string[]> = {
  'Jiu-Jitsu': ['Branca', 'Azul', 'Roxa', 'Marrom', 'Preta'],
  'Muay Thai': ['Prajiad Branco', 'Amarelo', 'Verde', 'Azul', 'Vermelho', 'Preto'],
  'Judô': ['Branca', 'Amarela', 'Laranja', 'Verde', 'Azul', 'Marrom', 'Preta'],
  'Karatê': ['Branca', 'Amarela', 'Laranja', 'Verde', 'Azul', 'Marrom', 'Preta'],
  'Taekwondo': ['Branca', 'Amarela', 'Verde', 'Azul', 'Vermelha', 'Preta'],
  'Wrestling': ['Iniciante', 'Intermediário', 'Avançado', 'Competidor'],
  'MMA': ['Iniciante', 'Intermediário', 'Avançado', 'Profissional'],
  'Boxe': ['Iniciante', 'Intermediário', 'Avançado', 'Competidor'],
  'Kickboxing': ['Iniciante', 'Intermediário', 'Avançado', 'Competidor'],
  'Sambo': ['Iniciante', 'Intermediário', 'Avançado', 'Mestre']
};

export const SignupFlow: React.FC<SignupFlowProps> = ({ onComplete, onBack }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    location: '',
    bio: '',
    academyName: '',
    selectedModalities: [] as string[],
    modalityBelts: {} as Record<string, string>
  });

  // Username validation states
  const [usernameError, setUsernameError] = useState('');
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameValid, setUsernameValid] = useState(false);

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  // Validate username in real-time
  useEffect(() => {
    const username = formData.username.trim();

    if (username.length === 0) {
      setUsernameError('');
      setUsernameValid(false);
      return;
    }

    // Validate format
    if (username.length < 3) {
      setUsernameError('Mínimo 3 caracteres');
      setUsernameValid(false);
      return;
    }

    if (username.length > 20) {
      setUsernameError('Máximo 20 caracteres');
      setUsernameValid(false);
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setUsernameError('Apenas letras, números e _');
      setUsernameValid(false);
      return;
    }

    // Check if username is available
    setIsCheckingUsername(true);
    const timeoutId = setTimeout(() => {
      const isAvailable = StorageService.isUsernameAvailable(username);
      
      if (!isAvailable) {
        setUsernameError('Este @ já está em uso');
        setUsernameValid(false);
      } else {
        setUsernameError('');
        setUsernameValid(true);
      }
      setIsCheckingUsername(false);
    }, 500); // Debounce 500ms

    return () => clearTimeout(timeoutId);
  }, [formData.username]);

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      onBack();
    }
  };

  const handleComplete = () => {
    // Verify username one more time before creating user
    if (!StorageService.isUsernameAvailable(formData.username)) {
      alert('Este nome de usuário já está em uso. Por favor, escolha outro.');
      setStep(1);
      return;
    }

    const newUser: UserProfile = {
      id: generateUUID(),
      username: formData.username || 'novo_usuario',
      fullName: formData.fullName || 'Novo Usuário',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      coverUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1200&auto=format&fit=crop&q=80',
      bio: formData.bio || 'Guerreiro(a) do STRAVA FIGHT 🥋🔥',
      role: 'Atleta',
      location: formData.location || 'Brasil',
      modalities: formData.selectedModalities.map(modality => ({
        modality,
        belt: formData.modalityBelts[modality] || 'Iniciante'
      })),
      affiliatedAcademyName: formData.academyName || '',
      affiliatedAcademyId: '',
      isVerified: false,
      followersCount: 0,
      followingCount: 0,
      friendsCount: 0,
      postsCount: 0,
      streakDays: 0,
      totalCheckIns: 0,
      xpPoints: 0,
      beltRankSocial: 'Iniciante SF',
      badges: []
    };

    // Save user to all users list
    StorageService.addUser(newUser);

    // Track complete registration
    Analytics.trackCompleteRegistration('email');

    onComplete(newUser);
  };

  const toggleModality = (modality: string) => {
    if (formData.selectedModalities.includes(modality)) {
      setFormData({
        ...formData,
        selectedModalities: formData.selectedModalities.filter(m => m !== modality)
      });
    } else {
      setFormData({
        ...formData,
        selectedModalities: [...formData.selectedModalities, modality]
      });
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.fullName.trim().length > 0 && 
               formData.username.trim().length >= 3 && 
               usernameValid && 
               !isCheckingUsername;
      case 2:
        return formData.location.trim().length > 0;
      case 3:
        return formData.selectedModalities.length > 0;
      case 4:
        return true; // Optional step
      default:
        return false;
    }
  };

  return (
    <div className="fixed inset-0 z-[9997] bg-[#05070B] flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#05070B]/95 backdrop-blur-lg border-b border-[#1F2937]">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={handleBack}
            className="w-10 h-10 rounded-full bg-[#1F2937] flex items-center justify-center text-white active:scale-90 transition-transform"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 mx-4">
            <div className="h-1.5 bg-[#1F2937] rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#F20D18] to-[#FF4A0F] transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <span className="text-sm font-bold text-[#94A3B8]">
            {step}/{totalSteps}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 pb-32">
        <div className="max-w-md mx-auto">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#F20D18] to-[#FF4A0F] flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-black text-white mb-2">Quem é você?</h2>
                <p className="text-[#94A3B8] text-sm">Conte-nos um pouco sobre você</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-bold text-[#CBD5E1] mb-2 block">Nome Completo *</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Seu nome completo"
                    className="w-full h-14 px-4 bg-[#0D121C] border border-[#1F2937] rounded-xl text-white placeholder:text-[#475569] focus:border-[#F20D18] focus:ring-2 focus:ring-[#F20D18]/20 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-[#CBD5E1] mb-2 block">Nome de Usuário *</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B]">@</span>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                      placeholder="nomedeusuario"
                      className={`w-full h-14 pl-8 pr-12 bg-[#0D121C] border rounded-xl text-white placeholder:text-[#475569] focus:ring-2 outline-none transition-all ${
                        formData.username.length === 0 
                          ? 'border-[#1F2937] focus:border-[#F20D18] focus:ring-[#F20D18]/20' 
                          : usernameError 
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                            : usernameValid 
                              ? 'border-green-500 focus:border-green-500 focus:ring-green-500/20' 
                              : 'border-[#1F2937] focus:border-[#F20D18] focus:ring-[#F20D18]/20'
                      }`}
                    />
                    {/* Validation icon */}
                    {formData.username.length > 0 && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        {isCheckingUsername ? (
                          <div className="w-5 h-5 border-2 border-[#64748B] border-t-transparent rounded-full animate-spin" />
                        ) : usernameError ? (
                          <AlertCircle className="w-5 h-5 text-red-500" />
                        ) : usernameValid ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : null}
                      </div>
                    )}
                  </div>
                  {/* Error/Success message */}
                  {formData.username.length > 0 && (
                    <div className="mt-2">
                      {usernameError ? (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {usernameError}
                        </p>
                      ) : usernameValid ? (
                        <p className="text-xs text-green-500 flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          @{formData.username} está disponível!
                        </p>
                      ) : isCheckingUsername ? (
                        <p className="text-xs text-[#64748B]">Verificando disponibilidade...</p>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Location */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#F20D18] to-[#FF4A0F] flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-black text-white mb-2">Onde você treina?</h2>
                <p className="text-[#94A3B8] text-sm">Localização e academia</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-bold text-[#CBD5E1] mb-2 block">Localização *</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Cidade, Estado"
                    className="w-full h-14 px-4 bg-[#0D121C] border border-[#1F2937] rounded-xl text-white placeholder:text-[#475569] focus:border-[#F20D18] focus:ring-2 focus:ring-[#F20D18]/20 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-[#CBD5E1] mb-2 block">Academia (opcional)</label>
                  <input
                    type="text"
                    value={formData.academyName}
                    onChange={(e) => setFormData({ ...formData, academyName: e.target.value })}
                    placeholder="Nome da sua academia"
                    className="w-full h-14 px-4 bg-[#0D121C] border border-[#1F2937] rounded-xl text-white placeholder:text-[#475569] focus:border-[#F20D18] focus:ring-2 focus:ring-[#F20D18]/20 outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Modalities */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#F20D18] to-[#FF4A0F] flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-black text-white mb-2">O que você treina?</h2>
                <p className="text-[#94A3B8] text-sm">Selecione suas modalidades</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {MODALITIES.map((modality) => {
                  const isSelected = formData.selectedModalities.includes(modality);
                  return (
                    <button
                      key={modality}
                      onClick={() => toggleModality(modality)}
                      className={`relative h-24 rounded-2xl border-2 transition-all ${
                        isSelected
                          ? 'border-[#F20D18] bg-[#F20D18]/10'
                          : 'border-[#1F2937] bg-[#0D121C] hover:border-[#374151]'
                      }`}
                    >
                      <div className="flex flex-col items-center justify-center h-full">
                        <span className={`text-sm font-bold ${
                          isSelected ? 'text-white' : 'text-[#94A3B8]'
                        }`}>
                          {modality}
                        </span>
                      </div>
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#F20D18] flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 4: Belts/Levels */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#F20D18] to-[#FF4A0F] flex items-center justify-center mx-auto mb-4">
                  <GraduationCap className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-black text-white mb-2">Suas Graduações</h2>
                <p className="text-[#94A3B8] text-sm">Selecione sua faixa/nível em cada modalidade</p>
              </div>

              <div className="space-y-4">
                {formData.selectedModalities.map((modality) => (
                  <div key={modality}>
                    <label className="text-sm font-bold text-[#CBD5E1] mb-2 block">{modality}</label>
                    <select
                      value={formData.modalityBelts[modality] || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        modalityBelts: { ...formData.modalityBelts, [modality]: e.target.value }
                      })}
                      className="w-full h-14 px-4 bg-[#0D121C] border border-[#1F2937] rounded-xl text-white focus:border-[#F20D18] focus:ring-2 focus:ring-[#F20D18]/20 outline-none transition-all"
                    >
                      <option value="">Selecione...</option>
                      {(BELTS_BY_MODALITY[modality] || ['Iniciante', 'Intermediário', 'Avançado']).map((belt) => (
                        <option key={belt} value={belt}>{belt}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Button */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#05070B] via-[#05070B] to-transparent">
        <button
          onClick={handleNext}
          disabled={!canProceed()}
          className={`w-full py-4 rounded-2xl font-black text-base shadow-lg flex items-center justify-center gap-2 transition-all ${
            canProceed()
              ? 'bg-gradient-to-r from-[#F20D18] to-[#FF4A0F] text-white shadow-[#F20D18]/30 active:scale-95'
              : 'bg-[#1F2937] text-[#475569] cursor-not-allowed'
          }`}
        >
          <span>{step === totalSteps ? 'Finalizar' : 'Continuar'}</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
