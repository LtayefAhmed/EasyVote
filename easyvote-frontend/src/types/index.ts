export type Role = "STUDENT" | "CANDIDATE" | "ADMIN";

export type ElectionStatus = "DRAFT" | "CAMPAIGN_ACTIVE" | "VOTE_ACTIVE" | "CLOSED";

export type CandidateStatus = "PENDING" | "VALIDATED" | "REJECTED";

export type NotificationType = "CAMPAIGN_STARTED" | "VOTE_STARTED" | "VOTE_ENDED" | "CANDIDATE_VALIDATED" | "NEW_COMMENT" | "NEW_QUESTION" | "QUESTION_ANSWERED" | "RESULTS_PUBLISHED";

export interface User {
  id: number;
  email: string;
  fullName: string;
  role: Role;
  studentId?: string;
  profilePicture?: string;
  isVerified: boolean;
}

export interface UserSummary {
  id: number;
  email: string;
  fullName: string;
  role: Role;
  isVerified: boolean;
  profilePicture?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: UserSummary;
}

export interface RegisterResponse {
  message: string;
  email: string;
  otpSent: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

// ───── Module 1 : Campaigns ─────

export interface Election {
  id: number;
  title: string;
  description: string;
  campaignStart: string;
  campaignEnd: string;
  voteStart: string;
  voteEnd: string;
  status: ElectionStatus;
  totalCandidates: number;
  totalVotes: number;
  campaignActive: boolean;
  voteActive: boolean;
  createdAt: string;
}

export interface Candidate {
  id: number;
  userId: number;
  userFullName: string;
  userEmail: string;
  electionId: number;
  electionTitle: string;
  slogan: string;
  program: string;
  photoUrl?: string;
  status: CandidateStatus;
  likesCount: number;
  commentsCount: number;
  questionsCount: number;
  likedByMe: boolean;
  createdAt: string;
}

export interface Comment {
  id: number;
  candidateId: number;
  userId: number;
  userFullName: string;
  userInitials: string;
  content: string;
  createdAt: string;
  mine: boolean;
}

export interface Question {
  id: number;
  candidateId: number;
  userId: number;
  userFullName: string;
  userInitials: string;
  content: string;
  answer?: string;
  createdAt: string;
  answeredAt?: string;
  answered: boolean;
}

export interface Announcement {
  id: number;
  candidateId: number;
  candidateName: string;
  title: string;
  content: string;
  createdAt: string;
}

export interface LikeToggle {
  liked: boolean;
  totalLikes: number;
}

// ───── Module 2 : Vote ─────

export interface VoteStatusResponse {
  hasVoted: boolean;
  canVote: boolean;
  voteEndAt: string;
  message: string;
}

export interface VoteResponse {
  message: string;
  confirmationCode: string;
  votedAt: string;
}

export interface CandidateVoteResult {
  candidateId: number;
  fullName: string;
  slogan: string;
  photoUrl?: string;
  votes: number;
  percentage: number;
  rank: number;
}

export interface ElectionResultsResponse {
  electionId: number;
  electionTitle: string;
  status: ElectionStatus;
  totalVotes: number;
  totalEligibleVoters: number;
  participationRate: number;
  results: CandidateVoteResult[];
  computedAt: string;
  isFinal: boolean;
}

export interface HourlyVoteStat {
  hour: string;
  count: number;
}

export interface ElectionStatsResponse {
  electionId: number;
  totalVotes: number;
  totalEligibleVoters: number;
  participationRate: number;
  votesLastHour: number;
  hourlyDistribution: HourlyVoteStat[];
  currentRanking: CandidateVoteResult[];
  updatedAt: string;
}

// ───── Module 3 : Chatbot & Notifications ─────

export type ChatRole = "USER" | "ASSISTANT"

export type AppNotificationType =
  | "CAMPAIGN_STARTED"
  | "VOTE_STARTED"
  | "VOTE_ENDED"
  | "CANDIDATE_VALIDATED"
  | "NEW_COMMENT"
  | "NEW_QUESTION"
  | "QUESTION_ANSWERED"
  | "RESULTS_PUBLISHED"

export interface ChatHistoryItem {
  id: number
  role: ChatRole
  content: string
  createdAt: string
}

export interface ChatMessageResponse {
  sessionId: string
  userMessage: string
  botResponse: string
  source: "RULES" | "AI"
  timestamp: string
  suggestedQuestions: string[]
}

export interface AppNotification {
  id: number
  type: AppNotificationType
  title: string
  content: string
  read: boolean
  link: string | null
  createdAt: string
}

// Requests
export interface RegisterRequest {
  email: string;
  password?: string;
  fullName: string;
  studentId?: string;
}

export interface LoginRequest {
  email: string;
  password?: string;
}

export interface OtpVerifyRequest {
  email: string;
  code: string;
}

export interface ApplyCandidateRequest {
  electionId: number;
  slogan: string;
  program: string;
}

export interface UpdateCandidateRequest {
  slogan?: string;
  program?: string;
}
