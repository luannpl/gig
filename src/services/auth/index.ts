import { BandSignUpData, LoginData, VenueSignUpData } from "@/src/types/auth";
import api from "../api";

export async function bandSignUp(data: BandSignUpData) {
  try {
    const response = await api.post("/users", data);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function venueSignUp(data: VenueSignUpData) {
  try {
    const response = await api.post("/users", data);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function authSignIn(data: LoginData) {
  try {
    const response = await api.post("/auth/login", data);
    return response.data;
  } catch (error) {
    throw error;
  }
}
