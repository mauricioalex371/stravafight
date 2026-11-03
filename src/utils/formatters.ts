export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value || 0);
}

export function getCurrentMonthYear(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  return `${month}/${year}`;
}

export function getTodayDateBR(): string {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  return `${day}/${month}/${year}`;
}

export function parseDateBR(dateStr: string): Date | null {
  if (!dateStr) return null;
  const parts = dateStr.split('/');
  if (parts.length !== 3) return null;
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const year = parseInt(parts[2], 10);
  const date = new Date(year, month, day);
  return isNaN(date.getTime()) ? null : date;
}

export function calculateAge(birthDateStr: string): number | null {
  const birth = parseDateBR(birthDateStr);
  if (!birth) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export function isBirthdayThisWeek(birthDateStr: string): boolean {
  if (!birthDateStr) return false;
  const parts = birthDateStr.split('/');
  if (parts.length !== 3) return false;
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const today = new Date();
  const currentYear = today.getFullYear();
  const bdayThisYear = new Date(currentYear, month, day);
  const diffTime = bdayThisYear.getTime() - today.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays >= 0 && diffDays <= 7;
}

export function isPast7Days(dateStr?: string): boolean {
  if (!dateStr) return true;
  try {
    const backupDate = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - backupDate.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    return diffDays >= 7;
  } catch {
    return true;
  }
}

export function generateWhatsAppUrl(phone: string, text: string): string {
  const cleanPhone = phone.replace(/\D/g, '');
  const fullPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
  return `https://wa.me/${fullPhone}?text=${encodeURIComponent(text)}`;
}

export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'sf_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
}

export function timeAgo(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'recentemente';
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'agora';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d`;
    const weeks = Math.floor(days / 7);
    return `${weeks}sem`;
  } catch {
    return 'recentemente';
  }
}
