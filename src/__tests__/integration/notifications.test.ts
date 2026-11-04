/**
 * STRAVA FIGHT — Notifications Tests
 * Testes de notificações, leitura, agrupamento e filtros
 */

export function runNotificationsTests(): { name: string; passed: boolean; error?: string }[] {
  const results: { name: string; passed: boolean; error?: string }[] = [];

  function test(name: string, fn: () => void) {
    try {
      fn();
      results.push({ name, passed: true });
    } catch (err: any) {
      results.push({ name, passed: false, error: err?.message || String(err) });
    }
  }

  // Mock de notifications
  interface Notification {
    id: string;
    recipient_id: string;
    type: 'LIKE' | 'COMMENT' | 'FOLLOW' | 'MENTION' | 'MESSAGE' | 'SYSTEM';
    title: string;
    body: string;
    is_read: boolean;
    created_at: string;
    action_url?: string;
  }

  const notifications: Notification[] = [];
  let notifIdCounter = 1;

  const createNotification = (recipient_id: string, type: Notification['type'], title: string): Notification => {
    const notif: Notification = {
      id: `notif_${notifIdCounter++}`,
      recipient_id,
      type,
      title,
      body: `Corpo da notificação: ${title}`,
      is_read: false,
      created_at: new Date().toISOString()
    };
    notifications.push(notif);
    return notif;
  };

  const getNotifications = (recipient_id: string, unreadOnly: boolean = false): Notification[] => {
    return notifications.filter(n => 
      n.recipient_id === recipient_id && (!unreadOnly || !n.is_read)
    );
  };

  const markAsRead = (notif_id: string): boolean => {
    const notif = notifications.find(n => n.id === notif_id);
    if (!notif) return false;
    notif.is_read = true;
    return true;
  };

  const markAllAsRead = (recipient_id: string): number => {
    let count = 0;
    notifications.forEach(n => {
      if (n.recipient_id === recipient_id && !n.is_read) {
        n.is_read = true;
        count++;
      }
    });
    return count;
  };

  const getUnreadCount = (recipient_id: string): number => {
    return notifications.filter(n => n.recipient_id === recipient_id && !n.is_read).length;
  };

  // ============================================================================
  // SUITE: Criação de Notificações
  // ============================================================================

  test('createNotification should generate unique IDs', () => {
    const n1 = createNotification('user1', 'LIKE', 'Like na publicação');
    const n2 = createNotification('user1', 'COMMENT', 'Novo comentário');
    if (n1.id === n2.id) {
      throw new Error('Notification IDs should be unique');
    }
  });

  test('New notification should be unread by default', () => {
    const notif = createNotification('user2', 'FOLLOW', 'Novo seguidor');
    if (notif.is_read) {
      throw new Error('New notification should be unread');
    }
  });

  test('Notification should have timestamp', () => {
    const notif = createNotification('user3', 'MESSAGE', 'Nova mensagem');
    if (!notif.created_at || new Date(notif.created_at).toString() === 'Invalid Date') {
      throw new Error('Notification missing valid timestamp');
    }
  });

  // ============================================================================
  // SUITE: Filtros e Queries
  // ============================================================================

  test('getNotifications should filter by recipient', () => {
    createNotification('userA', 'LIKE', 'Like A');
    createNotification('userB', 'LIKE', 'Like B');
    
    const notifsA = getNotifications('userA');
    const notifsB = getNotifications('userB');
    
    if (notifsA.some(n => n.recipient_id !== 'userA')) {
      throw new Error('getNotifications returned wrong recipient');
    }
    if (notifsB.some(n => n.recipient_id !== 'userB')) {
      throw new Error('getNotifications returned wrong recipient');
    }
  });

  test('getNotifications with unreadOnly should filter read notifications', () => {
    createNotification('user4', 'COMMENT', 'Comentário 1');
    createNotification('user4', 'COMMENT', 'Comentário 2');
    
    const allNotifs = getNotifications('user4');
    markAsRead(allNotifs[0].id);
    
    const unreadNotifs = getNotifications('user4', true);
    if (unreadNotifs.length !== 1) {
      throw new Error(`Expected 1 unread notification, got ${unreadNotifs.length}`);
    }
  });

  test('getUnreadCount should count only unread notifications', () => {
    createNotification('user5', 'LIKE', 'Like 1');
    createNotification('user5', 'LIKE', 'Like 2');
    createNotification('user5', 'LIKE', 'Like 3');
    
    const count1 = getUnreadCount('user5');
    if (count1 !== 3) {
      throw new Error(`Expected 3 unread, got ${count1}`);
    }
    
    markAsRead(getNotifications('user5')[0].id);
    const count2 = getUnreadCount('user5');
    if (count2 !== 2) {
      throw new Error(`Expected 2 unread after marking 1 as read, got ${count2}`);
    }
  });

  // ============================================================================
  // SUITE: Marcar Como Lido
  // ============================================================================

  test('markAsRead should change is_read to true', () => {
    const notif = createNotification('user6', 'MENTION', 'Menção');
    markAsRead(notif.id);
    
    if (!notif.is_read) {
      throw new Error('Notification not marked as read');
    }
  });

  test('markAsRead with invalid ID should return false', () => {
    const result = markAsRead('invalid_id_999');
    if (result !== false) {
      throw new Error('markAsRead should return false for invalid ID');
    }
  });

  test('markAllAsRead should mark all user notifications as read', () => {
    createNotification('user7', 'LIKE', 'Like 1');
    createNotification('user7', 'LIKE', 'Like 2');
    createNotification('user7', 'LIKE', 'Like 3');
    
    const marked = markAllAsRead('user7');
    if (marked !== 3) {
      throw new Error(`Expected 3 marked, got ${marked}`);
    }
    
    const unread = getUnreadCount('user7');
    if (unread !== 0) {
      throw new Error(`Expected 0 unread after markAllAsRead, got ${unread}`);
    }
  });

  test('markAllAsRead should not affect other users', () => {
    createNotification('user8', 'FOLLOW', 'Seguidor');
    createNotification('user9', 'FOLLOW', 'Seguidor');
    
    markAllAsRead('user8');
    
    const unreadUser8 = getUnreadCount('user8');
    const unreadUser9 = getUnreadCount('user9');
    
    if (unreadUser8 !== 0) {
      throw new Error('user8 should have 0 unread');
    }
    if (unreadUser9 !== 1) {
      throw new Error('user9 should still have 1 unread');
    }
  });

  // ============================================================================
  // SUITE: Agrupamento por Tipo
  // ============================================================================

  test('Notifications should be grouped by type', () => {
    createNotification('user10', 'LIKE', 'Like 1');
    createNotification('user10', 'LIKE', 'Like 2');
    createNotification('user10', 'COMMENT', 'Comentário 1');
    createNotification('user10', 'FOLLOW', 'Seguidor 1');
    
    const allNotifs = getNotifications('user10');
    const likes = allNotifs.filter(n => n.type === 'LIKE');
    const comments = allNotifs.filter(n => n.type === 'COMMENT');
    const follows = allNotifs.filter(n => n.type === 'FOLLOW');
    
    if (likes.length !== 2) throw new Error(`Expected 2 LIKE, got ${likes.length}`);
    if (comments.length !== 1) throw new Error(`Expected 1 COMMENT, got ${comments.length}`);
    if (follows.length !== 1) throw new Error(`Expected 1 FOLLOW, got ${follows.length}`);
  });

  return results;
}
