import { ModerationService } from '../services/moderationService';

export function runModerationTests(): { name: string; passed: boolean; error?: string }[] {
  const results: { name: string; passed: boolean; error?: string }[] = [];

  function test(name: string, fn: () => void) {
    try {
      fn();
      results.push({ name, passed: true });
    } catch (err: any) {
      results.push({ name, passed: false, error: err?.message || String(err) });
    }
  }

  test('submitReport should create a pending report and auto-hide content', () => {
    const report = ModerationService.submitReport({
      targetId: 'post_abusive_99',
      targetType: 'POST',
      targetAuthorUsername: 'spammer_user',
      reporterId: 'reporter_1',
      reporterUsername: 'good_athlete',
      reason: 'SPAM',
      description: 'Publicidade abusiva repetida'
    });

    if (!report.id || report.status !== 'PENDENTE') {
      throw new Error('Report was not created with PENDENTE status');
    }

    const hidden = ModerationService.getHiddenContentIds('reporter_1');
    if (!hidden.includes('post_abusive_99')) {
      throw new Error('Reported post was not auto-hidden for reporter');
    }
  });

  test('blockUser should prevent user interactions and be reversible', () => {
    ModerationService.blockUser('user_a', 'toxic_athlete');
    if (!ModerationService.isUserBlocked('user_a', 'toxic_athlete')) {
      throw new Error('User was not marked as blocked');
    }

    ModerationService.unblockUser('user_a', 'toxic_athlete');
    if (ModerationService.isUserBlocked('user_a', 'toxic_athlete')) {
      throw new Error('User was still blocked after unblocking');
    }
  });

  test('resolveReport should transition report status and record admin actions', () => {
    const report = ModerationService.submitReport({
      targetId: 'post_to_resolve_100',
      targetType: 'POST',
      reporterId: 'reporter_2',
      reporterUsername: 'guard_warrior',
      reason: 'VIOLENCIA_DESMEDIDA'
    });

    ModerationService.resolveReport(report.id, 'CONTEUDO_REMOVIDO', 'RESOLVIDA', 'Conteúdo violava as regras');
    const all = ModerationService.getAllReports();
    const resolved = all.find((r) => r.id === report.id);

    if (!resolved || resolved.status !== 'RESOLVIDA' || resolved.adminActionTaken !== 'CONTEUDO_REMOVIDO') {
      throw new Error('Report was not updated to RESOLVIDA with CONTEUDO_REMOVIDO');
    }
  });

  return results;
}
