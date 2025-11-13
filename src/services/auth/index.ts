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

export async function getMe(token: string) {
  try {
    const response = await api.get("/users/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const userData = response.data;

    // Se for venue, busca os dados completos do estabelecimento
    if (userData.role === "venue" && userData.id) {
      const venueResponse = await api.get(`/venues/user/${userData.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Adiciona os dados do venue ao userData
      userData.venue = venueResponse.data;
      // Usa a foto de perfil do venue como avatar
      userData.avatar = venueResponse.data.profilePhoto;
    }

    // Se for banda, busca os dados completos da banda
    if (userData.role === "band" && userData.id) {

      const bandResponse = await api.get(`/bands/user/${userData.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Adiciona os dados da banda ao userData
      userData.band = bandResponse.data;
      // Usa a foto de perfil da banda como avatar
      userData.avatar = bandResponse.data.profilePicture;
    }

    return userData;
  } catch (error) {
    throw error;
  }
}