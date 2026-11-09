import type { ListingDetail } from '@features/listings';

export const AI_CHAT_MESSAGE_MAX_LENGTH = 1000;
export const AI_CONVERSATIONS_PAGE_SIZE = 20;

export type AiResponseType = 'results' | 'no_results' | 'general' | 'service_error';

export interface AiChatCriteria {
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  roomTypes?: string[];
  amenityIds?: number[];
  universityCode?: string;
  provinceCode?: string;
  wardCode?: string;
}

export interface AiCriteriaDisplay {
  labels: string[];
  university: { code: string; name: string } | null;
  province: { code: string; name: string } | null;
  ward: { code: string; name: string } | null;
  amenities: { id: number; name: string }[];
  roomTypes: { value: string; label: string }[];
}

export interface AiRelaxationSuggestion {
  title: string;
  description: string;
  criteria: AiChatCriteria;
  matchedCount: number;
}

export interface AiStoredMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  type: AiResponseType | null;
  listingIds: string[];
  matchedCount: number | null;
  criteria: AiChatCriteria | null;
  createdAt: string;
}

export interface AiChatReply {
  conversationId: string | null;
  type: AiResponseType;
  errorCode: string | null;
  answer: string;
  criteria: AiChatCriteria;
  criteriaDisplay: AiCriteriaDisplay;
  matchedCount: number;
  totalActiveCount: number;
  listingIds: string[];
  listings: ListingDetail[];
  suggestions: AiRelaxationSuggestion[];
  userMessage: AiStoredMessage | null;
  assistantMessage: AiStoredMessage | null;
}

export interface SendAiMessagePayload {
  message: string;
  conversationId?: string;
  criteria?: AiChatCriteria;
}

export interface AiConversationSummary {
  id: string;
  title: string;
  messageCount: number;
  suggestedListingCount: number;
  lastMessageAt: string;
  createdAt: string;
}

export interface AiConversationPage {
  items: AiConversationSummary[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
}

export interface AiConversationDetail {
  id: string;
  title: string;
  criteria: AiChatCriteria;
  criteriaDisplay: AiCriteriaDisplay;
  lastMessageAt: string;
  messages: AiStoredMessage[];
  listings: ListingDetail[];
}

export interface AiAssistantContent {
  type: AiResponseType;
  answer: string;
  errorCode: string | null;
  criteria: AiChatCriteria | null;
  criteriaDisplay: AiCriteriaDisplay | null;
  matchedCount: number;
  totalActiveCount: number | null;
  listings: ListingDetail[];
  suggestions: AiRelaxationSuggestion[];
  createdAt: string;
  retryPayload: SendAiMessagePayload | null;
}

export type AiChatTurn =
  | { id: string; role: 'user'; content: string }
  | { id: string; role: 'pending' }
  | { id: string; role: 'assistant'; content: AiAssistantContent };
