import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Linking,
} from "react-native";
import {
  Ionicons,
  Entypo,
  FontAwesome,
  FontAwesome5,
} from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getBandById, getReviewsByBand } from "@/src/services/bandas";
import { Band } from "@/src/types/band";
import { Review } from "@/src/types/review";

export default function ProfileBand() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [banda, setBanda] = useState<Band>({
    id: 0,
    bandName: "",
    city: "",
    contact: null,
    coverPicture: null,
    createdAt: "",
    deletedAt: null,
    description: null,
    facebook: null,
    genre: "",
    instagram: null,
    members: null,
    profilePicture: null,
    twitter: null,
    updatedAt: "",
    userId: {
      id: "",
      role: "",
    },
  });

  const [activeIndex, setActiveIndex] = useState(0);
  const flatRef = useRef<FlatList<any> | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [avaliacoes, setAvaliacoes] = useState<Review[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const bandData = await getBandById(id as string);
      setBanda(bandData);
      const reviewsData = await getReviewsByBand(bandData.id);
      setAvaliacoes(reviewsData);
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    const carregarUser = async () => {
      const userData = await AsyncStorage.getItem("user");
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        return;
      }
      router.replace("/(auth)/sign-in");
      AsyncStorage.removeItem("token");
      AsyncStorage.removeItem("user");
    };
    carregarUser();
  }, []);

  const getImageSource = (img: any) => {
    if (!img) {
      return { uri: "https://via.placeholder.com/400x200?text=Sem+imagem" };
    }
    if (typeof img === "number") return img;
    if (typeof img === "string") return { uri: img };
    return img;
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FontAwesome
          key={i}
          name={i <= rating ? "star" : "star-o"}
          size={18}
          color={i <= rating ? "#FFD700" : "#C0C0C0"}
          style={{ marginRight: 2 }}
        />
      );
    }
    return <View className="flex-row mt-1">{stars}</View>;
  };

  const renderAvaliacao = ({ item }: { item: any }) => (
    <View className="bg-white border border-gray-200 rounded-xl p-4 mb-3 shadow-sm">
      <View className="flex-row justify-between items-center">
        <Text className="font-semibold text-gray-900">{item.user.name}</Text>
        <Text className="text-xs text-gray-500">
          {new Date(item.createdAt).toLocaleDateString("pt-BR")}
        </Text>
      </View>

      {renderStars(item.rating)}

      <Text className="text-sm text-gray-700 mt-2 leading-5">
        {item.comment}
      </Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />
      <ScrollView
        className="flex-1 bg-white"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* CAPA */}
        <View className="w-full h-44 justify-center items-center bg-gray-300 overflow-hidden">
          <Image
            source={
              banda.coverPicture
                ? getImageSource(banda.coverPicture)
                : require("./../../assets/images/icon.png")
            }
            className="w-full h-28 bg-gray-300 rounded-b-2xl"
            resizeMode="cover"
          />

          <TouchableOpacity
            className="absolute top-4 left-4 bg-black bg-opacity-50 p-2 rounded-full"
            activeOpacity={0.8}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* HEADER */}
        <View className="-mt-16 px-4 items-center">
          <View className="w-28 h-28 rounded-xl overflow-hidden border-4 border-white shadow-md bg-white">
            <Image
              source={
                banda.profilePicture
                  ? getImageSource(banda.profilePicture)
                  : require("./../../assets/images/icon.png")
              }
              className="w-full h-full"
            />
          </View>

          <View className="mt-3 items-center w-full">
            <Text className="text-lg font-bold text-center">
              {banda.bandName}
            </Text>
            <Text className="text-sm text-gray-600 mt-1 mb-2">
              {banda.genre}
            </Text>

            <TouchableOpacity
              className="border border-black px-6 py-2 rounded-lg bg-black mt-2"
              activeOpacity={0.8}
              onPress={() => console.log("Contratar Banda")}
            >
              <Text className="font-semibold text-white">Contratar Banda</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* INFO */}
        <View className="flex-row justify-between mx-4 mt-5">
          <View className="flex-1 bg-white border border-gray-200 mx-1 p-3 rounded-lg items-center shadow-sm">
            <Ionicons name="people" size={18} />
            <Text className="text-sm text-gray-700 mt-1">
              {banda.members ? `${banda.members} membros` : "Carreira Solo"}
            </Text>
          </View>

          <View className="flex-1 bg-white border border-gray-200 mx-1 p-3 rounded-lg items-center shadow-sm">
            <Entypo name="location-pin" size={18} />
            <Text className="text-sm text-gray-700 mt-1">{banda.city}</Text>
          </View>

          <View className="flex-1 bg-white border border-gray-200 mx-1 p-3 rounded-lg items-center shadow-sm">
            <FontAwesome name="music" size={18} />
            <Text className="text-sm text-gray-700 mt-1" numberOfLines={1}>
              {banda.genre}
            </Text>
          </View>
        </View>

        {/* DESCRIÇÃO */}
        <Text className="text-base font-bold mt-6 mb-2 ml-4">Descrição</Text>
        <View className="mx-4 bg-white rounded-xl p-4 border border-gray-200 shadow-md">
          <Text className="text-sm text-gray-800 leading-5">
            {banda.description || "Sem descrição"}
          </Text>
        </View>

        {/* REDES SOCIAIS */}
        <Text className="text-base font-bold mt-6 mb-2 ml-4">
          Redes Sociais
        </Text>

        <View className="mx-4 space-y-3">
          <TouchableOpacity
            className="flex-row items-center bg-white p-3 rounded-xl border border-gray-200 shadow-md"
            disabled={!banda.instagram}
            onPress={() => banda.instagram && Linking.openURL(banda.instagram)}
          >
            <FontAwesome5 name="instagram" size={22} color="#C13584" />
            <Text className="ml-3 text-sm text-gray-800">
              {banda.instagram || "Sem Instagram"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center bg-white p-3 rounded-xl border border-gray-200 shadow-md"
            disabled={!banda.facebook}
            onPress={() => banda.facebook && Linking.openURL(banda.facebook)}
          >
            <FontAwesome5 name="facebook" size={22} color="#3b5998" />
            <Text className="ml-3 text-sm text-gray-800">
              {banda.facebook || "Sem Facebook"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center bg-white p-3 rounded-xl border border-gray-200 shadow-md"
            disabled={!banda.twitter}
            onPress={() => banda.twitter && Linking.openURL(banda.twitter)}
          >
            <FontAwesome5 name="twitter" size={22} color="#1DA1F2" />
            <Text className="ml-3 text-sm text-gray-800">
              {banda.twitter || "Sem Twitter"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* AVALIAÇÕES */}
        <Text className="text-base font-bold mt-6 mb-2 ml-4">Avaliações</Text>

        <View className="mx-4">
          {avaliacoes.length > 0 ? (
            <FlatList
              data={avaliacoes}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderAvaliacao}
              scrollEnabled={false}
            />
          ) : (
            <Text className="text-sm text-gray-600">
              Nenhuma avaliação ainda.
            </Text>
          )}
        </View>

        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}
