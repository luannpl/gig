import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  Dimensions,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getMe } from "../services/auth";

const { width } = Dimensions.get("window");

export default function EditBandProfile() {
  const router = useRouter();
  const [venueId, setVenueId] = useState<number | null>(null);
  const [venueName, setVenueName] = useState("");
  const [type, setType] = useState("");
  const [city, setCity] = useState("");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchVenue() {
      const user = await getMe((await AsyncStorage.getItem("token")) || "");
      const userId = user.id;
      setVenueId(userId || null);
      if (!userId) return;
      console.log("Buscando dados do estabelecimento com ID:", venueId);
      try {
        const response = await api.get(`/venues/user/${userId}`);
        const data = response.data;
        setVenueName(data.name || "");
        setType(data.type || "");
        setCity(data.city || "");
        setCoverImage(data.coverImage || null);
        setProfileImage(data.profileImage || null);
      } catch (error) {
        console.log("Erro ao buscar venue:", error);
        Alert.alert("Erro", "Não foi possível carregar os dados da venue.");
      }
    }
    fetchVenue();
  }, []);

  const pickImage = async (type: "cover" | "profile") => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      if (type === "cover") {
        setCoverImage(result.assets[0].uri);
      } else if (type === "profile") {
        setProfileImage(result.assets[0].uri);
      }
    }
  };

  const getToken = async () => await AsyncStorage.getItem("token");

  const handleSave = async () => {
    if (!venueId) {
      Alert.alert("Erro", "ID do usuário não encontrado. Tente relogar.");
      return;
    }
    if (!venueName || !type || !city) {
      Alert.alert("Atenção", "Preencha todos os campos obrigatórios");
      return;
    }

    setLoading(true);

    // 1. Criação do objeto FormData
    const formData = new FormData();

    // 2. Adiciona os campos de texto
    formData.append("name", venueName);
    formData.append("type", type);
    formData.append("city", city);
    // Adicione outros campos de texto aqui (description, contact, instagram, etc.)
    // formData.append("description", 'Sua descrição aqui');

    // 3. Adiciona a foto de Capa (coverPhoto)
    if (coverImage && coverImage.startsWith("file://")) {
      const filename = coverImage.split("/").pop() || "cover.jpg";
      const fileExtension = filename.split(".").pop();
      const mimeType = `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`;

      formData.append("coverPhoto", {
        uri: coverImage,
        name: filename,
        type: mimeType,
      } as any);
    }

    // 4. Adiciona a foto de Perfil (profilePhoto)
    if (profileImage && profileImage.startsWith("file://")) {
      const filename = profileImage.split("/").pop() || "profile.jpg";
      const fileExtension = filename.split(".").pop();
      const mimeType = `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`;

      formData.append("profilePhoto", {
        uri: profileImage,
        name: filename,
        type: mimeType, // <--- Tipo inferido
      } as any);
    }

    try {
      // 5. Configura a requisição PATCH para multipart/form-data
      const token = await getToken();

      const response = await api.patch(`/venues/user/${venueId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          // O RN/Axios geralmente define o Content-Type para 'multipart/form-data' 
          // automaticamente ao enviar um objeto FormData.
          "Content-Type": "multipart/form-data",
        },
      });

      Alert.alert("Sucesso", "Perfil do Estabelecimento atualizado com sucesso!")
      router.back();
    } catch (error) {
      const isAxiosError = (err: any): err is { response: { data: { message: string } } } => !!err.response;
      console.log("Erro ao atualizar Estabelecimento:", isAxiosError(error) ? error.response?.data : error);
      const errorMessage = isAxiosError(error)
        ? (error.response?.data?.message || "Erro desconhecido da API")
        : "Não foi possível atualizar o perfil do estabelecimento. Verifique a conexão.";

      Alert.alert("Erro", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Text style={styles.title}>Editar Perfil do Estabelecimento</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Cover Image */}
        <View style={styles.coverSection}>
          <TouchableOpacity
            style={styles.coverContainer}
            onPress={() => pickImage("cover")}
            activeOpacity={0.9}
          >
            {coverImage ? (
              <Image source={{ uri: coverImage }} style={styles.coverImage} />
            ) : (
              <View style={styles.coverPlaceholder}>
                <Ionicons name="camera" size={48} color="#9ca3af" />
              </View>
            )}
            <View style={styles.coverOverlay}>
              <View style={styles.cameraButton}>
                <Ionicons name="camera" size={24} color="#374151" />
              </View>
            </View>
          </TouchableOpacity>

          {/* Profile Image */}
          <TouchableOpacity
            style={styles.profileContainer}
            onPress={() => pickImage("profile")}
            activeOpacity={0.9}
          >
            <View style={styles.profileWrapper}>
              {profileImage ? (
                <Image
                  source={{ uri: profileImage }}
                  style={styles.profileImage}
                />
              ) : (
                <View style={styles.profilePlaceholder}>
                  <Text style={styles.profileEmoji}>👤</Text>
                </View>
              )}
              <View style={styles.profileOverlay}>
                <Ionicons name="camera" size={28} color="#fff" />
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>
          {/* Vanue Name */}
          <View style={styles.section}>
            <Text style={styles.label}>Nome do Estabelecimento</Text>
            <TextInput
              style={styles.input}
              value={venueName}
              onChangeText={setVenueName}
              placeholder="Digite o nome do estabelecimento"
              placeholderTextColor="#9ca3af"
            />
          </View>

          {/* Type */}
          <View style={styles.section}>
            <Text style={styles.label}>Tipo de estabelecimento</Text>
            <TextInput
              style={styles.input}
              value={type}
              onChangeText={setType}
              placeholder="Ex: Rock, Pop, Jazz..."
              placeholderTextColor="#9ca3af"
            />
          </View>

          {/* City */}
          <View style={styles.section}>
            <Text style={styles.label}>Cidade</Text>
            <TextInput
              style={styles.input}
              value={city}
              onChangeText={setCity}
              placeholder="Ex: Fortaleza, CE"
              placeholderTextColor="#9ca3af"
            />
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={styles.saveButtonText}>
              {loading ? "Salvando..." : "Salvar Alterações"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    backgroundColor: "#fff",
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
  },
  coverSection: {
    paddingHorizontal: 16,
    paddingTop: 20,
    marginBottom: 80,
  },
  coverContainer: {
    height: 200,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#e5e7eb",
  },
  coverImage: {
    width: "100%",
    height: "100%",
  },
  coverPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#ddd6fe",
    justifyContent: "center",
    alignItems: "center",
  },
  coverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    opacity: 0,
  },
  cameraButton: {
    backgroundColor: "#fff",
    borderRadius: 50,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  profileContainer: {
    position: "absolute",
    bottom: -60,
    left: 24,
  },
  profileWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "#fff",
    overflow: "hidden",
    backgroundColor: "#ddd6fe",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  profilePlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  profileEmoji: {
    fontSize: 48,
  },
  profileOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  formCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 30,
  },
  section: {
    marginBottom: 24,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#fff",
    color: "#000",
  },
  saveButton: {
    backgroundColor: "#1b1b1bff",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#272727ff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
