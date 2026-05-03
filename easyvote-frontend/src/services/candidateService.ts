import { api } from "@/lib/api"
import { Candidate, ApplyCandidateRequest, UpdateCandidateRequest } from "@/types"

export const candidateService = {
  getByElection: async (electionId: number): Promise<Candidate[]> =>
    (await api.get(`/candidates/by-election/${electionId}`)).data.data,

  getById: async (id: number): Promise<Candidate> =>
    (await api.get(`/candidates/${id}`)).data.data,

  apply: async (data: ApplyCandidateRequest): Promise<Candidate> =>
    (await api.post("/candidates/apply", data)).data.data,

  update: async (id: number, data: UpdateCandidateRequest): Promise<Candidate> =>
    (await api.put(`/candidates/${id}`, data)).data.data,

  getMyCandidacy: async (electionId: number): Promise<Candidate> =>
    (await api.get(`/candidates/my/${electionId}`)).data.data,

  uploadPhoto: async (candidateId: number, file: File): Promise<Candidate> => {
    const formData = new FormData()
    formData.append("file", file)
    const response = await api.post(`/candidates/${candidateId}/photo`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    return response.data.data
  },

  getPending: async (): Promise<Candidate[]> =>
    (await api.get("/candidates/admin/pending")).data.data,

  validate: async (id: number, status: "VALIDATED" | "REJECTED", adminNote?: string): Promise<Candidate> =>
    (await api.post(`/candidates/${id}/validate`, { status, adminNote })).data.data,
}
