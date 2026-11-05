import React, { useState, useRef } from 'react';
import { X, Camera, Image as ImageIcon, Check, MapPin, Award, Building2 } from 'lucide-react';
import { UserProfile } from '../types';

interface EditProfileModalProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: Partial<UserProfile>) => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  user,
  isOpen,
  onClose,
  onSave
}) => {
  const [fullName, setFullName] = useState(user.fullName);
  const [bio, setBio] = useState(user.bio);
  const [location, setLocation] = useState(user.location || '');
  const [affiliatedAcademyName, setAffiliatedAcademyName] = useState(user.affiliatedAcademyName || '');
  
  // Photo upload states
  const [avatarPreview, setAvatarPreview] = useState(user.avatarUrl);
  const [coverPreview, setCoverPreview] = useState(user.coverUrl || '');
  const [showCropper, setShowCropper] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [cropType, setCropType] = useState<'avatar' | 'cover'>('avatar');
  
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleAvatarClick = () => {
    avatarInputRef.current?.click();
  };

  const handleCoverClick = () => {
    coverInputRef.current?.click();
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageToCrop(reader.result as string);
        setCropType(type);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedImage: string) => {
    if (cropType === 'avatar') {
      setAvatarPreview(croppedImage);
    } else {
      setCoverPreview(croppedImage);
    }
    setShowCropper(false);
    setImageToCrop(null);
  };

  const handleSave = () => {
    const updates: Partial<UserProfile> = {
      fullName,
      bio,
      location,
      affiliatedAcademyName,
      avatarUrl: avatarPreview,
      coverUrl: coverPreview
    };
    onSave(updates);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-[#0d121c] rounded-xl max-w-2xl w-full my-8 relative">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[#1f2736]">
            <h2 className="text-lg font-bold">Editar Perfil</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-2 hover:bg-white/5 rounded-full transition"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Cover Photo */}
            <div className="relative">
              <label className="block text-sm font-semibold mb-2">Foto de Capa</label>
              <div 
                onClick={handleCoverClick}
                className="relative h-40 bg-gradient-to-br from-[#1976D2]/20 to-[#0D1B2A] rounded-lg overflow-hidden cursor-pointer group"
                style={coverPreview ? { backgroundImage: `url(${coverPreview})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
              >
                {!coverPreview && (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400 group-hover:text-white transition">
                    <ImageIcon size={32} />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                  <div className="bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2">
                    <Camera size={18} />
                    <span className="text-sm font-semibold">Alterar capa</span>
                  </div>
                </div>
              </div>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageSelect(e, 'cover')}
              />
            </div>

            {/* Avatar Photo */}
            <div className="relative">
              <label className="block text-sm font-semibold mb-2">Foto de Perfil</label>
              <div className="flex items-center gap-4">
                <div 
                  onClick={handleAvatarClick}
                  className="relative w-24 h-24 rounded-full overflow-hidden cursor-pointer group"
                >
                  <img 
                    src={avatarPreview} 
                    alt="Avatar" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <Camera size={20} className="text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <button
                    onClick={handleAvatarClick}
                    className="px-4 py-2 bg-[#1976D2] hover:bg-[#1565C0] rounded-lg font-semibold transition"
                  >
                    Alterar foto
                  </button>
                  <p className="text-xs text-gray-400 mt-2">
                    Formatos: JPG, PNG. Máx: 5MB
                  </p>
                </div>
              </div>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageSelect(e, 'avatar')}
              />
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold mb-2">Nome Completo</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-[#0A0F1A] border border-[#1f2736] rounded-lg px-4 py-3 focus:outline-none focus:border-[#1976D2] transition"
                placeholder="Seu nome completo"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-semibold mb-2">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                maxLength={150}
                className="w-full bg-[#0A0F1A] border border-[#1f2736] rounded-lg px-4 py-3 focus:outline-none focus:border-[#1976D2] transition resize-none"
                placeholder="Conte um pouco sobre você..."
              />
              <p className="text-xs text-gray-400 mt-1 text-right">{bio.length}/150</p>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                <MapPin size={16} className="text-[#1976D2]" />
                Localização
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-[#0A0F1A] border border-[#1f2736] rounded-lg px-4 py-3 focus:outline-none focus:border-[#1976D2] transition"
                placeholder="Cidade, Estado"
              />
            </div>

            {/* Academy */}
            <div>
              <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                <Building2 size={16} className="text-[#1976D2]" />
                Academia / CT
              </label>
              <input
                type="text"
                value={affiliatedAcademyName}
                onChange={(e) => setAffiliatedAcademyName(e.target.value)}
                className="w-full bg-[#0A0F1A] border border-[#1f2736] rounded-lg px-4 py-3 focus:outline-none focus:border-[#1976D2] transition"
                placeholder="Nome da academia onde treina"
              />
              <p className="text-xs text-gray-400 mt-1">
                Ficará vinculado ao seu perfil
              </p>
            </div>

            {/* Modality & Belt (read-only display) */}
            <div className="bg-[#0A0F1A] border border-[#1f2736] rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Award size={16} className="text-[#1976D2]" />
                <span className="text-sm font-semibold">Modalidade e Graduação</span>
              </div>
              <div className="space-y-2">
                {user.modalities.map((mod, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-[#0d121c] rounded px-3 py-2">
                    <span className="text-sm">{mod.modality}</span>
                    <span className="text-xs bg-[#1976D2]/20 text-[#42A5F5] px-2 py-1 rounded">
                      {mod.belt}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Para alterar modalidades, entre em contato com o suporte
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-4 border-t border-[#1f2736]">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-[#1f2736] hover:bg-[#2a3447] rounded-lg font-semibold transition"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-[#1976D2] hover:bg-[#1565C0] rounded-lg font-semibold transition flex items-center gap-2"
            >
              <Check size={18} />
              Salvar alterações
            </button>
          </div>
        </div>
      </div>

      {/* Simple Image Cropper Modal */}
      {showCropper && imageToCrop && (
        <SimpleCropper
          image={imageToCrop}
          aspectRatio={cropType === 'avatar' ? 1 : 16 / 9}
          onComplete={handleCropComplete}
          onCancel={() => {
            setShowCropper(false);
            setImageToCrop(null);
          }}
        />
      )}
    </>
  );
};

// Simple Image Cropper Component
interface SimpleCropperProps {
  image: string;
  aspectRatio: number;
  onComplete: (croppedImage: string) => void;
  onCancel: () => void;
}

const SimpleCropper: React.FC<SimpleCropperProps> = ({
  image,
  aspectRatio,
  onComplete,
  onCancel
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scale, setScale] = useState(1);

  const handleCrop = () => {
    // Simple crop implementation - in production, use a library like react-easy-crop
    // For now, just pass the original image
    onComplete(image);
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-[110] flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Ajustar imagem</h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-white p-2 hover:bg-white/5 rounded-full transition"
          >
            <X size={20} />
          </button>
        </div>

        <div className="bg-[#0A0F1A] rounded-lg p-4 mb-4">
          <img 
            src={image} 
            alt="Preview" 
            className="max-w-full max-h-[60vh] mx-auto rounded"
            style={{ transform: `scale(${scale})` }}
          />
        </div>

        {/* Zoom control */}
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2">Zoom</label>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={scale}
            onChange={(e) => setScale(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-6 py-2 bg-[#1f2736] hover:bg-[#2a3447] rounded-lg font-semibold transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleCrop}
            className="px-6 py-2 bg-[#1976D2] hover:bg-[#1565C0] rounded-lg font-semibold transition"
          >
            Aplicar
          </button>
        </div>
      </div>
    </div>
  );
};
