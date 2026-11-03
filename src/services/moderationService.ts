/**
 * STRAVA FIGHT — Moderation & Community Safety Service
 * 
 * Handles:
 * - Content and user reporting (Posts, Comments, Users, Messages, Ads)
 * - User blocking and unblocking
 * - Content suppression / hiding for the reporting user
 * - Administrative moderation queue and resolution audit trails
 */

import { generateUUID } from '../utils/formatters';

export type ReportTargetType = 'POST' | 'COMMENT' | 'USER' | 'MESSAGE' | 'AD';

export type ReportReason = 
  | 'SPAM'
  | 'ASSEDIO'
  | 'DISCURSO_ODIO'
  | 'CONTEUDO_INADEQUADO'
  | 'GOLPE_OU_FRAUDE'
  | 'VIOLENCIA_DESMEDIDA'
  | 'PERFIL_FALSO'
  | 'OUTRO';

export type ReportStatus = 'PENDENTE' | 'EM_ANALISE' | 'RESOLVIDA' | 'REJEITADA';

export interface CommunityReport {
  id: string;
  targetId: string;
  targetType: ReportTargetType;
  targetAuthorUsername?: string;
  reporterId: string;
  reporterUsername: string;
  reason: ReportReason;
  description?: string;
  status: ReportStatus;
  adminActionTaken?: 'NENHUMA' | 'AVISO' | 'CONTEUDO_REMOVIDO' | 'CONTA_SUSPENSA';
  adminNotes?: string;
  createdAt: string;
  resolvedAt?: string;
}

const MODERATION_STORAGE_KEYS = {
  REPORTS: 'sf_community_reports',
  BLOCKED_USERS: 'sf_blocked_users',
  HIDDEN_POSTS: 'sf_hidden_posts',
  AUDIT_LOGS: 'sf_moderation_audit_logs'
};

// Memory cache
const modCache = new Map<string, any>();

function getModData<T>(key: string, fallback: T): T {
  if (modCache.has(key)) return modCache.get(key) as T;
  try {
    if (typeof localStorage === 'undefined') {
      modCache.set(key, fallback);
      return fallback;
    }
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : fallback;
    modCache.set(key, parsed);
    return parsed;
  } catch {
    modCache.set(key, fallback);
    return fallback;
  }
}

function setModData<T>(key: string, val: T): void {
  modCache.set(key, val);
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(val));
    }
  } catch (e) {
    // Silently continue in environments without localStorage
  }
}


export class ModerationService {
  /**
   * Submit a new community report against a post, comment, user, message or ad.
   */
  static submitReport(report: Omit<CommunityReport, 'id' | 'status' | 'createdAt'>): CommunityReport {
    const newReport: CommunityReport = {
      ...report,
      id: generateUUID(),
      status: 'PENDENTE',
      createdAt: new Date().toISOString()
    };

    const reports = this.getAllReports();
    const updated = [newReport, ...reports];
    setModData(MODERATION_STORAGE_KEYS.REPORTS, updated);

    // Auto-hide the reported item for this specific user so they don't see it again immediately
    if (report.targetType === 'POST' || report.targetType === 'AD') {
      this.hideContentForUser(report.reporterId, report.targetId);
    }

    return newReport;
  }

  static getAllReports(): CommunityReport[] {
    return getModData<CommunityReport[]>(MODERATION_STORAGE_KEYS.REPORTS, []);
  }

  static getPendingReports(): CommunityReport[] {
    return this.getAllReports().filter((r) => r.status === 'PENDENTE' || r.status === 'EM_ANALISE');
  }

  /**
   * Admin resolution of a report with audit log.
   */
  static resolveReport(
    reportId: string,
    action: 'NENHUMA' | 'AVISO' | 'CONTEUDO_REMOVIDO' | 'CONTA_SUSPENSA',
    status: 'RESOLVIDA' | 'REJEITADA',
    adminNotes?: string
  ): void {
    const reports = this.getAllReports();
    const updated = reports.map((r) => {
      if (r.id === reportId) {
        return {
          ...r,
          status,
          adminActionTaken: action,
          adminNotes: adminNotes || r.adminNotes,
          resolvedAt: new Date().toISOString()
        };
      }
      return r;
    });
    setModData(MODERATION_STORAGE_KEYS.REPORTS, updated);
  }

  // User Blocking
  static getBlockedUsers(userId: string): string[] {
    const all = getModData<Record<string, string[]>>(MODERATION_STORAGE_KEYS.BLOCKED_USERS, {});
    return all[userId] || [];
  }

  static blockUser(userId: string, targetUsername: string): void {
    const all = getModData<Record<string, string[]>>(MODERATION_STORAGE_KEYS.BLOCKED_USERS, {});
    const currentList = all[userId] || [];
    if (!currentList.includes(targetUsername)) {
      all[userId] = [...currentList, targetUsername];
      setModData(MODERATION_STORAGE_KEYS.BLOCKED_USERS, all);
    }
  }

  static unblockUser(userId: string, targetUsername: string): void {
    const all = getModData<Record<string, string[]>>(MODERATION_STORAGE_KEYS.BLOCKED_USERS, {});
    const currentList = all[userId] || [];
    all[userId] = currentList.filter((u) => u !== targetUsername);
    setModData(MODERATION_STORAGE_KEYS.BLOCKED_USERS, all);
  }

  static isUserBlocked(userId: string, targetUsername: string): boolean {
    const blocked = this.getBlockedUsers(userId);
    return blocked.includes(targetUsername);
  }

  // Content Hiding
  static getHiddenContentIds(userId: string): string[] {
    const all = getModData<Record<string, string[]>>(MODERATION_STORAGE_KEYS.HIDDEN_POSTS, {});
    return all[userId] || [];
  }

  static hideContentForUser(userId: string, contentId: string): void {
    const all = getModData<Record<string, string[]>>(MODERATION_STORAGE_KEYS.HIDDEN_POSTS, {});
    const list = all[userId] || [];
    if (!list.includes(contentId)) {
      all[userId] = [...list, contentId];
      setModData(MODERATION_STORAGE_KEYS.HIDDEN_POSTS, all);
    }
  }

  static unhideContentForUser(userId: string, contentId: string): void {
    const all = getModData<Record<string, string[]>>(MODERATION_STORAGE_KEYS.HIDDEN_POSTS, {});
    const list = all[userId] || [];
    all[userId] = list.filter((id) => id !== contentId);
    setModData(MODERATION_STORAGE_KEYS.HIDDEN_POSTS, all);
  }
}
