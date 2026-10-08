import type { LucideIcon } from 'lucide-react-native';

export type LegalTab = 'privacy' | 'terms';

export interface LegalSection {
  title: string;
  body: string;
}

export interface LegalDocument {
  tab: LegalTab;
  label: string;
  summary: string;
  shareUrl: string;
  sections: LegalSection[];
}

export type HelpTopicId = 'search' | 'deposit' | 'account' | 'landlord';

export interface HelpTopic {
  id: HelpTopicId;
  label: string;
  icon: LucideIcon;
  color: string;
  background: string;
}

export interface HelpArticle {
  id: string;
  topicId: HelpTopicId;
  question: string;
  answer: string;
  isFeatured?: boolean;
}
