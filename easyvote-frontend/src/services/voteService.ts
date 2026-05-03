import { api } from "@/lib/api"
import { VoteStatusResponse, VoteResponse, ElectionResultsResponse, ElectionStatsResponse } from "@/types"

export interface PublicStats {
  electionId: number
  electionTitle: string
  status: string
  totalVotes: number
  totalEligibleVoters: number
  participationRate: number
  updatedAt: string
}

export const voteService = {
  getVoteStatus: async (electionId: number): Promise<VoteStatusResponse> =>
    (await api.get(`/elections/${electionId}/vote/status`)).data.data,

  castVote: async (electionId: number, candidateId: number): Promise<VoteResponse> =>
    (await api.post(`/elections/${electionId}/vote`, { candidateId })).data.data,

  getResults: async (electionId: number): Promise<ElectionResultsResponse> =>
    (await api.get(`/elections/${electionId}/results`)).data.data,

  getPublicStats: async (electionId: number): Promise<PublicStats> =>
    (await api.get(`/elections/${electionId}/stats/public`)).data.data,

  downloadResultsPdf: async (electionId: number) => {
    const response = await api.get(`/elections/${electionId}/results/pdf`, {
      responseType: 'blob'
    })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `resultats-election-${electionId}.pdf`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  },

  // Admin
  generateTokens: async (electionId: number) =>
    (await api.post(`/admin/elections/${electionId}/generate-tokens`)).data,

  getLiveStats: async (electionId: number): Promise<ElectionStatsResponse> =>
    (await api.get(`/admin/elections/${electionId}/stats`)).data.data,
}
