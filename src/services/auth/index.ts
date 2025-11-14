import { BandSignUpData, LoginData, VenueSignUpData } from "@/src/types/auth";
import api from "../api";

export interface Venue {
  id: string;
  name: string;
  type: string;
  city: string;
  address: string | null;
  description: string | null;
  contact: string | null;
  profilePhoto: string | null;
  coverPhoto: string | null;
  instagram: string | null;
  facebook: string | null;
  twitter: string | null;
  cep: string;
  createdAt: string;
  updatedAt: string;
}

export interface VenuesResponse {
  data: Venue[];
  total: number;
  page: number;
  lastPage: number;
}

/**
 * Busca um estabelecimento por ID
 */
export async function getVenueById(id: string): Promise<Venue> {
  try {
    const response = await api.get(`/venues/${id}`);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar estabelecimento:", error);
    throw error;
  }
}

/**
 * Lista todos os estabelecimentos com paginação
 */
export async function getVenues(page: number = 1, limit: number = 20): Promise<VenuesResponse> {
  try {
    const response = await api.get(`/venues?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error("Erro ao listar estabelecimentos:", error);
    throw error;
  }
}

/**
 * Busca estabelecimentos por nome
 */
export async function searchVenues(name: string, page: number = 1, limit: number = 20): Promise<VenuesResponse> {
  try {
    const response = await api.get(`/venues/pesquisa?name=${encodeURIComponent(name)}&page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error("Erro ao pesquisar estabelecimentos:", error);
    throw error;
  }
}

/**
 * Busca estabelecimentos por cidade
 */
export async function getVenuesByCity(city: string): Promise<Venue[]> {
  try {
    const response = await api.get(`/venues/city/${encodeURIComponent(city)}`);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar estabelecimentos por cidade:", error);
    throw error;
  }
}

/**
 * Busca estabelecimentos por tipo (ex: bar, restaurante, casa de shows)
 */
export async function getVenuesByType(type: string): Promise<Venue[]> {
  try {
    const response = await api.get(`/venues/type/${encodeURIComponent(type)}`);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar estabelecimentos por tipo:", error);
    throw error;
  }
}

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