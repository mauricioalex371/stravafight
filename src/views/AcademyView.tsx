import React, { useState } from 'react';
import { 
  Users, 
  Calendar, 
  CreditCard, 
  Wallet, 
  Check, 
  X, 
  Plus, 
  Search, 
  Send, 
  Trash2, 
  Clock, 
  UserPlus, 
  UserCheck, 
  HardDrive, 
  Share2, 
  Upload, 
  Cake, 
  AlertTriangle,
  History,
  RefreshCw,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
  ChevronDown,
  Edit
} from 'lucide-react';
import { 
  Student, 
  ClassEntity, 
  AttendanceRecord, 
  MonthlyFee, 
  CashTransaction, 
  TrialStudent, 
  AcademyInfo 
} from '../types';
import { 
  formatCurrency, 
  getTodayDateBR, 
  getCurrentMonthYear, 
  generateWhatsAppUrl, 
  generateUUID, 
  calculateAge, 
  isBirthdayThisWeek, 
  isPast7Days 
} from '../utils/formatters';
import { StorageService } from '../services/storageService';

interface AcademyViewProps {
  academyInfo: AcademyInfo;
  students: Student[];
  classes: ClassEntity[];
  attendance: AttendanceRecord[];
  fees: MonthlyFee[];
  cash: CashTransaction[];
  trials: TrialStudent[];
  onSaveStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
  onSaveClass: (c: ClassEntity) => void;
  onDeleteClass: (id: string) => void;
  onRecordAttendance: (classId: string, studentId: string, date: string, status: 'PRESENTE' | 'FALTA') => void;
  onRegisterPayment: (fee: MonthlyFee, amountPaid: number, method: 'PIX' | 'DINHEIRO' | 'CARTAO' | 'OUTRO', notes?: string) => void;
  onGenerateMonthFees: () => void;
  onAddTransaction: (t: CashTransaction) => void;
  onDeleteTransaction: (id: string) => void;
  onSaveTrial: (t: TrialStudent) => void;
  onConvertTrialToStudent: (t: TrialStudent) => void;
  onDeleteTrial: (id: string) => void;
  onReloadAllData: () => void;
}

export const AcademyView: React.FC<AcademyViewProps> = ({
  academyInfo,
  students,
  classes,
  attendance,
  fees,
  cash,
  trials,
  onSaveStudent,
  onDeleteStudent,
  onSaveClass,
  onDeleteClass,
  onRecordAttendance,
  onRegisterPayment,
  onGenerateMonthFees,
  onAddTransaction,
  onDeleteTransaction,
  onSaveTrial,
  onConvertTrialToStudent,
  onDeleteTrial,
  onReloadAllData
}) => {
  const [subTab, setSubTab] = useState<'painel' | 'alunos' | 'turmas' | 'mensalidades' | 'caixa' | 'experimentais' | 'backup'>('painel');

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [studentModalityFilter, setStudentModalityFilter] = useState('TODAS');
  const [feeFilter, setFeeFilter] = useState<'TODOS' | 'ATRASADO' | 'PENDENTE' | 'PAGO'>('TODOS');
  const [cashFilter, setCashFilter] = useState<'TODOS' | 'ENTRADA' | 'SAIDA'>('TODOS');

  // Modals
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const [attendanceDate, setAttendanceDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [studentHistoryModal, setStudentHistoryModal] = useState<Student | null>(null);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [payingFee, setPayingFee] = useState<MonthlyFee | null>(null);
  const [amountPaidInput, setAmountPaidInput] = useState('');
  const [paymentMethodInput, setPaymentMethodInput] = useState<'PIX' | 'DINHEIRO' | 'CARTAO' | 'OUTRO'>('PIX');

  const [isCashModalOpen, setIsCashModalOpen] = useState(false);
  const [cashTypeInput, setCashTypeInput] = useState<'ENTRADA' | 'SAIDA'>('SAIDA');
  const [cashDescInput, setCashDescInput] = useState('');
  const [cashAmountInput, setCashAmountInput] = useState('');
  const [cashCategoryInput, setCashCategoryInput] = useState('Aluguel');

  const [isTrialModalOpen, setIsTrialModalOpen] = useState(false);
  const [trialNameInput, setTrialNameInput] = useState('');
  const [trialPhoneInput, setTrialPhoneInput] = useState('');
  const [trialModalityInput, setTrialModalityInput] = useState('Jiu-Jitsu');

  // Student Form States
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [isMinor, setIsMinor] = useState(false);
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [modality, setModality] = useState('Jiu-Jitsu');
  const [graduation, setGraduation] = useState('Faixa Branca');
  const [classId, setClassId] = useState('');
  const [monthlyFee, setMonthlyFee] = useState('140');
  const [dueDay, setDueDay] = useState('10');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'ATIVO' | 'TRANCADO' | 'CANCELADO'>('ATIVO');

  // Class Form States
  const [className, setClassName] = useState('');
  const [classModality, setClassModality] = useState('Jiu-Jitsu');
  const [classLevel, setClassLevel] = useState('Todos os Níveis');
  const [classInstructor, setClassInstructor] = useState(academyInfo.masterName);
  const [classDays, setClassDays] = useState<string[]>(['Seg', 'Qua', 'Sex']);
  const [classStartTime, setClassStartTime] = useState('19:30');
  const [classEndTime, setClassEndTime] = useState('21:00');

  // Calculations
  const currentMonthYear = getCurrentMonthYear();
  const activeStudents = students.filter((s) => s.status === 'ATIVO');
  const birthdayStudents = students.filter((s) => s.birthDate && isBirthdayThisWeek(s.birthDate));
  
  const currentMonthTransactions = cash.filter((c) => c.date.endsWith(currentMonthYear));
  const incomeThisMonth = currentMonthTransactions
    .filter((c) => c.type === 'ENTRADA')
    .reduce((acc, curr) => acc + curr.amount, 0);
  const expensesThisMonth = currentMonthTransactions
    .filter((c) => c.type === 'SAIDA')
    .reduce((acc, curr) => acc + curr.amount, 0);
  const balanceThisMonth = incomeThisMonth - expensesThisMonth;

  const overdueFees = fees.filter((f) => f.status === 'ATRASADO');
  const totalOverdue = overdueFees.reduce((acc, f) => acc + f.amount, 0);

  // Student Open Handler
  const handleOpenAddStudent = () => {
    setEditingStudent(null);
    setName('');
    setPhone('');
    setBirthDate('');
    setIsMinor(false);
    setGuardianName('');
    setGuardianPhone('');
    setModality('Jiu-Jitsu');
    setGraduation('Faixa Branca');
    setClassId(classes[0]?.id || '');
    setMonthlyFee('140');
    setDueDay('10');
    setNotes('');
    setStatus('ATIVO');
    setIsStudentModalOpen(true);
  };

  const handleOpenEditStudent = (s: Student) => {
    setEditingStudent(s);
    setName(s.name);
    setPhone(s.phone);
    setBirthDate(s.birthDate);
    setIsMinor(s.isMinor);
    setGuardianName(s.guardianName || '');
    setGuardianPhone(s.guardianPhone || '');
    setModality(s.modality);
    setGraduation(s.graduation);
    setClassId(s.classId || '');
    setMonthlyFee(s.monthlyFee.toString());
    setDueDay(s.dueDay.toString());
    setNotes(s.notes || '');
    setStatus(s.status);
    setIsStudentModalOpen(true);
  };

  const handleSaveStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const std: Student = {
      id: editingStudent ? editingStudent.id : generateUUID(),
      academyId: academyInfo.id,
      name: name.trim(),
      phone: phone.trim(),
      birthDate: birthDate.trim(),
      isMinor,
      guardianName: isMinor ? guardianName.trim() : undefined,
      guardianPhone: isMinor ? guardianPhone.trim() : undefined,
      modality,
      graduation: graduation.trim() || 'Faixa Branca',
      classId: classId || undefined,
      monthlyFee: parseFloat(monthlyFee) || 130,
      dueDay: parseInt(dueDay, 10) || 10,
      notes: notes.trim(),
      status,
      createdAt: editingStudent ? editingStudent.createdAt : Date.now()
    };

    onSaveStudent(std);
    setIsStudentModalOpen(false);
  };

  // Class Save
  const handleSaveClassSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!className.trim()) return;

    const newCls: ClassEntity = {
      id: generateUUID(),
      academyId: academyInfo.id,
      name: className.trim(),
      modality: classModality,
      level: classLevel,
      instructor: classInstructor.trim() || academyInfo.masterName,
      days: classDays.length > 0 ? classDays : ['Seg', 'Qua', 'Sex'],
      startTime: classStartTime,
      endTime: classEndTime,
      maxCapacity: 30
    };

    onSaveClass(newCls);
    setIsClassModalOpen(false);
  };

  // Payment Confirmation
  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingFee) return;
    const paidVal = parseFloat(amountPaidInput) || payingFee.amount;
    onRegisterPayment(payingFee, paidVal, paymentMethodInput);
    setIsPaymentModalOpen(false);
    setPayingFee(null);
  };

  // Cash Save
  const handleSaveCashSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(cashAmountInput);
    if (!val || val <= 0 || !cashDescInput.trim()) return;

    const newTx: CashTransaction = {
      id: generateUUID(),
      academyId: academyInfo.id,
      type: cashTypeInput,
      category: cashCategoryInput,
      description: cashDescInput.trim(),
      amount: val,
      date: getTodayDateBR(),
      paymentMethod: 'PIX',
      createdAt: Date.now()
    };

    onAddTransaction(newTx);
    setIsCashModalOpen(false);
  };

  // Trial Save
  const handleSaveTrialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trialNameInput.trim()) return;

    const trial: TrialStudent = {
      id: generateUUID(),
      academyId: academyInfo.id,
      name: trialNameInput.trim(),
      phone: trialPhoneInput.trim(),
      modality: trialModalityInput,
      scheduledDate: getTodayDateBR(),
      status: 'AGENDADA',
      createdAt: Date.now()
    };

    onSaveTrial(trial);
    setIsTrialModalOpen(false);
  };

  // Backup Export
  const handleExportBackup = () => {
    const json = StorageService.exportCompleteBackup();
    const dateStr = new Date().toISOString().split('T')[0];
    const fileName = `backup_stravafight_academy_${dateStr}.json`;
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert('Backup exportado com sucesso! Arquivo JSON gerado no seu dispositivo.');
  };

  // Backup Import (Supports both UBF Team v1 JSON and STRAVA FIGHT v2 JSON)
  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm('A restauração carregará todos os alunos, turmas, mensalidades e caixa do arquivo para a SF Academy. Deseja continuar?')) {
      return;
    }

    try {
      const text = await file.text();
      const success = StorageService.importCompleteBackup(text);
      if (success) {
        alert('Dados da academia restaurados e migrados com sucesso!');
        onReloadAllData();
      } else {
        alert('Erro: Arquivo de backup inválido ou corrompido.');
      }
    } catch {
      alert('Falha ao processar arquivo.');
    } finally {
      e.target.value = '';
    }
  };

  const activeClass = classes.find((c) => c.id === selectedClassId) || classes[0];
  const classStudents = students.filter(
    (s) => s.status === 'ATIVO' && (s.classId === activeClass?.id || s.modality === activeClass?.modality)
  );

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-20 md:pb-12 select-none">
      {/* Academy Header Banner */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-[#071321] via-[#0D121C] to-[#171C25] border border-[#F20D18]/30 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#05070B] border-2 border-[#F20D18] flex items-center justify-center p-2 shadow-glow-red">
              <ShieldCheck className="w-full h-full text-[#F20D18]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase text-[#F20D18] bg-[#F20D18]/15 px-2 py-0.5 rounded tracking-wider">
                  SF ACADEMY
                </span>
                <span className="text-[10px] text-[#94A3B8]">Módulo Integrado</span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white leading-tight mt-0.5">
                {academyInfo.name}
              </h2>
              <p className="text-xs text-[#94A3B8]">
                Responsável: <strong className="text-white">{academyInfo.masterName}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSubTab('backup')}
              className="min-h-[38px] px-3.5 rounded-xl bg-[#05070B] border border-[#171C25] text-white text-xs font-bold hover:border-[#F20D18] transition-all flex items-center gap-1.5"
            >
              <HardDrive className="w-3.5 h-3.5 text-[#F20D18]" />
              <span>Backup & Migração</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex bg-[#071321] p-1 rounded-2xl border border-[#171C25] overflow-x-auto no-scrollbar">
        {[
          { id: 'painel' as const, label: 'Painel Geral' },
          { id: 'alunos' as const, label: `Alunos (${students.length})` },
          { id: 'turmas' as const, label: `Turmas & Chamada (${classes.length})` },
          { id: 'mensalidades' as const, label: `Mensalidades (${fees.length})` },
          { id: 'caixa' as const, label: 'Livro Caixa' },
          { id: 'experimentais' as const, label: `Experimentais (${trials.length})` },
          { id: 'backup' as const, label: 'Backup JSON' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSubTab(tab.id)}
            className={`min-h-[38px] px-3.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              subTab === tab.id
                ? 'bg-[#F20D18] text-white shadow-md shadow-[#F20D18]/25'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ============================================================ */}
      {/* 1. PAINEL GERAL */}
      {/* ============================================================ */}
      {subTab === 'painel' && (
        <div className="space-y-4">
          {/* Aniversariantes da Semana (Destaque do Tatame) */}
          {birthdayStudents.length > 0 && (
            <div className="p-4 rounded-3xl bg-[#071321]/80 border border-[#F20D18]/40 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Cake className="w-4 h-4 text-[#F20D18]" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-white">
                    Aniversariantes da Semana ({birthdayStudents.length})
                  </h3>
                </div>
                <span className="text-[10px] text-[#F59E0B] font-bold bg-[#F59E0B]/10 px-2 py-0.5 rounded-full border border-[#F59E0B]/30">
                  Festa no tatame!
                </span>
              </div>

              <div className="space-y-2">
                {birthdayStudents.map((s) => (
                  <div key={s.id} className="p-3 rounded-2xl bg-[#0D121C] border border-[#171C25] flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white">{s.name}</h4>
                      <p className="text-[11px] text-[#94A3B8]">{s.birthDate} • {s.graduation} ({s.modality})</p>
                    </div>

                    {s.phone && (
                      <a
                        href={generateWhatsAppUrl(
                          s.phone,
                          `Parabéns, ${s.name}! Toda a família ${academyInfo.name} (${academyInfo.masterName}) deseja a você muita saúde, evolução e força dentro e fora dos tatames! Oss!`
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="min-h-[34px] px-3 rounded-xl bg-[#10B981] text-black font-bold text-xs flex items-center gap-1.5 active:scale-95 transition-all"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Parabenizar</span>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Monthly Finance Summary */}
          <div 
            onClick={() => setSubTab('caixa')}
            className="p-4 rounded-3xl bg-[#071321]/60 border border-[#171C25] hover:border-[#F20D18]/40 transition-all cursor-pointer shadow-sm"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-[#94A3B8] uppercase">
                Resultado Financeiro do Mês ({currentMonthYear})
              </span>
              <Wallet className="w-4 h-4 text-[#F20D18]" />
            </div>

            <div className="flex items-baseline justify-between">
              <span className={`text-2xl font-black ${balanceThisMonth >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                {formatCurrency(balanceThisMonth)}
              </span>
              <span className="text-xs text-[#94A3B8] font-bold">Ver caixa completo →</span>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-[#171C25]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#10B981]/15 text-[#10B981] flex items-center justify-center">
                  <ArrowDownLeft className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-[#94A3B8]">Entradas</p>
                  <p className="text-xs font-black text-[#10B981]">{formatCurrency(incomeThisMonth)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#EF4444]/15 text-[#EF4444] flex items-center justify-center">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-[#94A3B8]">Saídas</p>
                  <p className="text-xs font-black text-[#EF4444]">{formatCurrency(expensesThisMonth)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div 
              onClick={() => setSubTab('alunos')}
              className="p-3.5 rounded-2xl bg-[#071321]/60 border border-[#171C25] cursor-pointer hover:border-[#F20D18]/40 transition-all"
            >
              <span className="text-[10px] font-bold uppercase text-[#94A3B8]">Alunos Ativos</span>
              <p className="text-2xl font-black text-white mt-1">{activeStudents.length}</p>
              <p className="text-[10px] text-[#94A3B8] mt-0.5">Matriculados no tatame</p>
            </div>

            <div 
              onClick={() => setSubTab('mensalidades')}
              className="p-3.5 rounded-2xl bg-[#071321]/60 border border-[#171C25] cursor-pointer hover:border-[#EF4444]/40 transition-all"
            >
              <span className="text-[10px] font-bold uppercase text-[#EF4444]">Atrasadas</span>
              <p className="text-2xl font-black text-[#EF4444] mt-1">{overdueFees.length}</p>
              <p className="text-[10px] text-[#94A3B8] mt-0.5">{formatCurrency(totalOverdue)} a receber</p>
            </div>

            <div 
              onClick={() => setSubTab('turmas')}
              className="p-3.5 rounded-2xl bg-[#071321]/60 border border-[#171C25] cursor-pointer hover:border-[#F20D18]/40 transition-all"
            >
              <span className="text-[10px] font-bold uppercase text-[#94A3B8]">Turmas</span>
              <p className="text-2xl font-black text-white mt-1">{classes.length}</p>
              <p className="text-[10px] text-[#94A3B8] mt-0.5">Grade semanal ativa</p>
            </div>

            <div 
              onClick={() => setSubTab('experimentais')}
              className="p-3.5 rounded-2xl bg-[#071321]/60 border border-[#171C25] cursor-pointer hover:border-[#F20D18]/40 transition-all"
            >
              <span className="text-[10px] font-bold uppercase text-[#F59E0B]">Experimentais</span>
              <p className="text-2xl font-black text-[#F59E0B] mt-1">
                {trials.filter((t) => t.status === 'AGENDADA').length}
              </p>
              <p className="text-[10px] text-[#94A3B8] mt-0.5">Interessados agendados</p>
            </div>
          </div>

          {/* Overdue collection snippet */}
          {overdueFees.length > 0 && (
            <div className="p-4 rounded-3xl bg-[#071321]/80 border border-[#EF4444]/40">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#EF4444]" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-white">
                    Cobrança Rápida pelo WhatsApp ({overdueFees.length})
                  </h3>
                </div>
                <button onClick={() => setSubTab('mensalidades')} className="text-xs text-[#EF4444] font-bold">
                  Ver todas
                </button>
              </div>

              <div className="space-y-2">
                {overdueFees.slice(0, 3).map((fee) => {
                  const student = students.find((s) => s.id === fee.studentId);
                  return (
                    <div key={fee.id} className="p-3 rounded-2xl bg-[#0D121C] border border-[#171C25] flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-white">{fee.studentName}</h4>
                        <p className="text-[11px] text-[#EF4444]">
                          Venceu em {fee.dueDate} • {formatCurrency(fee.amount)}
                        </p>
                      </div>

                      {student?.phone && (
                        <a
                          href={generateWhatsAppUrl(
                            student.phone,
                            `Olá ${student.name}! Mensagem da academia ${academyInfo.name}: sua mensalidade de ${formatCurrency(fee.amount)} com vencimento em ${fee.dueDate} está pendente. Para sua comodidade, chave Pix: ${academyInfo.phone} (${academyInfo.name}). Qualquer dúvida estamos à disposição! Oss!`
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="min-h-[34px] px-3 rounded-xl bg-[#EF4444]/20 border border-[#EF4444]/50 text-[#EF4444] font-bold text-xs flex items-center gap-1.5 active:scale-95"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Cobrar</span>
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* 2. ALUNOS */}
      {/* ============================================================ */}
      {subTab === 'alunos' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Gestão de Alunos</h3>
              <p className="text-xs text-[#94A3B8]">{students.length} cadastrados</p>
            </div>
            <button
              onClick={handleOpenAddStudent}
              className="min-h-[42px] px-4 rounded-xl bg-[#F20D18] text-white font-bold text-xs flex items-center gap-1.5 hover:bg-[#d90812] active:scale-95 shadow-md shadow-[#F20D18]/25"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Aluno</span>
            </button>
          </div>

          {/* Search & Filter */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nome, telefone ou faixa..."
              className="w-full min-h-[42px] pl-10 pr-4 rounded-xl bg-[#071321] border border-[#171C25] text-white text-xs placeholder:text-[#64748B] focus:border-[#F20D18] focus:outline-none"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1">
            {['TODAS', 'Jiu-Jitsu', 'Muay Thai', 'MMA', 'Boxe'].map((m) => (
              <button
                key={m}
                onClick={() => setStudentModalityFilter(m)}
                className={`min-h-[32px] px-3 rounded-lg text-xs font-bold transition-all ${
                  studentModalityFilter === m ? 'bg-[#F20D18] text-white' : 'bg-[#071321] text-[#94A3B8] border border-[#171C25]'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          {/* Students List */}
          <div className="space-y-2.5">
            {students
              .filter((s) => {
                const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.phone.includes(searchQuery);
                const matchesModality = studentModalityFilter === 'TODAS' || s.modality.toLowerCase() === studentModalityFilter.toLowerCase();
                return matchesSearch && matchesModality;
              })
              .map((student) => {
                const age = calculateAge(student.birthDate);
                const targetClass = classes.find((c) => c.id === student.classId);
                return (
                  <div key={student.id} className="p-3.5 rounded-2xl bg-[#071321]/60 border border-[#171C25] flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-white">{student.name}</h4>
                        <span className={`text-[9px] font-black px-1.5 py-0.2 rounded ${
                          student.status === 'ATIVO' ? 'bg-[#10B981]/20 text-[#10B981]' : 'bg-[#64748B]/20 text-[#94A3B8]'
                        }`}>
                          {student.status}
                        </span>
                      </div>
                      <p className="text-xs text-[#F20D18] font-bold mt-0.5">
                        {student.graduation} • {student.modality}
                      </p>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-[#94A3B8] mt-1">
                        <span>Vencimento: dia {student.dueDay}</span>
                        <span>Mensalidade: {formatCurrency(student.monthlyFee)}</span>
                        {targetClass && <span>Turma: {targetClass.name}</span>}
                        {student.birthDate && <span>Nasc: {student.birthDate} {age ? `(${age} anos)` : ''}</span>}
                      </div>

                      {student.isMinor && student.guardianName && (
                        <p className="text-[10px] text-[#F59E0B] mt-1 bg-[#F59E0B]/10 p-1 rounded inline-block">
                          Menor de idade • Resp: {student.guardianName} ({student.guardianPhone || 's/ tel'})
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {student.phone && (
                        <a
                          href={generateWhatsAppUrl(
                            student.phone,
                            `Olá ${student.name}! Mensagem da academia ${academyInfo.name} (${academyInfo.masterName}). Tudo pronto para o treino? Oss!`
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-9 h-9 rounded-xl bg-[#10B981]/15 text-[#10B981] flex items-center justify-center hover:bg-[#10B981]/30 transition-colors"
                          title="WhatsApp"
                        >
                          <Send className="w-4 h-4" />
                        </a>
                      )}
                      <button
                        onClick={() => handleOpenEditStudent(student)}
                        className="w-9 h-9 rounded-xl bg-[#05070B] border border-[#171C25] text-[#94A3B8] hover:text-white flex items-center justify-center"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 3. TURMAS & CHAMADA 1-TOQUE */}
      {/* ============================================================ */}
      {subTab === 'turmas' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-white uppercase tracking-wider">Turmas & Chamada Rápida</h3>
            <button
              onClick={() => {
                setClassName('');
                setIsClassModalOpen(true);
              }}
              className="min-h-[40px] px-3.5 rounded-xl bg-[#F20D18] text-white font-bold text-xs flex items-center gap-1.5 hover:bg-[#d90812]"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Turma</span>
            </button>
          </div>

          {/* Select Turma and Date */}
          <div className="p-4 rounded-3xl bg-[#071321]/60 border border-[#171C25] grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-[#94A3B8] uppercase mb-1">Selecionar Turma</label>
              <select
                value={activeClass?.id || ''}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full min-h-[42px] px-3 rounded-xl bg-[#05070B] border border-[#171C25] text-white text-xs font-bold focus:border-[#F20D18] focus:outline-none"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.days.join(', ')} {c.startTime})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#94A3B8] uppercase mb-1">Data da Chamada</label>
              <input
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                className="w-full min-h-[42px] px-3 rounded-xl bg-[#05070B] border border-[#171C25] text-white text-xs focus:border-[#F20D18] focus:outline-none"
              />
            </div>
          </div>

          {/* 1-Touch Attendance List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <h4 className="text-xs font-bold text-[#94A3B8] uppercase">
                Alunos da Turma ({classStudents.length})
              </h4>
              <span className="text-[10px] text-[#F20D18] font-bold">1 toque para registrar presença ou falta</span>
            </div>

            {classStudents.map((student) => {
              const currentRecord = attendance.find(
                (a) => a.classId === activeClass?.id && a.studentId === student.id && a.date === attendanceDate
              );
              const isPresent = currentRecord?.status === 'PRESENTE';
              const isAbsent = currentRecord?.status === 'FALTA';
              const totalPresents = attendance.filter((a) => a.studentId === student.id && a.status === 'PRESENTE').length;

              return (
                <div 
                  key={student.id}
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-2 ${
                    isPresent
                      ? 'bg-[#10B981]/10 border-[#10B981]/50'
                      : isAbsent
                      ? 'bg-[#EF4444]/10 border-[#EF4444]/50'
                      : 'bg-[#071321]/40 border-[#171C25]'
                  }`}
                >
                  <div>
                    <h5 className="text-xs font-bold text-white">{student.name}</h5>
                    <p className="text-[11px] text-[#94A3B8]">
                      {student.graduation} • {totalPresents} presenças no histórico
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setStudentHistoryModal(student)}
                      className="w-9 h-9 rounded-xl border border-[#171C25] text-[#94A3B8] hover:text-white flex items-center justify-center"
                      title="Histórico de Aulas"
                    >
                      <History className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onRecordAttendance(activeClass.id, student.id, attendanceDate, 'FALTA')}
                      className={`min-h-[38px] px-3 rounded-xl text-xs font-bold transition-all ${
                        isAbsent ? 'bg-[#EF4444] text-white' : 'bg-[#05070B] text-[#94A3B8] border border-[#171C25] hover:text-[#EF4444]'
                      }`}
                    >
                      Falta
                    </button>
                    <button
                      onClick={() => onRecordAttendance(activeClass.id, student.id, attendanceDate, 'PRESENTE')}
                      className={`min-h-[38px] px-3.5 rounded-xl text-xs font-bold transition-all ${
                        isPresent ? 'bg-[#10B981] text-black font-black' : 'bg-[#05070B] text-[#94A3B8] border border-[#171C25] hover:text-[#10B981]'
                      }`}
                    >
                      Presente
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 4. MENSALIDADES */}
      {/* ============================================================ */}
      {subTab === 'mensalidades' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Mensalidades</h3>
              <p className="text-xs text-[#94A3B8]">Controle de cobranças e pagamentos</p>
            </div>
            <button
              onClick={onGenerateMonthFees}
              className="min-h-[40px] px-3.5 rounded-xl bg-[#071321] border border-[#171C25] text-white font-bold text-xs flex items-center gap-1.5 hover:border-[#F20D18]"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#F20D18]" />
              <span>Gerar Mês ({currentMonthYear})</span>
            </button>
          </div>

          {/* Filter Chips */}
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1">
            {[
              { id: 'TODOS' as const, label: `Todas (${fees.length})` },
              { id: 'ATRASADO' as const, label: `Atrasadas (${fees.filter((f) => f.status === 'ATRASADO').length})` },
              { id: 'PENDENTE' as const, label: `A Vencer (${fees.filter((f) => f.status === 'PENDENTE').length})` },
              { id: 'PAGO' as const, label: `Pagas (${fees.filter((f) => f.status === 'PAGO').length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFeeFilter(tab.id)}
                className={`min-h-[34px] px-3.5 rounded-xl text-xs font-bold transition-all ${
                  feeFilter === tab.id ? 'bg-[#F20D18] text-white' : 'bg-[#071321] text-[#94A3B8] border border-[#171C25]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Fees list */}
          <div className="space-y-2.5">
            {fees
              .filter((f) => feeFilter === 'TODOS' || f.status === feeFilter)
              .map((fee) => {
                const student = students.find((s) => s.id === fee.studentId);
                const isPaid = fee.status === 'PAGO';
                return (
                  <div key={fee.id} className="p-3.5 rounded-2xl bg-[#071321]/60 border border-[#171C25] flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-white">{fee.studentName}</h4>
                        <span className={`text-[9px] font-black px-1.5 py-0.2 rounded ${
                          isPaid ? 'bg-[#10B981]/20 text-[#10B981]' : fee.status === 'ATRASADO' ? 'bg-[#EF4444]/20 text-[#EF4444]' : 'bg-[#F59E0B]/20 text-[#F59E0B]'
                        }`}>
                          {fee.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#94A3B8] mt-0.5">
                        Mês: {fee.monthYear} • Vencimento: {fee.dueDate}
                      </p>
                      <p className="text-sm font-black text-white mt-1">
                        {formatCurrency(fee.amount)}
                        {isPaid && fee.paymentMethod && (
                          <span className="text-[11px] text-[#10B981] font-bold ml-2">
                            (Pago via {fee.paymentMethod} em {fee.paidDate})
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {student?.phone && (
                        <a
                          href={generateWhatsAppUrl(
                            student.phone,
                            isPaid
                              ? `Olá ${student.name}! Confirmamos o recebimento da mensalidade de ${fee.monthYear} no valor de ${formatCurrency(fee.amountPaid)}. Agradecemos pela pontualidade na ${academyInfo.name}! Oss!`
                              : `Olá ${student.name}! Mensagem da academia ${academyInfo.name}: sua mensalidade de ${formatCurrency(fee.amount)} referente a ${fee.monthYear} vence em ${fee.dueDate}. Chave Pix: ${academyInfo.phone} (${academyInfo.name}). Qualquer dúvida estamos à disposição! Oss!`
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-9 h-9 rounded-xl bg-[#10B981]/15 text-[#10B981] flex items-center justify-center hover:bg-[#10B981]/30 transition-colors"
                          title="Cobrar via WhatsApp"
                        >
                          <Send className="w-4 h-4" />
                        </a>
                      )}

                      {!isPaid && (
                        <button
                          onClick={() => {
                            setPayingFee(fee);
                            setAmountPaidInput(fee.amount.toString());
                            setIsPaymentModalOpen(true);
                          }}
                          className="min-h-[36px] px-3.5 rounded-xl bg-[#F20D18] text-white font-bold text-xs hover:bg-[#d90812] active:scale-95"
                        >
                          Receber
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 5. LIVRO CAIXA */}
      {/* ============================================================ */}
      {subTab === 'caixa' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Livro Caixa da Academia</h3>
              <p className="text-xs text-[#94A3B8]">Entradas de mensalidades e saídas operacionais</p>
            </div>
            <button
              onClick={() => {
                setCashTypeInput('SAIDA');
                setCashDescInput('');
                setCashAmountInput('');
                setIsCashModalOpen(true);
              }}
              className="min-h-[40px] px-3.5 rounded-xl bg-[#F20D18] text-white font-bold text-xs flex items-center gap-1.5 hover:bg-[#d90812]"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Lançamento</span>
            </button>
          </div>

          {/* Balance card */}
          <div className="p-4 rounded-3xl bg-[#071321]/60 border border-[#171C25]">
            <span className="text-[10px] font-bold uppercase text-[#94A3B8]">Saldo Líquido do Mês ({currentMonthYear})</span>
            <p className={`text-2xl font-black mt-0.5 ${balanceThisMonth >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
              {formatCurrency(balanceThisMonth)}
            </p>
          </div>

          {/* Transactions list */}
          <div className="space-y-2">
            {cash.map((tx) => (
              <div key={tx.id} className="p-3.5 rounded-2xl bg-[#071321]/60 border border-[#171C25] flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    tx.type === 'ENTRADA' ? 'bg-[#10B981]/15 text-[#10B981]' : 'bg-[#EF4444]/15 text-[#EF4444]'
                  }`}>
                    {tx.type === 'ENTRADA' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">{tx.description}</h5>
                    <p className="text-[10px] text-[#94A3B8]">{tx.category} • {tx.date} • {tx.paymentMethod}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-xs font-black ${tx.type === 'ENTRADA' ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                    {tx.type === 'ENTRADA' ? '+' : '-'} {formatCurrency(tx.amount)}
                  </span>
                  <button
                    onClick={() => {
                      if (confirm(`Deseja excluir "${tx.description}"?`)) onDeleteTransaction(tx.id);
                    }}
                    className="text-[#64748B] hover:text-[#EF4444] p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 6. EXPERIMENTAIS */}
      {/* ============================================================ */}
      {subTab === 'experimentais' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Aulas Experimentais</h3>
              <p className="text-xs text-[#94A3B8]">Acompanhamento de novos alunos e matrículas</p>
            </div>
            <button
              onClick={() => {
                setTrialNameInput('');
                setTrialPhoneInput('');
                setIsTrialModalOpen(true);
              }}
              className="min-h-[40px] px-3.5 rounded-xl bg-[#F20D18] text-white font-bold text-xs flex items-center gap-1.5 hover:bg-[#d90812]"
            >
              <Plus className="w-4 h-4" />
              <span>Agendar Experimental</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {trials.map((trial) => (
              <div key={trial.id} className="p-3.5 rounded-2xl bg-[#071321]/60 border border-[#171C25] flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-white">{trial.name}</h4>
                    <span className={`text-[9px] font-black px-1.5 py-0.2 rounded ${
                      trial.status === 'CONVERTIDA' ? 'bg-[#10B981]/20 text-[#10B981]' : 'bg-[#F59E0B]/20 text-[#F59E0B]'
                    }`}>
                      {trial.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#94A3B8] mt-0.5">
                    {trial.modality} • Data: {trial.scheduledDate} • {trial.phone}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {trial.status !== 'CONVERTIDA' && (
                    <button
                      onClick={() => onConvertTrialToStudent(trial)}
                      className="min-h-[34px] px-3 rounded-xl bg-[#F20D18] text-white font-bold text-xs hover:bg-[#d90812] active:scale-95"
                    >
                      Matricular Aluno
                    </button>
                  )}
                  <button onClick={() => onDeleteTrial(trial.id)} className="text-[#64748B] hover:text-[#EF4444] p-1">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 7. BACKUP & MIGRAÇÃO */}
      {/* ============================================================ */}
      {subTab === 'backup' && (
        <div className="space-y-4">
          <div className="p-4 rounded-3xl bg-[#071321]/60 border border-[#171C25]">
            <h3 className="text-sm font-black text-white uppercase tracking-wider mb-1">
              Segurança, Backup e Migração
            </h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Exportação e importação de segurança em formato JSON. Totalmente compatível com arquivos exportados pelo sistema anterior UBF Team e pela STRAVA FIGHT.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              <button
                onClick={handleExportBackup}
                className="min-h-[44px] px-4 rounded-2xl bg-[#F20D18] text-white font-black text-xs flex items-center justify-center gap-2 hover:bg-[#d90812] active:scale-95 shadow-md shadow-[#F20D18]/25"
              >
                <Share2 className="w-4 h-4" />
                <span>Exportar Backup (Salvar JSON)</span>
              </button>

              <label className="min-h-[44px] px-4 rounded-2xl bg-[#05070B] border border-[#171C25] text-white font-bold text-xs flex items-center justify-center gap-2 hover:border-[#F20D18] cursor-pointer">
                <Upload className="w-4 h-4 text-[#94A3B8]" />
                <span>Importar / Restaurar Backup</span>
                <input type="file" accept=".json,application/json" onChange={handleImportBackup} className="hidden" />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: NOVO ALUNO */}
      {isStudentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in select-none">
          <div className="w-full max-w-md bg-[#0D121C] border border-[#171C25] rounded-3xl p-5 shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b border-[#171C25] mb-4">
              <h3 className="text-base font-black text-white">
                {editingStudent ? 'Editar Aluno' : 'Cadastrar Novo Aluno'}
              </h3>
              <button onClick={() => setIsStudentModalOpen(false)} className="text-[#94A3B8] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudentSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#CBD5E1] mb-1">Nome Completo *</label>
                <input 
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full min-h-[40px] px-3.5 rounded-xl bg-[#05070B] border border-[#171C25] text-white text-xs focus:border-[#F20D18] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-[#CBD5E1] mb-1">WhatsApp</label>
                  <input 
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="11988887777"
                    className="w-full min-h-[40px] px-3 rounded-xl bg-[#05070B] border border-[#171C25] text-white text-xs focus:border-[#F20D18] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#CBD5E1] mb-1">Nascimento</label>
                  <input 
                    type="text"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    placeholder="dd/mm/aaaa"
                    className="w-full min-h-[40px] px-3 rounded-xl bg-[#05070B] border border-[#171C25] text-white text-xs focus:border-[#F20D18] focus:outline-none"
                  />
                </div>
              </div>

              {/* Menor de idade */}
              <div className="p-3 rounded-2xl bg-[#05070B] border border-[#171C25]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={isMinor}
                    onChange={(e) => setIsMinor(e.target.checked)}
                    className="w-4 h-4 accent-[#F20D18] rounded"
                  />
                  <span className="text-xs font-bold text-white">Aluno Menor de Idade (Proteção Legal)</span>
                </label>
                {isMinor && (
                  <div className="mt-3 space-y-2 pt-2 border-t border-[#171C25]">
                    <div>
                      <label className="block text-[11px] text-[#94A3B8] mb-1">Nome do Responsável *</label>
                      <input 
                        type="text"
                        value={guardianName}
                        onChange={(e) => setGuardianName(e.target.value)}
                        placeholder="Pai, mãe ou responsável legal"
                        className="w-full min-h-[38px] px-3 rounded-lg bg-[#0D121C] border border-[#171C25] text-white text-xs focus:border-[#F20D18] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-[#94A3B8] mb-1">Telefone do Responsável</label>
                      <input 
                        type="tel"
                        value={guardianPhone}
                        onChange={(e) => setGuardianPhone(e.target.value)}
                        placeholder="WhatsApp do responsável"
                        className="w-full min-h-[38px] px-3 rounded-lg bg-[#0D121C] border border-[#171C25] text-white text-xs focus:border-[#F20D18] focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-[#CBD5E1] mb-1">Modalidade</label>
                  <select
                    value={modality}
                    onChange={(e) => setModality(e.target.value)}
                    className="w-full min-h-[40px] px-3 rounded-xl bg-[#05070B] border border-[#171C25] text-white text-xs focus:border-[#F20D18] focus:outline-none"
                  >
                    <option value="Jiu-Jitsu">Jiu-Jitsu</option>
                    <option value="Muay Thai">Muay Thai</option>
                    <option value="MMA">MMA</option>
                    <option value="Boxe">Boxe</option>
                    <option value="Judô">Judô</option>
                    <option value="Wrestling">Wrestling</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#CBD5E1] mb-1">Graduação / Faixa</label>
                  <input 
                    type="text"
                    value={graduation}
                    onChange={(e) => setGraduation(e.target.value)}
                    placeholder="Ex: Faixa Azul"
                    className="w-full min-h-[40px] px-3 rounded-xl bg-[#05070B] border border-[#171C25] text-white text-xs focus:border-[#F20D18] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-[#CBD5E1] mb-1">Mensalidade (R$)</label>
                  <input 
                    type="number"
                    value={monthlyFee}
                    onChange={(e) => setMonthlyFee(e.target.value)}
                    className="w-full min-h-[40px] px-3 rounded-xl bg-[#05070B] border border-[#171C25] text-white text-xs focus:border-[#F20D18] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#CBD5E1] mb-1">Dia Vencimento (1-31)</label>
                  <input 
                    type="number"
                    min="1"
                    max="31"
                    value={dueDay}
                    onChange={(e) => setDueDay(e.target.value)}
                    className="w-full min-h-[40px] px-3 rounded-xl bg-[#05070B] border border-[#171C25] text-white text-xs focus:border-[#F20D18] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                {editingStudent && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Excluir aluno ${editingStudent.name}?`)) {
                        onDeleteStudent(editingStudent.id);
                        setIsStudentModalOpen(false);
                      }
                    }}
                    className="min-h-[44px] px-4 rounded-xl border border-[#EF4444]/40 text-[#EF4444] text-xs font-bold"
                  >
                    Excluir
                  </button>
                )}
                <button
                  type="submit"
                  className="flex-1 min-h-[44px] rounded-xl bg-[#F20D18] text-white font-black text-xs flex items-center justify-center gap-1.5 hover:bg-[#d90812]"
                >
                  <Check className="w-4 h-4" />
                  <span>Salvar Aluno</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NOVA TURMA */}
      {isClassModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in select-none">
          <div className="w-full max-w-md bg-[#0D121C] border border-[#171C25] rounded-3xl p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#171C25] mb-4">
              <h3 className="text-base font-black text-white">Cadastrar Turma</h3>
              <button onClick={() => setIsClassModalOpen(false)} className="text-[#94A3B8] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveClassSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#CBD5E1] mb-1">Nome da Turma *</label>
                <input 
                  type="text"
                  required
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  placeholder="Ex: Jiu-Jitsu Avançado Noite"
                  className="w-full min-h-[40px] px-3.5 rounded-xl bg-[#05070B] border border-[#171C25] text-white text-xs focus:border-[#F20D18] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-[#CBD5E1] mb-1">Modalidade</label>
                  <select
                    value={classModality}
                    onChange={(e) => setClassModality(e.target.value)}
                    className="w-full min-h-[40px] px-3 rounded-xl bg-[#05070B] border border-[#171C25] text-white text-xs focus:border-[#F20D18] focus:outline-none"
                  >
                    <option value="Jiu-Jitsu">Jiu-Jitsu</option>
                    <option value="Muay Thai">Muay Thai</option>
                    <option value="MMA">MMA</option>
                    <option value="Boxe">Boxe</option>
                    <option value="Judô">Judô</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#CBD5E1] mb-1">Professor</label>
                  <input 
                    type="text"
                    value={classInstructor}
                    onChange={(e) => setClassInstructor(e.target.value)}
                    className="w-full min-h-[40px] px-3 rounded-xl bg-[#05070B] border border-[#171C25] text-white text-xs focus:border-[#F20D18] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-[#CBD5E1] mb-1">Início</label>
                  <input 
                    type="time"
                    value={classStartTime}
                    onChange={(e) => setClassStartTime(e.target.value)}
                    className="w-full min-h-[40px] px-3 rounded-xl bg-[#05070B] border border-[#171C25] text-white text-xs focus:border-[#F20D18] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#CBD5E1] mb-1">Término</label>
                  <input 
                    type="time"
                    value={classEndTime}
                    onChange={(e) => setClassEndTime(e.target.value)}
                    className="w-full min-h-[40px] px-3 rounded-xl bg-[#05070B] border border-[#171C25] text-white text-xs focus:border-[#F20D18] focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full min-h-[44px] rounded-xl bg-[#F20D18] text-white font-black text-xs flex items-center justify-center gap-1.5 hover:bg-[#d90812] mt-4"
              >
                <Check className="w-4 h-4" />
                <span>Salvar Turma</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REGISTRAR PAGAMENTO */}
      {isPaymentModalOpen && payingFee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in select-none">
          <div className="w-full max-w-md bg-[#0D121C] border border-[#171C25] rounded-3xl p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#171C25] mb-4">
              <div>
                <h3 className="text-base font-black text-white">Receber Mensalidade</h3>
                <p className="text-xs text-[#F20D18]">{payingFee.studentName} • Ref: {payingFee.monthYear}</p>
              </div>
              <button onClick={() => setIsPaymentModalOpen(false)} className="text-[#94A3B8] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#CBD5E1] mb-1">Valor Recebido (R$) *</label>
                <input 
                  type="number"
                  step="0.01"
                  required
                  value={amountPaidInput}
                  onChange={(e) => setAmountPaidInput(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#05070B] border border-[#171C25] text-white text-base font-black focus:border-[#F20D18] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#CBD5E1] mb-1.5">Forma de Pagamento</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['PIX', 'DINHEIRO', 'CARTAO', 'OUTRO'] as const).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethodInput(method)}
                      className={`min-h-[40px] rounded-xl text-xs font-bold transition-all ${
                        paymentMethodInput === method ? 'bg-[#F20D18] text-white shadow-md' : 'bg-[#05070B] text-[#94A3B8] border border-[#171C25]'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                Ao confirmar, este valor é automaticamente lançado no Livro Caixa como Receita sem duplicidade.
              </p>

              <button
                type="submit"
                className="w-full min-h-[46px] rounded-xl bg-[#10B981] text-black font-black text-xs flex items-center justify-center gap-1.5 active:scale-95 shadow-md shadow-[#10B981]/25 mt-3"
              >
                <Check className="w-4 h-4" />
                <span>Confirmar Recebimento</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NOVO LANÇAMENTO CAIXA */}
      {isCashModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in select-none">
          <div className="w-full max-w-md bg-[#0D121C] border border-[#171C25] rounded-3xl p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#171C25] mb-4">
              <h3 className="text-base font-black text-white">Lançamento no Caixa</h3>
              <button onClick={() => setIsCashModalOpen(false)} className="text-[#94A3B8] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCashSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCashTypeInput('SAIDA')}
                  className={`min-h-[40px] rounded-xl text-xs font-bold transition-all ${
                    cashTypeInput === 'SAIDA' ? 'bg-[#EF4444] text-white shadow-md' : 'bg-[#05070B] text-[#94A3B8] border border-[#171C25]'
                  }`}
                >
                  Despesa (Saída)
                </button>
                <button
                  type="button"
                  onClick={() => setCashTypeInput('ENTRADA')}
                  className={`min-h-[40px] rounded-xl text-xs font-bold transition-all ${
                    cashTypeInput === 'ENTRADA' ? 'bg-[#10B981] text-black shadow-md' : 'bg-[#05070B] text-[#94A3B8] border border-[#171C25]'
                  }`}
                >
                  Receita (Entrada)
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#CBD5E1] mb-1">Descrição *</label>
                <input 
                  type="text"
                  required
                  value={cashDescInput}
                  onChange={(e) => setCashDescInput(e.target.value)}
                  placeholder="Ex: Aluguel galpão ou Venda Kimono"
                  className="w-full min-h-[40px] px-3.5 rounded-xl bg-[#05070B] border border-[#171C25] text-white text-xs focus:border-[#F20D18] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#CBD5E1] mb-1">Valor (R$) *</label>
                <input 
                  type="number"
                  step="0.01"
                  required
                  value={cashAmountInput}
                  onChange={(e) => setCashAmountInput(e.target.value)}
                  placeholder="0,00"
                  className="w-full min-h-[40px] px-3.5 rounded-xl bg-[#05070B] border border-[#171C25] text-white text-xs font-black focus:border-[#F20D18] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#CBD5E1] mb-1">Categoria</label>
                <select
                  value={cashCategoryInput}
                  onChange={(e) => setCashCategoryInput(e.target.value)}
                  className="w-full min-h-[40px] px-3.5 rounded-xl bg-[#05070B] border border-[#171C25] text-white text-xs focus:border-[#F20D18] focus:outline-none"
                >
                  <option value="Aluguel">Aluguel</option>
                  <option value="Água, Luz e Internet">Água, Luz e Internet</option>
                  <option value="Pagamento de Professores">Pagamento de Professores</option>
                  <option value="Material e Limpeza Tatame">Material e Limpeza Tatame</option>
                  <option value="Venda de Kimonos e Produtos">Venda de Kimonos e Produtos</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full min-h-[44px] rounded-xl bg-[#F20D18] text-white font-black text-xs flex items-center justify-center gap-1.5 hover:bg-[#d90812] mt-3"
              >
                <Check className="w-4 h-4" />
                <span>Confirmar Lançamento</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: HISTÓRICO DE PRESENÇAS DO ALUNO */}
      {studentHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in select-none">
          <div className="w-full max-w-md bg-[#0D121C] border border-[#171C25] rounded-3xl p-5 shadow-2xl max-h-[80vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b border-[#171C25] mb-3">
              <div>
                <h4 className="text-xs font-bold text-white">{studentHistoryModal.name}</h4>
                <p className="text-[11px] text-[#F20D18]">{studentHistoryModal.graduation}</p>
              </div>
              <button onClick={() => setStudentHistoryModal(null)} className="text-[#94A3B8] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <h5 className="text-[11px] font-black uppercase text-[#94A3B8]">Histórico de Aulas</h5>
              {attendance.filter((a) => a.studentId === studentHistoryModal.id).length === 0 ? (
                <p className="text-xs text-[#64748B] py-4 text-center">Nenhuma chamada registrada ainda.</p>
              ) : (
                attendance
                  .filter((a) => a.studentId === studentHistoryModal.id)
                  .sort((a, b) => b.date.localeCompare(a.date))
                  .map((rec) => (
                    <div key={rec.id} className="flex items-center justify-between p-2 rounded-xl bg-[#05070B] border border-[#171C25] text-xs">
                      <span className="text-white font-medium">{rec.date}</span>
                      <span className={`font-black px-2 py-0.5 rounded text-[10px] ${
                        rec.status === 'PRESENTE' ? 'bg-[#10B981]/20 text-[#10B981]' : 'bg-[#EF4444]/20 text-[#EF4444]'
                      }`}>
                        {rec.status}
                      </span>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
