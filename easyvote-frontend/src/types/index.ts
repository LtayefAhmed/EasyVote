export type Role = "STUDENT" | "CANDIDATE" | "ADMIN";

export type ElectionStatus = "UPCOMING" | "ONGOING" | "COMPLETED";

export type CandidateStatus = "PENDING" | "APPROVED" | "REJECTED";

export type NotificationType = "INFO" | "ELECTION_START" | "ELECTION_END" | "CANDIDATE_APPROVED";

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

// Additional Types Placeholder
export interface Election {}
export interface Candidate {}
export interface Vote {}
export interface Comment {}
export interface Question {}
export interface Notification {}
export interface ChatMessage {}

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
