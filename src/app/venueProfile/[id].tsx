import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  StatusBar,
  Linking,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons, Entypo, FontAwesome5 } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import api from "@/src/services/api";

interface Venue {
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
}

const normalizeImageUrl = (url: string | null | undefined) => {
  if (!url) return null;
  if (url.startsWith("http")) return url;

  if (url.startsWith("/")) {
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    if (supabaseUrl && supabaseUrl.startsWith("https://")) {
      return `${supabaseUrl}/storage/v1/object/public/gig${url}`;
    }
  }
  return null;
};

export default function VenueProfile() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [venue, setVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVenue = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/venues/${id}`);
        setVenue(response.data);
      } catch (error) {
        console.error("Erro ao buscar estabelecimento:", error);
        Alert.alert("Erro", "Não foi possível carregar o estabelecimento.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchVenue();
    }
  }, [id]);

  const getImageSource = (img: any) => {
    if (!img) {
      return { uri: "https://via.placeholder.com/400x200?text=Sem+imagem" };
    }
    const normalized = normalizeImageUrl(img);
    return {
      uri: normalized || "https://via.placeholder.com/400x200?text=Sem+imagem",
    };
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#000" />
        <Text className="mt-4 text-gray-600">
          Carregando estabelecimento...
        </Text>
      </SafeAreaView>
    );
  }

  if (!venue) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center p-4">
        <Ionicons name="business" size={64} color="#9CA3AF" />
        <Text className="text-lg font-bold text-gray-900 mt-4">
          Estabelecimento não encontrado
        </Text>
        <TouchableOpacity
          className="mt-4 px-6 py-3 bg-black rounded-lg"
          onPress={() => router.back()}
        >
          <Text className="text-white font-semibold">Voltar</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />
      <ScrollView
        className="flex-1 bg-white"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* CAPA */}
        <View className="w-full h-44 bg-gray-300 overflow-hidden">
          <Image
            source={getImageSource(venue.coverPhoto)}
            className="w-full h-full"
            resizeMode="cover"
          />

          <TouchableOpacity
            className="absolute top-4 left-4 bg-black bg-opacity-50 p-2 rounded-full"
            activeOpacity={0.8}
            onPress={() => router.push("/(tabs)/search")}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* HEADER */}
        <View className="-mt-16 px-4 items-center">
          <View className="w-28 h-28 rounded-xl overflow-hidden border-4 border-white shadow-md bg-white">
            <Image
              source={getImageSource(venue.profilePhoto)}
              className="w-full h-full"
            />
          </View>

          <View className="mt-3 items-center w-full">
            <Text className="text-lg font-bold text-center">{venue.name}</Text>
            <Text className="text-sm text-gray-600 mt-1 mb-2">
              {venue.type}
            </Text>
          </View>
        </View>

        {/* INFO */}
        <View className="flex-row justify-between mx-4 mt-5">
          <View className="flex-1 bg-white border border-gray-200 mx-1 p-3 rounded-lg items-center shadow-sm">
            <Ionicons name="business" size={18} />
            <Text className="text-sm text-gray-700 mt-1">{venue.type}</Text>
          </View>

          <View className="flex-1 bg-white border border-gray-200 mx-1 p-3 rounded-lg items-center shadow-sm">
            <Entypo name="location-pin" size={18} />
            <Text className="text-sm text-gray-700 mt-1">{venue.city}</Text>
          </View>

          {venue.contact && (
            <View className="flex-1 bg-white border border-gray-200 mx-1 p-3 rounded-lg items-center shadow-sm">
              <Ionicons name="call" size={18} />
              <Text className="text-sm text-gray-700 mt-1" numberOfLines={1}>
                Contato
              </Text>
            </View>
          )}
        </View>

        {/* DESCRIÇÃO */}
        <Text className="text-base font-bold mt-6 mb-2 ml-4">Descrição</Text>
        <View className="mx-4 bg-white rounded-xl p-4 border border-gray-200 shadow-md">
          <Text className="text-sm text-gray-800 leading-5">
            {venue.description || "Sem descrição"}
          </Text>
        </View>

        {/* ENDEREÇO */}
        {venue.address && (
          <>
            <Text className="text-base font-bold mt-6 mb-2 ml-4">Endereço</Text>
            <View className="mx-4 bg-white rounded-xl p-4 border border-gray-200 shadow-md">
              <View className="flex-row items-start">
                <Entypo name="location-pin" size={20} color="#3b82f6" />
                <Text className="ml-2 text-sm text-gray-800 leading-5 flex-1">
                  {venue.address}
                </Text>
              </View>
            </View>
          </>
        )}

        {/* REDES SOCIAIS */}
        <Text className="text-base font-bold mt-6 mb-2 ml-4">
          Redes Sociais
        </Text>
        <View className="mx-4 space-y-3">
          <TouchableOpacity
            className="flex-row items-center bg-white p-3 rounded-xl border border-gray-200 shadow-md"
            disabled={!venue.instagram}
            onPress={() => venue.instagram && Linking.openURL(venue.instagram)}
          >
            <FontAwesome5 name="instagram" size={22} color="#C13584" />
            <Text className="ml-3 text-sm text-gray-800">
              {venue.instagram || "Sem Instagram"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center bg-white p-3 rounded-xl border border-gray-200 shadow-md"
            disabled={!venue.facebook}
            onPress={() => venue.facebook && Linking.openURL(venue.facebook)}
          >
            <FontAwesome5 name="facebook" size={22} color="#3b5998" />
            <Text className="ml-3 text-sm text-gray-800">
              {venue.facebook || "Sem Facebook"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center bg-white p-3 rounded-xl border border-gray-200 shadow-md"
            disabled={!venue.twitter}
            onPress={() => venue.twitter && Linking.openURL(venue.twitter)}
          >
            <FontAwesome5 name="twitter" size={22} color="#1DA1F2" />
            <Text className="ml-3 text-sm text-gray-800">
              {venue.twitter || "Sem Twitter"}
            </Text>
          </TouchableOpacity>
        </View>

        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}
