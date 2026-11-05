/**
 * Facebook Pixel (Meta Pixel) Analytics Wrapper
 * Tracks user events and conversions for marketing optimization
 */

declare global {
  interface Window {
    fbq?: (
      action: string,
      event: string,
      params?: Record<string, any>
    ) => void;
  }
}

/**
 * Track standard Facebook events
 */
export const trackEvent = (
  eventName: string,
  params?: Record<string, any>
) => {
  if (typeof window !== 'undefined' && window.fbq) {
    try {
      window.fbq('track', eventName, params);
      console.log(`[Analytics] Event tracked: ${eventName}`, params);
    } catch (error) {
      console.error('[Analytics] Error tracking event:', error);
    }
  }
};

/**
 * Track custom Facebook events
 */
export const trackCustomEvent = (
  eventName: string,
  params?: Record<string, any>
) => {
  if (typeof window !== 'undefined' && window.fbq) {
    try {
      window.fbq('trackCustom', eventName, params);
      console.log(`[Analytics] Custom event tracked: ${eventName}`, params);
    } catch (error) {
      console.error('[Analytics] Error tracking custom event:', error);
    }
  }
};

/**
 * Predefined tracking functions for STRAVA FIGHT events
 */

export const Analytics = {
  // User Registration & Authentication
  trackCompleteRegistration: (method: string = 'email') => {
    trackEvent('CompleteRegistration', {
      content_name: 'Signup Completed',
      status: 'success',
      method
    });
  },

  trackLogin: (method: string = 'email') => {
    trackEvent('Login', { method });
  },

  // Onboarding
  trackOnboardingStart: () => {
    trackCustomEvent('OnboardingStart', {
      timestamp: new Date().toISOString()
    });
  },

  trackOnboardingComplete: () => {
    trackCustomEvent('OnboardingComplete', {
      timestamp: new Date().toISOString()
    });
  },

  trackOnboardingSkip: () => {
    trackCustomEvent('OnboardingSkip', {
      timestamp: new Date().toISOString()
    });
  },

  // Content Creation
  trackCreatePost: (contentType: 'image' | 'video' | 'text') => {
    trackCustomEvent('CreatePost', {
      content_type: contentType,
      timestamp: new Date().toISOString()
    });
  },

  trackCreateReel: () => {
    trackCustomEvent('CreateReel', {
      timestamp: new Date().toISOString()
    });
  },

  trackCheckIn: (modality: string) => {
    trackCustomEvent('TrainingCheckIn', {
      modality,
      timestamp: new Date().toISOString()
    });
  },

  trackSfActivity: (modality: string, duration: number, calories?: number) => {
    trackCustomEvent('SfActivity', {
      modality,
      duration,
      calories,
      timestamp: new Date().toISOString()
    });
  },

  // Social Interactions
  trackLike: (contentType: 'post' | 'reel' | 'comment') => {
    trackCustomEvent('Like', {
      content_type: contentType
    });
  },

  trackComment: (contentType: 'post' | 'reel') => {
    trackCustomEvent('Comment', {
      content_type: contentType
    });
  },

  trackShare: (contentType: 'post' | 'reel', method: string) => {
    trackCustomEvent('Share', {
      content_type: contentType,
      method
    });
  },

  trackFollow: () => {
    trackCustomEvent('Follow', {
      timestamp: new Date().toISOString()
    });
  },

  trackMessage: () => {
    trackCustomEvent('Message', {
      timestamp: new Date().toISOString()
    });
  },

  // Engagement
  trackViewContent: (contentType: string, contentId: string) => {
    trackEvent('ViewContent', {
      content_type: contentType,
      content_ids: [contentId]
    });
  },

  trackSearch: (searchTerm: string) => {
    trackEvent('Search', {
      search_string: searchTerm
    });
  },

  // Events & Challenges
  trackEventRegistration: (eventName: string, price: number) => {
    trackCustomEvent('EventRegistration', {
      event_name: eventName,
      value: price,
      currency: 'BRL'
    });
  },

  trackChallengeCreated: (challengeType: string) => {
    trackCustomEvent('ChallengeCreated', {
      challenge_type: challengeType
    });
  },

  trackChallengeAccepted: (challengeType: string) => {
    trackCustomEvent('ChallengeAccepted', {
      challenge_type: challengeType
    });
  },

  // Academy Management
  trackAcademyConfigured: (academyName: string) => {
    trackCustomEvent('AcademyConfigured', {
      academy_name: academyName
    });
  },

  trackStudentAdded: () => {
    trackCustomEvent('StudentAdded', {
      timestamp: new Date().toISOString()
    });
  },

  trackPaymentReceived: (amount: number) => {
    trackCustomEvent('PaymentReceived', {
      value: amount,
      currency: 'BRL'
    });
  },

  // Business
  trackAdView: (campaignId: string, placement: string) => {
    trackCustomEvent('AdView', {
      campaign_id: campaignId,
      placement
    });
  },

  trackAdClick: (campaignId: string, placement: string) => {
    trackCustomEvent('AdClick', {
      campaign_id: campaignId,
      placement
    });
  },

  trackBusinessProfile: (businessName: string) => {
    trackCustomEvent('BusinessProfileView', {
      business_name: businessName
    });
  },

  // Gamification
  trackBadgeUnlocked: (badgeName: string, xpValue: number) => {
    trackCustomEvent('BadgeUnlocked', {
      badge_name: badgeName,
      xp_value: xpValue
    });
  },

  trackLevelUp: (newLevel: string, totalXp: number) => {
    trackCustomEvent('LevelUp', {
      new_level: newLevel,
      total_xp: totalXp
    });
  },

  trackStreakAchieved: (days: number) => {
    trackCustomEvent('StreakAchieved', {
      streak_days: days
    });
  },

  // App Navigation
  trackViewChange: (viewName: string) => {
    trackCustomEvent('ViewChange', {
      view_name: viewName
    });
  },

  trackModalOpen: (modalName: string) => {
    trackCustomEvent('ModalOpen', {
      modal_name: modalName
    });
  }
};

export default Analytics;
