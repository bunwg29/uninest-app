export * from './constants';

export type ForumCategory = 'roommate' | 'experience' | 'question' | 'area_review';

export type ForumPostStatus = 'draft' | 'published' | 'hidden';

export type ForumCommentStatus = 'published' | 'hidden';

export type RoommateGender = 'female' | 'male' | 'any';

export type RoommateStatus = 'open' | 'full';

export type ForumReportReason =
  'scam' | 'false_information' | 'contact_information' | 'harassment' | 'spam' | 'other';

export type ForumReportEntityType = 'forum_post' | 'forum_comment';

export type ModerationAction = 'warn' | 'block';

export type ModerationViolationType = 'keyword' | 'phone_number' | 'bank_account';

export type ModeratedField =
  'title' | 'content' | 'roommate.costNote' | 'roommate.lifestyle' | 'roommate.area';

export interface ForumAuthor {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  school: string | null;
  roleId: number | null;
}

export type RoommateSmoking = 'no' | 'outside' | 'ok';
export type RoommateTidiness = 'very_tidy' | 'tidy' | 'relaxed';
export type RoommateBedtime = 'before_23' | 'before_01' | 'flexible';
export type RoommatePets = 'no' | 'ok';
export type RoommateCooking = 'often' | 'sometimes' | 'no';

export interface RoommateLifestyle {
  smoking?: RoommateSmoking | null;
  tidiness?: RoommateTidiness | null;
  bedtime?: RoommateBedtime | null;
  pets?: RoommatePets | null;
  cooking?: RoommateCooking | null;
}

export type RoommateLifestyleKey = keyof RoommateLifestyle;

export interface RoommateCriteria extends RoommateLifestyle {
  provinceCode?: string | null;
  wardCode?: string | null;
  provinceName?: string | null;
  wardName?: string | null;
  streetAddress?: string | null;
  gender: RoommateGender;
  genderLabel?: string;
  costPerPerson: number;
  costNote: string | null;
  moveInDate: string | null;
  minStayMonths: number | null;
  lifestyle: string | null;
  area: string | null;
}

export interface ForumPost {
  id: string;
  category: ForumCategory;
  categoryLabel: string;
  title: string;
  content: string;
  imageKeys: string[];
  imageUrls: string[];
  roommate: RoommateCriteria | null;
  roommateStatus: RoommateStatus | null;
  roommateStatusLabel: string | null;
  status: ForumPostStatus;
  likeCount: number;
  commentCount: number;
  viewCount: number;
  isLiked: boolean;
  isOwner: boolean;
  canManage: boolean;
  author: ForumAuthor;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ForumComment {
  id: string;
  postId: string;
  parentId: string | null;
  content: string;
  status: ForumCommentStatus;
  isOwner: boolean;
  canManage: boolean;
  author: ForumAuthor;
  createdAt: string;
  updatedAt: string;
  replyCount?: number;
  replies?: ForumComment[];
}

export interface ForumFeedFilters {
  category?: ForumCategory;
  keyword?: string;
  gender?: RoommateGender;
  maxCost?: number;
  area?: string;
  roommateStatus?: RoommateStatus;
}

export interface RoommateCriteriaPayload extends RoommateLifestyle {
  provinceCode?: string;
  wardCode?: string;
  streetAddress?: string;
  gender: RoommateGender;
  costPerPerson: number;
  costNote?: string;
  moveInDate?: string;
  minStayMonths?: number;
  lifestyle?: string;
  area?: string;
}

export interface SaveForumPostPayload {
  category: ForumCategory;
  title: string;
  content: string;
  imageKeys?: string[];
  roommate?: RoommateCriteriaPayload;
  roommateStatus?: RoommateStatus;
  isDraft?: boolean;
  acknowledgeWarnings?: boolean;
}

export interface CreateForumCommentPayload {
  content: string;
  parentId?: string;
  acknowledgeWarnings?: boolean;
}

export interface ForumReportPayload {
  entityType: ForumReportEntityType;
  entityId: string;
  reason: ForumReportReason;
  note?: string;
}

export interface ForumReportResult {
  targetType: 'post' | 'comment';
  targetId: string;
  reason: ForumReportReason;
  reasonLabel: string;
  isHidden: boolean;
}

export interface ForumLikeResult {
  postId: string;
  isLiked: boolean;
  likeCount: number;
}

export interface ModerationViolation {
  field: ModeratedField;
  fieldLabel: string;
  type: ModerationViolationType;
  action: ModerationAction;
  label: string;
  message: string;
  matches: string[];
}

export interface ModerationResult {
  isClean: boolean;
  isBlocked: boolean;
  hasWarnings: boolean;
  violations: ModerationViolation[];
  sanitized: Partial<Record<ModeratedField, string>>;
}

export interface ModerationCheckPayload {
  title?: string;
  content?: string;
  roommate?: {
    costNote?: string;
    lifestyle?: string;
    area?: string;
  };
}

export interface ForumLocalImage {
  uri: string;
  fileName: string;
  contentType: string;
  uploadedKey?: string;
}
