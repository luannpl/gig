import { Review, ReviewCreateDto } from "@/src/types/review";
import api from "../api";

export async function createReview(data: ReviewCreateDto) {
  try {
    const response = await api.post("/reviews", data);
    return response.data;
  } catch (error) {
    throw error;
  }
}
