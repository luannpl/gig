import React, { useState, useRef, useEffect } from "react";
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
  Modal,
  TextInput,
  Alert,
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
import { Review, ReviewCreateDto } from "@/src/types/review";
import { createReview } from "@/src/services/reviews";
import createContract, { getVenueByUserId } from "@/src/services/contracts";
import { User } from "@/src/types/venue";

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

  const [user, setUser] = useState<User | null>(null);
  const [avaliacoes, setAvaliacoes] = useState<Review[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");

  // ✅ Modal Contratação
  const [modalContratarVisible, setModalContratarVisible] = useState(false);
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [eventType, setEventType] = useState("");
  const [budget, setBudget] = useState("");
  const [additionalDetails, setAdditionalDetails] = useState("");

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

  const renderStars = (rating: number, onSelect?: (r: number) => void) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const filled = i <= rating;
      stars.push(
        <TouchableOpacity
          key={i}
          activeOpacity={onSelect ? 0.7 : 1}
          onPress={() => onSelect && onSelect(i)}
        >
          <FontAwesome
            name={filled ? "star" : "star-o"}
            size={28}
            color={filled ? "#FFD700" : "#C0C0C0"}
            style={{ marginRight: 6 }}
          />
        </TouchableOpacity>
      );
    }
    return <View className="flex-row mt-1">{stars}</View>;
  };

  const renderAvaliacao = ({ item }: { item: Review }) => (
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

  const handleSubmitReview = async () => {
    if (newRating === 0 || !newComment.trim()) {
      Alert.alert("Erro", "Preencha todos os campos antes de enviar.");
      return;
    }
    if (!user) {
      Alert.alert(
        "Erro",
        "Você precisa estar logado para enviar uma avaliação."
      );
      return;
    }

    const newReview: ReviewCreateDto = {
      comment: newComment,
      rating: newRating,
      bandId: banda.id,
      userId: user.id,
    };
    const res = await createReview(newReview);
    if (!res) {
      Alert.alert("Erro", "Não foi possível enviar a avaliação.");
      return;
    }
    setModalVisible(false);
    setNewRating(0);
    setNewComment("");
    Alert.alert("Sucesso", "Avaliação enviada!");
    setAvaliacoes((prev) => [...prev, res]);
  };

  // ✅ Envio da contratação
  const handleSubmitContratacao = async () => {
    if (
      !eventName.trim() ||
      !eventDate.trim() ||
      !startTime.trim() ||
      !endTime.trim() ||
      !eventType.trim() ||
      !budget.trim()
    ) {
      Alert.alert("Erro", "Preencha todos os campos obrigatórios.");
      return;
    }

    if (!user) {
      Alert.alert(
        "Erro",
        "Você precisa estar logado para contratar uma banda."
      );
      return;
    }
    const venue = await getVenueByUserId(user.id);
    if (!venue) {
      Alert.alert(
        "Erro",
        "Você precisa ter um perfil de estabelecimento para contratar uma banda."
      );
      return;
    }
    const payload = {
      eventName,
      eventDate: new Date(eventDate),
      startTime,
      endTime,
      eventType,
      budget: parseFloat(budget),
      additionalDetails,
      isConfirmed: false,
      requesterId: venue.id,
      providerId: banda.id,
    };

    try {
      await createContract(payload);
      Alert.alert("Sucesso", "Pedido de contratação enviado!");
      setModalContratarVisible(false);

      // limpar campos
      setEventName("");
      setEventDate("");
      setStartTime("");
      setEndTime("");
      setEventType("");
      setBudget("");
      setAdditionalDetails("");
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível enviar a solicitação.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />
      <ScrollView
        className="flex-1 bg-white"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* CAPA */}
        <View
          style={{
            width: "100%",
            height: 176,
            backgroundColor: "#d1d5db",
            overflow: "hidden",
          }}
        >
          <Image
            source={
              banda.coverPicture
                ? getImageSource(banda.coverPicture)
                : require("./../../assets/images/icon.png")
            }
            style={{ width: "100%", height: "100%" }}
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

            {user && !(user.role == "band") && (
              <TouchableOpacity
                className="border border-black px-6 py-2 rounded-lg bg-black mt-2"
                activeOpacity={0.8}
                onPress={() => setModalContratarVisible(true)}
              >
                <Text className="font-semibold text-white">
                  Contratar Banda
                </Text>
              </TouchableOpacity>
            )}
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
        <View className="flex-row justify-between items-center mt-6 mb-2 mx-4">
          <Text className="text-base font-bold">Avaliações</Text>
          {user && !(user.role == "band") && (
            <TouchableOpacity
              className="bg-black px-4 py-2 rounded-lg"
              onPress={() => setModalVisible(true)}
            >
              <Text className="text-white font-semibold text-sm">Avaliar</Text>
            </TouchableOpacity>
          )}
        </View>

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

      {/* MODAL DE AVALIAÇÃO */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View className="flex-1 bg-black bg-opacity-50 justify-center items-center px-6">
          <View className="bg-white w-full rounded-2xl p-6 shadow-lg">
            <Text className="text-lg font-bold mb-4 text-center">
              Avaliar {banda.bandName}
            </Text>
            <View className="items-center mb-4">
              {renderStars(newRating, setNewRating)}
            </View>
            <TextInput
              placeholder="Escreva seu comentário..."
              value={newComment}
              onChangeText={setNewComment}
              multiline
              className="border border-gray-300 rounded-lg p-3 text-sm text-gray-800 h-28"
              textAlignVertical="top"
            />
            <View className="flex-row justify-between mt-5">
              <TouchableOpacity
                className="px-5 py-3 rounded-lg bg-gray-200"
                onPress={() => setModalVisible(false)}
              >
                <Text className="font-semibold text-gray-700">Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="px-5 py-3 rounded-lg bg-black"
                onPress={handleSubmitReview}
              >
                <Text className="font-semibold text-white">Enviar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ✅ MODAL DE CONTRATAÇÃO */}
      <Modal visible={modalContratarVisible} transparent animationType="slide">
        <View className="flex-1 bg-black bg-opacity-50 justify-center items-center px-6">
          <View className="bg-white w-full rounded-2xl p-6 shadow-lg max-h-[90%]">
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text className="text-lg font-bold mb-4 text-center">
                Contratar {banda.bandName}
              </Text>

              <TextInput
                placeholder="Nome do Evento"
                value={eventName}
                onChangeText={setEventName}
                className="border border-gray-300 rounded-lg p-3 text-sm mb-3"
              />

              <TextInput
                placeholder="Data do Evento (YYYY-MM-DD)"
                value={eventDate}
                onChangeText={setEventDate}
                className="border border-gray-300 rounded-lg p-3 text-sm mb-3"
              />

              <TextInput
                placeholder="Início (ex: 18:00)"
                value={startTime}
                onChangeText={setStartTime}
                className="border border-gray-300 rounded-lg p-3 text-sm flex-1 mr-2"
              />
              <TextInput
                placeholder="Término (ex: 22:30)"
                value={endTime}
                onChangeText={setEndTime}
                className="border border-gray-300 rounded-lg p-3 text-sm flex-1"
              />

              <TextInput
                placeholder="Tipo de Evento"
                value={eventType}
                onChangeText={setEventType}
                className="border border-gray-300 rounded-lg p-3 text-sm mt-3 mb-3"
              />

              <TextInput
                placeholder="Orçamento (ex: 2500.75)"
                value={budget}
                onChangeText={setBudget}
                keyboardType="numeric"
                className="border border-gray-300 rounded-lg p-3 text-sm mb-3"
              />

              <TextInput
                placeholder="Detalhes adicionais..."
                value={additionalDetails}
                onChangeText={setAdditionalDetails}
                multiline
                className="border border-gray-300 rounded-lg p-3 text-sm text-gray-800 h-28 mb-5"
                textAlignVertical="top"
              />

              <View className="flex-row justify-between">
                <TouchableOpacity
                  className="px-5 py-3 rounded-lg bg-gray-200"
                  onPress={() => setModalContratarVisible(false)}
                >
                  <Text className="font-semibold text-gray-700">Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="px-5 py-3 rounded-lg bg-black"
                  onPress={handleSubmitContratacao}
                >
                  <Text className="font-semibold text-white">
                    Enviar Pedido
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
