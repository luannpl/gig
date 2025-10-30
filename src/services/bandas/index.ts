import api from "../api";

export async function getBandById(id: string) {
  try {
    const response = await api.get(`/bands/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function getBandByUserId(userId: string) {
  try {
    const response = await api.get(`/bands/user/${userId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
}
