import { api } from "@/lib/api"
import { Comment, Question, Announcement, LikeToggle } from "@/types"

export const engagementService = {
  // ─── Likes ───
  toggleLike: async (candidateId: number): Promise<LikeToggle> =>
    (await api.post(`/candidates/${candidateId}/like`)).data.data,

  // ─── Comments ───
  postComment: async (candidateId: number, content: string): Promise<Comment> =>
    (await api.post(`/candidates/${candidateId}/comments`, { content })).data.data,

  getComments: async (candidateId: number): Promise<Comment[]> =>
    (await api.get(`/candidates/${candidateId}/comments`)).data.data,

  deleteComment: async (candidateId: number, commentId: number) =>
    (await api.delete(`/candidates/${candidateId}/comments/${commentId}`)).data,

  // ─── Questions ───
  askQuestion: async (candidateId: number, content: string): Promise<Question> =>
    (await api.post(`/candidates/${candidateId}/questions`, { content })).data.data,

  getQuestions: async (candidateId: number, answeredOnly?: boolean): Promise<Question[]> => {
    const params = answeredOnly !== undefined ? { answered: answeredOnly } : {}
    return (await api.get(`/candidates/${candidateId}/questions`, { params })).data.data
  },

  answerQuestion: async (
    candidateId: number,
    questionId: number,
    answer: string
  ): Promise<Question> =>
    (
      await api.post(`/candidates/${candidateId}/questions/${questionId}/answer`, { answer })
    ).data.data,

  // ─── Announcements ───
  getAnnouncements: async (candidateId: number): Promise<Announcement[]> =>
    (await api.get(`/candidates/${candidateId}/announcements`)).data.data,

  createAnnouncement: async (
    candidateId: number,
    title: string,
    content: string
  ): Promise<Announcement> =>
    (await api.post(`/candidates/${candidateId}/announcements`, { title, content })).data.data,

  updateAnnouncement: async (
    candidateId: number,
    id: number,
    data: { title?: string; content?: string }
  ): Promise<Announcement> =>
    (await api.put(`/candidates/${candidateId}/announcements/${id}`, data)).data.data,

  deleteAnnouncement: async (candidateId: number, id: number) =>
    (await api.delete(`/candidates/${candidateId}/announcements/${id}`)).data,
}
