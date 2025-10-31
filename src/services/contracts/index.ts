import { ContractDTO } from "@/src/types/contracts";
import api from "../api";
import { Venue } from "@/src/types/venue";

export default async function createContract(data: ContractDTO) {
  try {
    const response = await api.post("/contract", data);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function getVenueByUserId(userId: string): Promise<Venue | null> {
  try {
    const response = await api.get(`/venues/user/${userId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
}
