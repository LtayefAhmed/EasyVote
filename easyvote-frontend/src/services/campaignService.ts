import { api } from "@/lib/api"

export interface CandidateResponse {
  id: number
  userId: number
  fullName: string
  email: string
  slogan: string
  program: string
  photoUrl: string | null
  status: "PENDING" | "VALIDATED" | "REJECTED"
  electionId: number
  electionTitle: string
  likeCount: number
  likedByCurrentUser: boolean
  createdAt: string
}

export interface CommentResponse {
  id: number
  authorName: string
  content: string
  createdAt: string
}

export interface QuestionResponse {
  id: number
  askerName: string
  content: string
  answer: string | null
  createdAt: string
  answeredAt: string | null
}

export interface AnnouncementResponse {
  id: number
  content: string
  createdAt: string
}

export const campaignService = {
  getCandidates: (electionId: number) =>
    api.get<CandidateResponse[]>(`/campaigns/candidates?electionId=${electionId}`),

  getCandidate: (candidateId: number) =>
    api.get<CandidateResponse>(`/campaigns/candidates/${candidateId}`),

  applyCandidate: (data: { slogan: string; program: string; electionId: number }) =>
    api.post<CandidateResponse>(`/campaigns/candidates/apply`, data),

  uploadPhoto: (candidateId: number, file: File) => {
    const formData = new FormData()
    formData.append("file", file)
    return api.post<string>(`/campaigns/candidates/${candidateId}/photo`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  },

  toggleLike: (candidateId: number) =>
    api.post<{ likeCount: number }>(`/campaigns/candidates/${candidateId}/like`),

  getComments: (candidateId: number) =>
    api.get<CommentResponse[]>(`/campaigns/candidates/${candidateId}/comments`),

  addComment: (candidateId: number, content: string) =>
    api.post<CommentResponse>(`/campaigns/candidates/${candidateId}/comments`, { content }),

  getQuestions: (candidateId: number) =>
    api.get<QuestionResponse[]>(`/campaigns/candidates/${candidateId}/questions`),

  askQuestion: (candidateId: number, content: string) =>
    api.post<QuestionResponse>(`/campaigns/candidates/${candidateId}/questions`, { content }),

  answerQuestion: (questionId: number, answer: string) =>
    api.put<QuestionResponse>(`/campaigns/candidates/questions/${questionId}/answer`, { answer }),

  getAnnouncements: (candidateId: number) =>
    api.get<AnnouncementResponse[]>(`/campaigns/candidates/${candidateId}/announcements`),

  addAnnouncement: (candidateId: number, content: string) =>
    api.post<AnnouncementResponse>(`/campaigns/candidates/${candidateId}/announcements`, { content }),

  getPendingCandidates: (electionId: number) =>
    api.get<CandidateResponse[]>(`/campaigns/admin/candidates/pending?electionId=${electionId}`),

  getAllCandidates: (electionId: number) =>
    api.get<CandidateResponse[]>(`/campaigns/admin/candidates?electionId=${electionId}`),

  validateCandidate: (candidateId: number, approve: boolean) =>
    api.put<CandidateResponse>(`/campaigns/admin/candidates/${candidateId}/validate?approve=${approve}`),
}