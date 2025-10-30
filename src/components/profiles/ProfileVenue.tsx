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
} from "lucide-react-native";
import { getMe } from "@/src/services/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, useFocusEffect } from "expo-router";
import api from "../../services/api";

const { width } = Dimensions.get("window");
const ITEM_WIDTH = width - 32;
const ITEM_MARGIN_RIGHT = 12;
const ITEM_FULL_WIDTH = ITEM_WIDTH + ITEM_MARGIN_RIGHT;

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
  events?: { name: string; action: string }[];
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

// Função para normalizar URLs de imagem do Supabase
// Função para normalizar URLs de imagem do Supabase
const normalizeImageUrl = (url: string | null | undefined) => {
  if (!url) return null;

  console.log('URL original:', url);

  // Se já é uma URL completa (http ou https)
  if (url.startsWith('http')) {
    console.log('Já é URL completa');
    return url;
  }

  // Se é um caminho do Supabase (começa com /)
  if (url.startsWith('/')) {
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;

    console.log('Supabase URL from env:', supabaseUrl);

    // Verifica se a variável de ambiente está definida e é uma URL válida
    if (supabaseUrl && supabaseUrl.startsWith('https://')) {
      const fullUrl = `${supabaseUrl}/storage/v1/object/public/gig${url}`;
      console.log('URL construída:', fullUrl);
      return fullUrl;
    } else {
      console.warn('EXPO_PUBLIC_SUPABASE_URL não está definida ou é inválida');

      // FALLBACK: Substitua pelo SEU_PROJECT_ID real
      const fallbackUrl = `https://SEU_PROJECT_ID.supabase.co/storage/v1/object/public/gig${url}`;
      console.log('Usando fallback URL:', fallbackUrl);
      return fallbackUrl;
    }
  }

  console.log('Formato não reconhecido, retornando null');
  return null;
};

export default function ProfileVenue(): JSX.Element {
  const [venueData, setVenueData] = useState<VenueDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [showDropdown, setShowDropdown] = useState(false);

  const router = useRouter();

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

          console.log('Dados do usuário:', userResponse);

          if (userResponse.role === "venue" && userResponse.venue) {
            // Busca os dados completos do venue (igual ao componente de edição)
            const venueResponse = await api.get(`/venues/user/${userResponse.id}`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            console.log('Dados completos do venue:', venueResponse.data);

            setVenueData(venueResponse.data);
          } else {
            setError("Usuário logado não é um estabelecimento ou dados incompletos.");
          }
        } catch (e) {
          console.error("Erro ao carregar perfil:", e);
          setError("Não foi possível carregar o perfil. Verifique sua conexão.");
        } finally {
          setLoading(false);
        }
      };

      fetchVenueData();
    }, [])
  );

  const data = useMemo(() => {
    const normalizedHeaderImage = normalizeImageUrl(venueData?.coverPhoto);
    const normalizedProfileImage = normalizeImageUrl(venueData?.profilePhoto);

    console.log('URLs normalizadas:', {
      headerImage: normalizedHeaderImage,
      profileImage: normalizedProfileImage,
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL
    });

    return {
      name: venueData?.name ?? "",
      category: venueData?.type ?? "",
      location: venueData?.city ?? "",
      headerImage: normalizedHeaderImage || DEFAULT_IMAGE,
      profileImage: normalizedProfileImage || DEFAULT_IMAGE,
      description: venueData?.description || "O estabelecimento ainda não adicionou uma descrição.",
      photos: venueData?.photos || [],
      events: venueData?.events || [],
      socials: [
        { name: "Instagram", link: venueData?.instagram, icon: <ExternalLink size={18} color="#4B5563" /> },
        { name: "Facebook", link: venueData?.facebook, icon: <ExternalLink size={18} color="#4B5563" /> },
        { name: "Twitter", link: venueData?.twitter, icon: <ExternalLink size={18} color="#4B5563" /> },
      ].filter(s => s.link),
      followers: DEFAULT_FOLLOWERS,
    };
  }, [venueData]);

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
        <Text className="text-gray-600 text-center">{error || "Perfil não encontrado."}</Text>
      </View>
    );
  }

  const handleScroll = (
    event: NativeSyntheticEvent<NativeScrollEvent>
  ): void => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / ITEM_FULL_WIDTH);

    if (currentIndex !== activeIndex) {
      setActiveIndex(currentIndex);
    }
  };

  return (
    <View className="flex-1 bg-white">

      <Image
        source={{ uri: data.headerImage }}
        className="w-full h-48 bg-gray-200"
        contentFit="cover"
        onError={(e) => {
          console.log('Erro ao carregar header image:', e);
          console.log('URL tentada:', data.headerImage);
        }}
        transition={300}
      />
      <View className="absolute top-32 left-4 z-10">
        <Image
          source={{ uri: data.profileImage }}
          className="w-24 h-24 rounded-full border-4 border-white bg-gray-200"
          contentFit="cover"
          onError={(e) => {
            console.log('Erro ao carregar profile image:', e);
            console.log('URL tentada:', data.profileImage);
          }}
          transition={300}
        />
      </View>

      <TouchableOpacity
        className="absolute top-10 left-4 p-2 bg-white/70 rounded-full z-20"
        onPress={() => router.back()}
      >
        <ArrowLeft size={24} color="#000" />
      </TouchableOpacity>

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
            }}
          >
            <LogOut size={18} color="#4B5563" />
            <Text className="text-gray-700">Sair</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView className="flex-1 bg-white rounded-t-xl" contentContainerStyle={{ paddingTop: 20 }}>
        <View className="p-4 space-y-6">
          {/* INFORMAÇÕES BÁSICAS - Ajustado para dar espaço para a foto */}
          <View className="space-y-1 pb-2">
            <Text className="text-3xl font-bold text-gray-900">
              {data.name}
            </Text>
            <Text className="text-gray-500 text-sm">
              {data.category}
            </Text>
          </View>

          {/* BOTÕES DE INFORMAÇÃO E AÇÃO */}
          <View className="flex-row justify-around p-4 border border-gray-200 rounded-lg">
            {/* Seguidores */}
            <View className="items-center space-y-1">
              <Users size={20} color="#4B5563" />
              <Text className="text-sm text-gray-700 font-bold">
                {data.followers}
              </Text>
              <Text className="text-xs text-gray-500">seguidores</Text>
            </View>

            <View className="w-px h-10 bg-gray-200" />

            {/* Localização */}
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

          {/* 5. NOSSOS EVENTOS */}
          <View className="space-y-3 pt-4 border border-gray-200 rounded-lg p-4">
            <Text className="text-xl font-bold text-gray-900">
              Nossos eventos
            </Text>
            {data.events.length > 0 ? (
              data.events.map((event, index: number) => (
                <View
                  key={index}
                  className="flex-row justify-between items-center py-2"
                >
                  <View className="flex-row items-center space-x-2">
                    <Music size={20} color="#4B5563" />
                    <Text className="text-gray-700 text-base">{event.name}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() =>
                      console.log(`Ação: ${event.action} ${event.name}`)
                    }
                    className="px-4 py-2 border border-black bg-white rounded-lg shadow-sm"
                  >
                    <Text className="text-black font-semibold text-sm">
                      {event.action}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text className="text-gray-500 italic text-center py-4">
                Nenhum evento agendado.
              </Text>
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
                    <Text className="text-gray-700 text-base">{social.name}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => console.log(`Acessar: ${social.link}`)}
                    className="px-4 py-2 border border-black bg-white rounded-lg shadow-sm"
                  >
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