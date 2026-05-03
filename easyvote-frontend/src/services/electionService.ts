import { api } from "@/lib/api"
import { Election } from "@/types"

export const electionService = {
  getAll: async (): Promise<Election[]> =>
    (await api.get("/elections")).data.data,

  getActive: async (): Promise<Election[]> =>
    (await api.get("/elections/active")).data.data,

  getById: async (id: number): Promise<Election> =>
    (await api.get(`/elections/${id}`)).data.data,

  create: async (data: Partial<Election>): Promise<Election> =>
    (await api.post("/elections", data)).data.data,

  update: async (id: number, data: Partial<Election>): Promise<Election> =>
    (await api.put(`/elections/${id}`, data)).data.data,

  delete: async (id: number) =>
    (await api.delete(`/elections/${id}`)).data,

  updateStatus: async (id: number, status: string): Promise<Election> =>
    (await api.patch(`/elections/${id}/status`, { status })).data.data,
}
