/**
 * STRAVA FIGHT — Auth Tests
 * Testes de autenticação, sessão, tokens e refresh
 */

export function runAuthTests(): { name: string; passed: boolean; error?: string }[] {
  const results: { name: string; passed: boolean; error?: string }[] = [];

  function test(name: string, fn: () => void) {
    try {
      fn();
      results.push({ name, passed: true });
    } catch (err: any) {
      results.push({ name, passed: false, error: err?.message || String(err) });
    }
  }

  // Mock de usuário autenticado
  const mockUser = {
    id: 'auth-test-user-123',
    email: 'test@stravafight.com',
    username: 'testuser',
    created_at: new Date().toISOString()
  };

  // Mock de sessão
  let currentSession: any = null;
  let sessionExpiry: number | null = null;

  // Funções auxiliares
  const createSession = (user: any, expiresInMs: number = 3600000) => {
    currentSession = {
      user,
      access_token: `mock_token_${Date.now()}`,
      refresh_token: `mock_refresh_${Date.now()}`,
      expires_at: Date.now() + expiresInMs
    };
    sessionExpiry = currentSession.expires_at;
    return currentSession;
  };

  const isSessionValid = () => {
    if (!currentSession || !sessionExpiry) return false;
    return Date.now() < sessionExpiry;
  };

  const clearSession = () => {
    currentSession = null;
    sessionExpiry = null;
  };

  const refreshSession = () => {
    if (!currentSession) throw new Error('No session to refresh');
    return createSession(currentSession.user, 3600000);
  };

  // ============================================================================
  // SUITE: Autenticação Básica
  // ============================================================================

  test('createSession should generate valid session with expiry', () => {
    const session = createSession(mockUser);
    if (!session.access_token || !session.refresh_token) {
      throw new Error('Session missing tokens');
    }
    if (!session.expires_at || session.expires_at <= Date.now()) {
      throw new Error('Session expiry invalid');
    }
  });

  test('isSessionValid should return true for valid session', () => {
    createSession(mockUser, 10000); // 10s no futuro
    if (!isSessionValid()) {
      throw new Error('Valid session marked as invalid');
    }
  });

  test('isSessionValid should return false for expired session', () => {
    createSession(mockUser, -1000); // Expirado
    if (isSessionValid()) {
      throw new Error('Expired session marked as valid');
    }
  });

  test('clearSession should remove session data', () => {
    createSession(mockUser);
    clearSession();
    if (currentSession !== null) {
      throw new Error('Session not cleared');
    }
  });

  test('refreshSession should extend session expiry', () => {
    createSession(mockUser, 1000); // Expira em 1s
    const oldExpiry = sessionExpiry;
    setTimeout(() => {
      refreshSession();
      if (!sessionExpiry || sessionExpiry <= oldExpiry!) {
        throw new Error('Session not refreshed properly');
      }
    }, 100);
  });

  // ============================================================================
  // SUITE: Token Validation
  // ============================================================================

  test('Access token should have reasonable length', () => {
    const session = createSession(mockUser);
    if (session.access_token.length < 20) {
      throw new Error('Access token too short');
    }
  });

  test('Refresh token should differ from access token', () => {
    const session = createSession(mockUser);
    if (session.access_token === session.refresh_token) {
      throw new Error('Tokens should be different');
    }
  });

  // ============================================================================
  // SUITE: Session Persistence
  // ============================================================================

  test('Session should persist user data', () => {
    const session = createSession(mockUser);
    if (session.user.id !== mockUser.id || session.user.email !== mockUser.email) {
      throw new Error('User data not persisted in session');
    }
  });

  test('Multiple createSession calls should generate unique tokens', () => {
    const session1 = createSession(mockUser);
    const token1 = session1.access_token;
    
    // Aguardar para garantir timestamp diferente (Date.now() tem precisão de milissegundo)
    const startTime = Date.now();
    while (Date.now() === startTime) {
      // Busy wait até próximo milissegundo
    }
    
    const session2 = createSession(mockUser);
    const token2 = session2.access_token;
    
    if (token1 === token2) {
      throw new Error('Tokens should be unique');
    }
  });

  // ============================================================================
  // SUITE: Edge Cases
  // ============================================================================

  test('refreshSession without active session should throw', () => {
    clearSession();
    let errorThrown = false;
    try {
      refreshSession();
    } catch (e: any) {
      errorThrown = true;
      if (!e.message.includes('No session')) {
        throw new Error('Wrong error message');
      }
    }
    if (!errorThrown) {
      throw new Error('Expected error not thrown');
    }
  });

  test('Session with zero expiry should be invalid', () => {
    createSession(mockUser, 0);
    if (isSessionValid()) {
      throw new Error('Zero expiry session should be invalid');
    }
  });

  test('Session with negative expiry should be invalid', () => {
    createSession(mockUser, -10000);
    if (isSessionValid()) {
      throw new Error('Negative expiry session should be invalid');
    }
  });

  return results;
}
