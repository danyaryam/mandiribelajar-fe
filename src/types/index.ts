// ----------------------------------------------------------------------
// Tipe inti dari api-contract.md §3.
// Representasi JSON yang dikirim/diterima dari backend (camelCase).
// Dihindari duplikasi manual — saat OpenAPI codegen aktif, ganti dengan
// hasil generate schema. Tetap divalidasi ulang di runtime (Zod).
// ----------------------------------------------------------------------

export type UUID = string;
export type ISODateTime = string;

export type EducationLevelCode = 'SD_MI' | 'SMP_MTS' | 'SMA_MA';

export type Difficulty = 'easy' | 'medium' | 'hard';

export type QuestionType = 'multiple_choice' | 'text';

export type PracticeStatus =
  | 'generating'
  | 'ready'
  | 'in_progress'
  | 'submitted'
  | 'generation_failed'
  | 'expired';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'expired' | 'refunded';

export type UserRole = 'guest' | 'student' | 'admin';

export type UsageLedgerType = 'credit' | 'reservation' | 'consume' | 'release' | 'refund';

// ---- Response envelope (api-contract.md §2) ---------------------------

export type CursorPagination = {
  nextCursor: string | null;
  hasMore: boolean;
};

export type ApiMeta = {
  requestId: string;
  pagination?: CursorPagination;
};

export type SuccessResponse<T> = {
  data: T;
  meta: ApiMeta;
};

export type ApiFieldError = Record<string, string[]>;

export type ApiErrorBody = {
  code: string;
  message: string;
  fields?: ApiFieldError;
  requestId: string;
};

export type ErrorResponse = {
  error: ApiErrorBody;
};

// ---- Catalog types (api-contract.md §6) -------------------------------

export type EducationLevel = {
  id: UUID;
  code: EducationLevelCode;
  name: string;
  slug: string;
};

export type Grade = {
  id: UUID;
  number: number;
  name: string;
  levelCode?: EducationLevelCode;
};

export type SubjectListItem = {
  id: UUID;
  slug: string;
  name: string;
  description: string;
};

export type TopicRef = {
  id: UUID;
  slug: string;
  name: string;
  description: string;
};

export type SubjectDetail = {
  id: UUID;
  slug: string;
  name: string;
  description: string;
  level: EducationLevel | null;
  grade: { id: UUID; number: number; name: string } | null;
  learningOutcomes: string[];
  topics: TopicRef[];
};

// ---- Practice types (api-contract.md §7) ------------------------------

export type PracticeSessionMeta = {
  id: UUID;
  status: PracticeStatus;
  estimatedQuestionCount: number;
  reservedUsage: number;
  createdAt: ISODateTime;
};

export type PracticeSessionStatus = {
  id: UUID;
  status: PracticeStatus;
  progress: { current: number; total: number };
  failureCode: string | null;
  retryable: boolean;
};

export type QuestionOption = {
  id: UUID;
  label: string;
  text: string;
};

export type PracticeQuestion = {
  id: UUID;
  position: number;
  type: QuestionType;
  prompt: string;
  options: QuestionOption[] | null;
  draftAnswer: { selectedOptionId?: UUID; text?: string } | null;
};

export type PracticeSession = {
  id: UUID;
  status: PracticeStatus;
  title: string;
  difficulty: Difficulty;
  questionCount: number;
  startedAt: ISODateTime | null;
  expiresAt: ISODateTime | null;
  questions: PracticeQuestion[];
};
