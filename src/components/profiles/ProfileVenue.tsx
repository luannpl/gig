import React, { JSX, useState, useEffect, useMemo, ReactNode } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import {
  ArrowLeft,
  MapPin,
  Users,
  Music,
  ExternalLink,
  MoreVertical,
  Pencil,
  LogOut,
  Calendar,
  Clock,
  DollarSign,
  CheckCircle,
} from "lucide-react-native";
import { getMe } from "@/src/services/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, useFocusEffect } from "expo-router";
import api from "../../services/api";

const { width } = Dimensions.get("window");
const ITEM_WIDTH = width - 32;
const ITEM_MARGIN_RIGHT = 12;
const ITEM_FULL_WIDTH = ITEM_WIDTH + ITEM_MARGIN_RIGHT;

interface Contract {
  id: string;
  eventName: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  eventType: string;
  budget: string;
  additionalDetails?: string;
  status: "pending" | "confirmed" | "declined" | "canceled";
  provider: {
    // CORREÇÃO: mudar 'requester' para 'provider'
    id: number;
    bandName: string;
    city: string;
    genre: string;
    description: string | null;
    contact: string | null;
    members: string | null;
    twitter: string | null;
    instagram: string | null;
    facebook: string | null;
    profilePicture: string | null;
    coverPicture: string | null;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

interface VenueDetails {
  id: string;
  name: string;
  type: string;
  cep: string;
  city: string;
  description: string | null;
  address: string | null;
  contact: string | null;
  coverPhoto: string | null;
  profilePhoto: string | null;
  twitter: string | null;
  instagram: string | null;
  facebook: string | null;
  photos?: { uri: string }[];
}

interface UserMeResponse {
  id: string;
  email: string;
  role: "venue" | "band" | "user";
  name: string;
  venue: VenueDetails | null;
  band: any | null;
}

const DEFAULT_IMAGE = "";
const DEFAULT_FOLLOWERS = "0";

// Função para obter source da imagem
const getImageSource = (img: string | null | undefined) => {
  if (!img) {
    return null;
  }
  // Se já é uma URL completa, retorna diretamente
  if (typeof img === "string") {
    return img;
  }
  return null;
};

export default function ProfileVenue(): JSX.Element {
  const [venueData, setVenueData] = useState<VenueDetails | null>(null);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [contractsLoading, setContractsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [showDropdown, setShowDropdown] = useState(false);

  const router = useRouter();

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");
      router.replace("/(auth)/sign-in");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  // Função para verificar se o contrato está válido (confirmado e dentro do prazo)
  const isValidContract = (contract: Contract): boolean => {
    // 1. Verifica se o status é 'confirmed'
    if (contract.status !== "confirmed") {
      return false;
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const eventDate = new Date(contract.eventDate);

    // 2. Verifica se a data do evento é hoje ou no futuro
    if (eventDate < today) {
      return false;
    }

    // 3. Se for hoje, verifica se ainda não passou do horário de término
    if (eventDate.getTime() === today.getTime()) {
      const [endHours, endMinutes] = contract.endTime.split(":").map(Number);
      const endTime = new Date();
      endTime.setHours(endHours, endMinutes, 0, 0);

      if (now > endTime) {
        return false;
      }
    }

    return true;
  };

  // Função para buscar contratos do estabelecimento
  const fetchContracts = async (venueId: string, token: string) => {
    try {
      setContractsLoading(true);

      const url = `/contract/venue/${venueId}`;

      const response = await api.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setContracts(response.data);
    } catch (error: any) {
      console.error("🔍 [CONTRATOS-ERRO] Erro ao buscar contratos:", error);
      console.error("🔍 [CONTRATOS-ERRO] Status:", error.response?.status);
      console.error("🔍 [CONTRATOS-ERRO] Data:", error.response?.data);
      console.error("🔍 [CONTRATOS-ERRO] Mensagem:", error.message);

      if (error.response?.status === 404) {
        console.log("🔍 [CONTRATOS-INFO] Nenhum contrato encontrado (404)");
        setContracts([]);
      } else {
        // Para outros erros, também definir como array vazio
        setContracts([]);
      }
    } finally {
      setContractsLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      const fetchVenueData = async () => {
        try {
          setLoading(true);
          setError(null);

          const token = await AsyncStorage.getItem("token");
          if (!token) {
            setError("Token de autenticação não encontrado.");
            setLoading(false);
            return;
          }

          // Busca os dados do usuário
          const userResponse: UserMeResponse = await getMe(token || "");

          if (userResponse.role === "venue" && userResponse.venue) {
            // Busca os dados completos do venue
            const venueResponse = await api.get(
              `/venues/user/${userResponse.id}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            setVenueData(venueResponse.data);

            // Busca os contratos do estabelecimento
            await fetchContracts(venueResponse.data.id, token);
          } else {
            setError(
              "Usuário logado não é um estabelecimento ou dados incompletos."
            );
          }
        } catch (e: any) {
          console.error("🔍 [ERRO] Erro ao carregar perfil:", e);
          console.error("🔍 [ERRO] Mensagem:", e.message);
          console.error("🔍 [ERRO] Stack:", e.stack);
          setError(
            "Não foi possível carregar o perfil. Verifique sua conexão."
          );
        } finally {
          setLoading(false);
        }
      };

      fetchVenueData();
    }, [])
  );

  // Função para formatar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Verifica se é hoje
    if (date.toDateString() === today.toDateString()) {
      return "Hoje";
    }
    // Verifica se é amanhã
    if (date.toDateString() === tomorrow.toDateString()) {
      return "Amanhã";
    }

    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Função para formatar hora (remover segundos)
  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5);
  };

  // Função para obter texto do status
  const getStatusText = (status: string) => {
    switch (status) {
      case "confirmed":
        return "Confirmado";
      case "pending":
        return "Pendente";
      case "declined":
        return "Recusado";
      case "canceled":
        return "Cancelado";
      default:
        return status;
    }
  };

  // Função para verificar se o evento é hoje
  const isToday = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Função para verificar se o evento está acontecendo agora
  const isHappeningNow = (contract: Contract) => {
    if (!isToday(contract.eventDate)) {
      return false;
    }

    const now = new Date();
    const [startHours, startMinutes] = contract.startTime
      .split(":")
      .map(Number);
    const [endHours, endMinutes] = contract.endTime.split(":").map(Number);

    const startTime = new Date();
    startTime.setHours(startHours, startMinutes, 0, 0);

    const endTime = new Date();
    endTime.setHours(endHours, endMinutes, 0, 0);

    return now >= startTime && now <= endTime;
  };

  // Filtra apenas os contratos válidos (confirmados e dentro do prazo)
  // Filtra apenas os contratos válidos (confirmados e dentro do prazo)
  const validContracts = useMemo(() => {
    const valid = contracts.filter((contract) => {
      const isValid = isValidContract(contract);
      return isValid;
    });

    return valid;
  }, [contracts]);

  const data = useMemo(() => {
    const headerImage = getImageSource(venueData?.coverPhoto);
    const profileImage = getImageSource(venueData?.profilePhoto);

    console.log("Cover Photo do backend:", venueData?.coverPhoto);
    console.log("Profile Photo do backend:", venueData?.profilePhoto);

    return {
      name: venueData?.name ?? "",
      category: venueData?.type ?? "",
      location: venueData?.city ?? "",
      headerImage: headerImage || DEFAULT_IMAGE,
      profileImage: profileImage || DEFAULT_IMAGE,
      description:
        venueData?.description ||
        "O estabelecimento ainda não adicionou uma descrição.",
      photos: venueData?.photos || [],
      contracts: validContracts,
      socials: [
        {
          name: "Instagram",
          link: venueData?.instagram,
          icon: <ExternalLink size={18} color="#4B5563" />,
        },
        {
          name: "Facebook",
          link: venueData?.facebook,
          icon: <ExternalLink size={18} color="#4B5563" />,
        },
        {
          name: "Twitter",
          link: venueData?.twitter,
          icon: <ExternalLink size={18} color="#4B5563" />,
        },
      ].filter((s) => s.link),
      followers: DEFAULT_FOLLOWERS,
    };
  }, [venueData, validContracts]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#000000" />
        <Text className="mt-2 text-gray-600">Carregando perfil...</Text>
      </View>
    );
  }

  if (error || !venueData) {
    return (
      <View className="flex-1 justify-center items-center bg-white p-4">
        <Text className="text-lg font-bold text-red-600">Erro!</Text>
        <Text className="text-gray-600 text-center">
          {error || "Perfil não encontrado."}
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <View style={{ width: "100%", height: 192, backgroundColor: "#e5e7eb" }}>
        <Image
          source={{ uri: data.headerImage }}
          style={{ width: "100%", height: "100%" }}
          contentFit="cover"
          transition={300}
        />
      </View>

      <View className="absolute top-32 left-4 z-10">
        <Image
          source={{ uri: data.profileImage }}
          className="w-24 h-24 rounded-full border-4 border-white bg-gray-200"
          contentFit="cover"
          transition={300}
        />
      </View>

      <TouchableOpacity
        className="absolute top-10 right-4 p-2 bg-white/70 rounded-full z-20"
        onPress={() => setShowDropdown(!showDropdown)}
      >
        <MoreVertical size={24} color="#000" />
      </TouchableOpacity>

      {showDropdown && (
        <View className="absolute top-20 right-12 bg-white rounded-lg shadow-lg z-30 w-40">
          <TouchableOpacity
            className="flex-row items-center space-x-2 p-3 border-b border-gray-100"
            onPress={() => {
              setShowDropdown(false);
              router.push("/editVenueProfile");
            }}
          >
            <Pencil size={18} color="#4B5563" />
            <Text className="text-gray-700">Editar Perfil</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center space-x-2 p-3"
            onPress={() => {
              console.log("Sair");
              setShowDropdown(false);
              handleLogout();
            }}
          >
            <LogOut size={18} color="#4B5563" />
            <Text className="text-gray-700">Sair</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        className="flex-1 bg-white rounded-t-xl"
        contentContainerStyle={{ paddingTop: 60 }}
      >
        <View className="p-4 space-y-6">
          {/* INFORMAÇÕES BÁSICAS */}
          <View className="space-y-1 pb-2">
            <Text className="text-3xl font-bold text-gray-900">
              {data.name}
            </Text>
            <Text className="text-gray-500 text-sm">{data.category}</Text>
          </View>

          {/* BOTÕES DE INFORMAÇÃO E AÇÃO */}
          <View className="flex-row justify-around p-4 border border-gray-200 rounded-lg">
            <View className="items-center space-y-1">
              <Users size={20} color="#4B5563" />
              <Text className="text-sm text-gray-700 font-bold">
                {data.followers}
              </Text>
              <Text className="text-xs text-gray-500">seguidores</Text>
            </View>

            <View className="w-px h-10 bg-gray-200" />

            <View className="items-center space-y-1">
              <MapPin size={20} color="#4B5563" />
              <Text className="text-sm text-gray-700 font-bold">
                {data.location}
              </Text>
              <Text className="text-xs text-gray-500">Local</Text>
            </View>
          </View>

          {/* 4. DESCRIÇÃO */}
          <View className="space-y-3 pt-4 border border-gray-200 rounded-lg p-4">
            <Text className="text-xl font-bold text-gray-900">Descrição</Text>
            <Text className="text-gray-700 leading-relaxed text-base">
              {data.description}
            </Text>
          </View>

          {/* 5. EVENTOS/CONTRATOS VÁLIDOS */}
          <View className="space-y-3 pt-4 border border-gray-200 rounded-lg p-4">
            <View className="flex-row justify-between items-center">
              <Text className="text-xl font-bold text-gray-900">Eventos</Text>
              <Text className="text-sm text-gray-500">
                {contracts.length} total / {validContracts.length} válidos
              </Text>
            </View>

            {contractsLoading ? (
              <View className="py-4">
                <ActivityIndicator size="small" color="#000000" />
                <Text className="text-center text-gray-500 mt-2">
                  Carregando eventos...
                </Text>
              </View>
            ) : contracts.length > 0 ? (
              <View className="space-y-4">
                {contracts.map((contract) => {
                  const isValid = isValidContract(contract);
                  return (
                    <View
                      key={contract.id}
                      className={`bg-white border rounded-lg p-4 shadow-sm ${
                        isValid
                          ? "border-green-200"
                          : "border-gray-200 opacity-60"
                      }`}
                    >
                      <View className="flex-row justify-between items-start mb-2">
                        <Text className="text-lg font-semibold text-gray-900 flex-1">
                          {contract.eventName}
                        </Text>
                        <View
                          className={`px-2 py-1 rounded-full ${
                            contract.status === "confirmed"
                              ? "bg-green-100 text-green-800"
                              : contract.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          <Text className="text-xs font-medium">
                            {getStatusText(contract.status)}{" "}
                            {isValid ? "✓" : "✗"}
                          </Text>
                        </View>
                      </View>

                      <Text className="text-sm text-gray-600 mb-2">
                        Data: {formatDate(contract.eventDate)} |{" "}
                        {formatTime(contract.startTime)} -{" "}
                        {formatTime(contract.endTime)}
                      </Text>
                      <Text className="text-sm text-gray-600">
                        Banda: {contract.provider.bandName} | R${" "}
                        {parseFloat(contract.budget).toFixed(2)}
                      </Text>
                    </View>
                  );
                })}
              </View>
            ) : (
              <View className="py-8 items-center">
                <Calendar size={48} color="#9CA3AF" />
                <Text className="text-gray-500 text-center mt-2">
                  Nenhum contrato encontrado.
                </Text>
                <Text className="text-gray-400 text-center text-sm mt-1">
                  Verifique os logs no console para mais detalhes.
                </Text>
              </View>
            )}
          </View>

          {/* 6. REDES SOCIAIS */}
          <View className="space-y-3 pt-4 border border-gray-200 rounded-lg p-4">
            <Text className="text-xl font-bold text-gray-900">
              Redes Sociais
            </Text>
            {data.socials.length > 0 ? (
              data.socials.map((social, index: number) => (
                <View
                  key={index}
                  className="flex-row justify-between items-center py-2"
                >
                  <View className="flex-row items-center space-x-2">
                    {social.icon}
                    <Text className="text-gray-700 text-base">
                      {social.name}
                    </Text>
                  </View>
                  <TouchableOpacity className="px-4 py-2 border border-black bg-white rounded-lg shadow-sm">
                    <Text className="text-black font-semibold text-sm">
                      Acessar
                    </Text>
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text className="text-gray-500 italic text-center py-4">
                Nenhuma rede social adicionada.
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
