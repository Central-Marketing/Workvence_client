import { MessageModeration } from '@/types';

export interface ModerationStyleConfig {
  badgeLabel: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  bubbleBg: string;
  bubbleBorder: string;
  bubbleText: string;
  iconColor: string;
  dotColor: string;
  borderColorHex: string;
  accentColorHex: string;
}

export const MODERATION_SEVERITY_CONFIG: Record<string, ModerationStyleConfig> = {
  low: {
    badgeLabel: 'Safety reminder',
    badgeBg: 'bg-amber-100 dark:bg-amber-950/60',
    badgeText: 'text-amber-800 dark:text-amber-300',
    badgeBorder: 'border-amber-300 dark:border-amber-700/60',
    bubbleBg: 'bg-amber-50/80 dark:bg-amber-950/25',
    bubbleBorder: 'border-amber-400 dark:border-amber-600',
    bubbleText: 'text-amber-950 dark:text-amber-100',
    iconColor: 'text-amber-600 dark:text-amber-400',
    dotColor: 'bg-amber-500',
    borderColorHex: '#f59e0b', // yellow-500 / amber-500
    accentColorHex: '#d97706', // amber-600
  },
  medium: {
    badgeLabel: 'Safety reminder',
    badgeBg: 'bg-orange-100 dark:bg-orange-950/60',
    badgeText: 'text-orange-800 dark:text-orange-300',
    badgeBorder: 'border-orange-300 dark:border-orange-700/60',
    bubbleBg: 'bg-orange-50/80 dark:bg-orange-950/25',
    bubbleBorder: 'border-orange-400 dark:border-orange-500',
    bubbleText: 'text-orange-950 dark:text-orange-100',
    iconColor: 'text-orange-600 dark:text-orange-400',
    dotColor: 'bg-orange-500',
    borderColorHex: '#ea580c', // orange-600
    accentColorHex: '#ea580c', // orange-600
  },
  high: {
    badgeLabel: 'Safety reminder',
    badgeBg: 'bg-red-100 dark:bg-red-950/60',
    badgeText: 'text-red-800 dark:text-red-300',
    badgeBorder: 'border-red-300 dark:border-red-700/60',
    bubbleBg: 'bg-red-50/85 dark:bg-red-950/30',
    bubbleBorder: 'border-red-400 dark:border-red-500',
    bubbleText: 'text-red-950 dark:text-red-100',
    iconColor: 'text-red-600 dark:text-red-400',
    dotColor: 'bg-red-600',
    borderColorHex: '#dc2626', // red-600
    accentColorHex: '#dc2626', // red-600
  },
  critical: {
    badgeLabel: 'Security alert',
    badgeBg: 'bg-red-200 dark:bg-red-900/60',
    badgeText: 'text-red-950 dark:text-red-100 font-bold',
    badgeBorder: 'border-red-600 dark:border-red-700',
    bubbleBg: 'bg-red-100/90 dark:bg-red-950/50',
    bubbleBorder: 'border-red-800 dark:border-red-700',
    bubbleText: 'text-red-950 dark:text-red-50',
    iconColor: 'text-red-800 dark:text-red-400',
    dotColor: 'bg-red-800',
    borderColorHex: '#991b1b', // red-800
    accentColorHex: '#991b1b', // red-800
  },
};

export interface ModerationNoticeContent {
  title: string;
  category: string;
  message: string;
  guidance: string;
}

/**
 * Returns user-friendly, non-technical category and messaging.
 * Never exposes raw filter rules or matched keywords.
 */
export const getModerationNoticeContent = (
  moderation?: MessageModeration | null
): ModerationNoticeContent => {
  const word = (moderation?.matchedWord || '').toLowerCase();
  const reason = (moderation?.flagReason || '').toLowerCase();
  const level = (moderation?.warningLevel || 'medium').toLowerCase();

  const isCritical = level === 'critical';

  // 1. Off-Platform Payment
  if (
    word.includes('pay') ||
    word.includes('cash') ||
    word.includes('bank') ||
    word.includes('crypto') ||
    word.includes('transfer') ||
    word.includes('fee') ||
    word.includes('invoice') ||
    word.includes('usd') ||
    word.includes('dollar') ||
    word.includes('money') ||
    reason.includes('pay') ||
    reason.includes('financial') ||
    reason.includes('bank') ||
    reason.includes('crypto')
  ) {
    return {
      title: 'Security Alert: Payment Outside Platform',
      category: 'Payment outside Workvence',
      message: 'This message was flagged for discussing external payments.',
      guidance: 'To ensure escrow payment protection and prevent fraud, all transactions must remain on Workvence.',
    };
  }

  // 2. Suspicious / External Links
  if (
    word.includes('http') ||
    word.includes('www.') ||
    word.includes('.com') ||
    word.includes('.io') ||
    word.includes('.org') ||
    word.includes('.net') ||
    word.includes('link') ||
    reason.includes('link') ||
    reason.includes('url') ||
    reason.includes('phishing')
  ) {
    return {
      title: isCritical ? 'Security Alert: External Link' : 'Security Notice: External Link',
      category: 'External link',
      message: 'This message contains an external or unverified link.',
      guidance: 'For your safety, do not visit unknown websites or share sensitive credentials.',
    };
  }

  // 3. Contact Information
  if (
    word.includes('phone') ||
    word.includes('email') ||
    word.includes('mail') ||
    word.includes('@') ||
    word.includes('whatsapp') ||
    word.includes('telegram') ||
    word.includes('skype') ||
    word.includes('contact') ||
    word.includes('call') ||
    word.includes('number') ||
    word.includes('insta') ||
    word.includes('reach') ||
    reason.includes('contact') ||
    reason.includes('email') ||
    reason.includes('phone') ||
    reason.includes('number') ||
    reason.includes('social')
  ) {
    return {
      title: isCritical ? 'Security Alert: Contact Information' : 'Safety Notice: Contact Information',
      category: 'Contact information',
      message: 'This message was flagged for containing potential personal contact details.',
      guidance: 'To protect your account and stay covered by platform security, please keep all communication on Workvence.',
    };
  }

  // 4. General / Default Policy Notice
  return {
    title: isCritical ? 'Security Alert' : 'Safety Notice',
    category: 'Community Guidelines',
    message: 'This message was flagged by automated safety filters for potential policy violations.',
    guidance: 'Please keep all communication and transactions on Workvence to stay protected.',
  };
};

/**
 * Returns a standardized single-string tooltip text suitable for native title attributes or tooltips.
 */
export const getStandardTooltipText = (moderation?: MessageModeration | null): string => {
  if (!moderation?.flagged) return '';
  const notice = getModerationNoticeContent(moderation);
  return `${notice.title}: ${notice.message} ${notice.guidance}`;
};

export const getModerationConfig = (
  moderation?: MessageModeration | null
): ModerationStyleConfig | null => {
  if (!moderation || !moderation.flagged) return null;
  const level = (moderation.warningLevel || 'medium').toLowerCase();
  return MODERATION_SEVERITY_CONFIG[level] || MODERATION_SEVERITY_CONFIG.medium;
};

