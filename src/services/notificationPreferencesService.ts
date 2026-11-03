/**
 * STRAVA FIGHT — Notification Preferences & Deduplication Service
 */

import { NotificationItem } from '../types';

export interface NotificationPreferences {
  likes: boolean;
  comments: boolean;
  newFollowers: boolean;
  friendRequests: boolean;
  directMessages: boolean;
  combatChallenges: boolean;
  eventsAndSeminars: boolean;
  commercialDeals: boolean;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  likes: true,
  comments: true,
  newFollowers: true,
  friendRequests: true,
  directMessages: true,
  combatChallenges: true,
  eventsAndSeminars: true,
  commercialDeals: true
};

const STORAGE_KEYS = {
  PREFS: 'sf_notification_preferences',
  RECENT_HASHES: 'sf_notif_recent_hashes'
};

const recentNotificationHashes = new Set<string>();

export class NotificationPreferencesService {
  static getPreferences(): NotificationPreferences {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.PREFS);
      return raw ? { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) } : DEFAULT_PREFERENCES;
    } catch {
      return DEFAULT_PREFERENCES;
    }
  }

  static savePreferences(prefs: NotificationPreferences): void {
    localStorage.setItem(STORAGE_KEYS.PREFS, JSON.stringify(prefs));
  }

  /**
   * Determines if a notification should be presented based on user preferences.
   */
  static shouldDeliver(type: NotificationItem['type']): boolean {
    const prefs = this.getPreferences();
    switch (type) {
      case 'LIKE':
        return prefs.likes;
      case 'COMMENT':
        return prefs.comments;
      case 'FRIEND_REQUEST':
        return prefs.friendRequests;
      case 'CHALLENGE_INVITE':
      case 'CHALLENGE_ACCEPTED':
        return prefs.combatChallenges;
      default:
        return true;
    }
  }

  /**
   * Deduplicates notifications within a 60-second window.
   */
  static isDuplicate(notif: NotificationItem): boolean {
    const hash = `${notif.type}_${notif.actorName}_${notif.targetId || ''}_${notif.challengeId || ''}`;
    if (recentNotificationHashes.has(hash)) {
      return true;
    }
    recentNotificationHashes.add(hash);
    setTimeout(() => {
      recentNotificationHashes.delete(hash);
    }, 60000);
    return false;
  }

}
