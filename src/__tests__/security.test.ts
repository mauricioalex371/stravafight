import { escapeHtml, stripHtml, isSafeUrl, sanitizeInput, validateUploadFile } from '../utils/security';
import { RateLimiter } from '../utils/rateLimiter';

export function runSecurityTests(): { name: string; passed: boolean; error?: string }[] {
  const results: { name: string; passed: boolean; error?: string }[] = [];

  function test(name: string, fn: () => void) {
    try {
      fn();
      results.push({ name, passed: true });
    } catch (err: any) {
      results.push({ name, passed: false, error: err?.message || String(err) });
    }
  }

  test('escapeHtml should convert dangerous characters to entities', () => {
    const raw = '<script>alert("XSS")</script>';
    const escaped = escapeHtml(raw);
    if (escaped.includes('<script>') || !escaped.includes('&lt;script&gt;')) {
      throw new Error(`Failed to escape: ${escaped}`);
    }
  });

  test('stripHtml should remove all HTML tags', () => {
    const input = '<b>Oss!</b> Treino duro <i>hoje</i>';
    const stripped = stripHtml(input);
    if (stripped !== 'Oss! Treino duro hoje') {
      throw new Error(`Unexpected stripped output: "${stripped}"`);
    }
  });

  test('isSafeUrl should reject dangerous protocols', () => {
    if (isSafeUrl('javascript:alert(1)')) throw new Error('Allowed javascript:');
    if (isSafeUrl('data:text/html,<script>')) throw new Error('Allowed data:text/html');
    if (!isSafeUrl('https://stravafight.com.br')) throw new Error('Rejected valid https URL');
    if (!isSafeUrl('/explore')) throw new Error('Rejected valid relative URL');
  });

  test('sanitizeInput should truncate text beyond maxLength', () => {
    const long = 'a'.repeat(50);
    const sanitized = sanitizeInput(long, 10);
    if (sanitized.length !== 10) throw new Error(`Length was ${sanitized.length}, expected 10`);
  });

  test('RateLimiter should throttle actions exceeding limit', () => {
    RateLimiter.reset('user_test_1');
    // First 5 attempts for COMMENT should pass
    for (let i = 0; i < 5; i++) {
      const check = RateLimiter.check('COMMENT', 'user_test_1');
      if (!check.allowed) throw new Error(`Attempt ${i + 1} was prematurely blocked`);
    }
    // 6th attempt must be blocked
    const blockedCheck = RateLimiter.check('COMMENT', 'user_test_1');
    if (blockedCheck.allowed) throw new Error('6th comment was not throttled by RateLimiter');
  });

  return results;
}
