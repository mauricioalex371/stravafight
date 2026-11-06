import React, { useState, useRef, useEffect } from 'react';
import { X, Send, MessageCircle, Bot, User } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: string;
}

interface SupportChatBotProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupportChatBot: React.FC<SupportChatBotProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Olá! 👋 Eu sou o assistente virtual do STRAVA FIGHT. Como posso ajudar você hoje?',
      sender: 'bot',
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();

    // Respostas do bot
    if (lowerMessage.includes('ola') || lowerMessage.includes('olá') || lowerMessage.includes('oi')) {
      return 'Olá! Como posso ajudar você hoje? 😊';
    }
    
    if (lowerMessage.includes('treino') || lowerMessage.includes('treinar')) {
      return 'Para registrar um treino, vá em "Check-in" no menu principal e preencha os dados da sua sessão. Você ganhará XP e aumentará seu streak! 💪';
    }
    
    if (lowerMessage.includes('desafio') || lowerMessage.includes('sparring')) {
      return 'Para criar um desafio, acesse o perfil do lutador e clique em "Desafiar". Você pode propor rounds e definir a modalidade! ⚔️';
    }
    
    if (lowerMessage.includes('perfil') || lowerMessage.includes('dados')) {
      return 'Para editar seu perfil, vá em Configurações → Perfil. Lá você pode alterar foto, nome, bio e muito mais! 👤';
    }
    
    if (lowerMessage.includes('xp') || lowerMessage.includes('pontos') || lowerMessage.includes('nivel')) {
      return 'Você ganha XP registrando treinos, aceitando desafios e completando atividades. Quanto mais XP, maior sua faixa social no app! 🥋';
    }
    
    if (lowerMessage.includes('senha') || lowerMessage.includes('login') || lowerMessage.includes('acesso')) {
      return 'Se esqueceu sua senha, clique em "Esqueci minha senha" na tela de login. Enviaremos um link para redefinição por e-mail. 🔐';
    }
    
    if (lowerMessage.includes('notifica') || lowerMessage.includes('aviso')) {
      return 'Você pode configurar suas notificações em Configurações → Notificações. Ative ou desative avisos de desafios, comentários e muito mais! 🔔';
    }
    
    if (lowerMessage.includes('ajuda') || lowerMessage.includes('suporte') || lowerMessage.includes('problema')) {
      return 'Estou aqui para ajudar! Você também pode nos enviar um e-mail: suporte@stravafight.com.br. Respondemos em até 24 horas! 📧';
    }
    
    if (lowerMessage.includes('obrigad') || lowerMessage.includes('valeu')) {
      return 'Por nada! Sempre que precisar, estarei aqui. Bons treinos! 🥊';
    }
    
    // Resposta padrão
    return 'Desculpe, não entendi sua pergunta. Você pode perguntar sobre: treinos, desafios, perfil, XP, notificações ou problemas de acesso. Como posso ajudar? 🤔';
  };

  const handleSend = () => {
    if (!inputText.trim()) return;

    // Adicionar mensagem do usuário
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    // Simular digitação do bot
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(inputText),
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMessage]);
    }, 800);
  };

  const quickReplies = [
    'Como registrar treino?',
    'Como criar desafio?',
    'Esqueci minha senha',
    'Falar com suporte'
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="w-full md:w-[420px] h-full md:h-[600px] bg-[#0D121C] md:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="flex-none bg-gradient-to-r from-[#F20D18] to-[#FF4A0F] p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold text-base">Suporte 24h</h3>
              <p className="text-white/80 text-xs">Sempre disponível</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#05070B]">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-2 ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div className={`flex-none w-8 h-8 rounded-full flex items-center justify-center ${
                message.sender === 'bot' 
                  ? 'bg-gradient-to-br from-[#F20D18] to-[#FF4A0F]' 
                  : 'bg-[#1A2634]'
              }`}>
                {message.sender === 'bot' ? (
                  <Bot className="w-4 h-4 text-white" />
                ) : (
                  <User className="w-4 h-4 text-[#94A3B8]" />
                )}
              </div>

              {/* Message Bubble */}
              <div className={`flex flex-col ${message.sender === 'user' ? 'items-end' : 'items-start'} max-w-[75%]`}>
                <div className={`px-4 py-2.5 rounded-2xl ${
                  message.sender === 'bot'
                    ? 'bg-[#1A2634] text-white'
                    : 'bg-gradient-to-r from-[#F20D18] to-[#FF4A0F] text-white'
                }`}>
                  <p className="text-sm leading-relaxed">{message.text}</p>
                </div>
                <span className="text-xs text-[#475569] mt-1 px-1">{message.timestamp}</span>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Replies */}
        {messages.length <= 2 && (
          <div className="flex-none px-4 py-2 bg-[#0D121C] border-t border-[#1A2634]">
            <div className="flex flex-wrap gap-2">
              {quickReplies.map((reply, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setInputText(reply);
                    handleSend();
                  }}
                  className="px-3 py-1.5 bg-[#1A2634] text-[#94A3B8] text-xs rounded-full hover:bg-[#1F2937] transition-colors"
                >
                  {reply}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="flex-none p-4 bg-[#0D121C] border-t border-[#1A2634]">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Digite sua mensagem..."
              className="flex-1 h-11 px-4 bg-[#1A2634] border border-[#1F2937] rounded-xl text-white text-sm placeholder-[#475569] outline-none focus:border-[#F20D18] transition-colors"
            />
            <button
              onClick={handleSend}
              disabled={!inputText.trim()}
              className="flex-none w-11 h-11 bg-gradient-to-r from-[#F20D18] to-[#FF4A0F] rounded-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition-transform"
            >
              <Send className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Botão flutuante para abrir o chat
interface SupportChatButtonProps {
  onClick: () => void;
}

export const SupportChatButton: React.FC<SupportChatButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-[#F20D18] to-[#FF4A0F] rounded-full shadow-2xl shadow-[#F20D18]/50 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform z-40 animate-bounce"
      aria-label="Abrir suporte"
    >
      <MessageCircle className="w-7 h-7 text-white" />
    </button>
  );
};
