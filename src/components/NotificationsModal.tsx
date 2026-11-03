import React from 'react';
import { X, Heart, MessageCircle, UserPlus, Flame, Trophy, CheckCheck, Swords, Check } from 'lucide-react';
import { NotificationItem } from '../types';

interface NotificationsModalProps {
  notifications: NotificationItem[];
  onClose: () => void;
  onMarkAllAsRead: () => void;
  onSelectNotification: (notif: NotificationItem) => void;
  onAcceptChallenge?: (challengeId: string) => void;
  onDeclineChallenge?: (challengeId: string) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  notifications,
  onClose,
  onMarkAllAsRead,
  onSelectNotification,
  onAcceptChallenge,
  onDeclineChallenge
}) => {
  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'LIKE':
        return <Heart className="w-3.5 h-3.5 text-[#F20D18] fill-[#F20D18]" />;
      case 'COMMENT':
        return <MessageCircle className="w-3.5 h-3.5 text-[#3B82F6]" />;
      case 'FRIEND_REQUEST':
      case 'FRIEND_ACCEPT':
        return <UserPlus className="w-3.5 h-3.5 text-[#10B981]" />;
      case 'STREAK_MILESTONE':
        return <Flame className="w-3.5 h-3.5 text-[#F20D18] fill-[#F20D18]" />;
      case 'EVENT_REMINDER':
        return <Trophy className="w-3.5 h-3.5 text-[#F59E0B]" />;
      case 'CHALLENGE_INVITE':
      case 'CHALLENGE_ACCEPTED':
      case 'CHALLENGE_DECLINED':
        return <Swords className="w-3.5 h-3.5 text-[#F20D18]" />;
      default:
        return <Heart className="w-3.5 h-3.5 text-[#F20D18]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in select-none">
      <div className="w-full max-w-md bg-[#0D121C] border border-[#171C25] rounded-3xl p-5 shadow-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#171C25]">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-black text-white">Notificações</h3>
            <span className="text-[10px] bg-[#F20D18]/15 text-[#F20D18] font-bold px-1.5 py-0.5 rounded">
              {notifications.filter((n) => !n.isRead).length} novas
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onMarkAllAsRead}
              className="text-[11px] text-[#94A3B8] hover:text-white flex items-center gap-1"
              title="Marcar todas como lidas"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Ler todas</span>
            </button>
            <button onClick={onClose} className="text-[#94A3B8] hover:text-white p-1">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto py-3 space-y-2.5 no-scrollbar">
          {notifications.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-center text-[#94A3B8] text-xs">
              <p>Nenhuma notificação no momento.</p>
            </div>
          ) : (
            notifications.map((notif) => {
              const isChallenge = notif.type === 'CHALLENGE_INVITE';
              return (
                <div
                  key={notif.id}
                  className={`p-3.5 rounded-2xl border transition-all flex flex-col gap-2.5 ${
                    notif.isRead
                      ? 'bg-[#071321]/40 border-[#171C25]'
                      : 'bg-[#071321] border-[#F20D18]/30 shadow-sm'
                  }`}
                >
                  <div 
                    onClick={() => onSelectNotification(notif)}
                    className="flex items-start gap-3 cursor-pointer"
                  >
                    <div className="relative shrink-0">
                      <img
                        src={notif.actorAvatar}
                        alt={notif.actorName}
                        className="w-10 h-10 rounded-full object-cover border border-[#171C25]"
                      />
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#05070B] border border-[#171C25] flex items-center justify-center">
                        {getIcon(notif.type)}
                      </div>
                    </div>

                    <div className="flex-1 text-xs leading-relaxed">
                      <p className="text-white">
                        <strong className="font-bold mr-1">{notif.actorName}</strong> 
                        <span className="text-[#CBD5E1]">{notif.text}</span>
                      </p>
                      <p className="text-[10px] text-[#64748B] mt-0.5">{notif.timestamp}</p>
                    </div>

                    {!notif.isRead && (
                      <span className="w-2 h-2 rounded-full bg-[#F20D18] shrink-0 mt-1.5" />
                    )}
                  </div>

                  {/* Interactive Challenge Buttons */}
                  {isChallenge && notif.challengeId && onAcceptChallenge && (
                    <div className="flex items-center gap-2 pt-1 border-t border-[#171C25]/80 pl-13">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAcceptChallenge(notif.challengeId!);
                        }}
                        className="min-h-[34px] px-4 rounded-xl bg-gradient-to-r from-[#F20D18] to-[#D90812] text-white font-black text-xs flex items-center gap-1.5 hover:opacity-95 active:scale-95 shadow-md shadow-[#F20D18]/25"
                      >
                        <Swords className="w-3.5 h-3.5" />
                        <span>Aceitar Desafio</span>
                      </button>

                      {onDeclineChallenge && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeclineChallenge(notif.challengeId!);
                          }}
                          className="min-h-[34px] px-3 rounded-xl bg-[#05070B] border border-[#171C25] text-[#94A3B8] font-bold text-xs hover:text-white"
                        >
                          Recusar
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
