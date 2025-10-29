import api from "../api";

export async function getBandById(id: string) {
  try {
    const response = await api.get(`/bands/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
}
