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

// FUNÇÃO PARA CONVERTER BLOB URL PARA FILE USANDO FETCH
const blobToFile = async (blobUrl: string, fileName: string, mimeType: string) => {
  try {
    const response = await fetch(blobUrl);
    const blob = await response.blob();
    
    // Criar um File object a partir do Blob
    return new File([blob], fileName, { type: mimeType });
  } catch (error) {
    console.error('Erro ao converter blob:', error);
    throw new Error('Falha ao processar a imagem');
  }
};

export default function EditVenueProfile() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [venueName, setVenueName] = useState("");
  const [type, setType] = useState("");
  const [city, setCity] = useState("");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchVenue() {
      const user = await getMe((await AsyncStorage.getItem("token")) || "");
      const currentUserId = user.id;
      setUserId(currentUserId || null);

      if (!currentUserId) return;

      try {
        const response = await api.get(`/venues/user/${currentUserId}`);
        const data = response.data;
        setVenueName(data.name || "");
        setType(data.type || "");
        setCity(data.city || "");
        setCoverImage(data.coverPhoto || null);
        setProfileImage(data.profilePhoto || null);
      } catch (error) {
        console.log("Erro ao buscar venue:", error);
        Alert.alert("Erro", "Não foi possível carregar os dados da venue.");
      }
    }
    fetchVenue();
  }, []);

  useEffect(() => {
    console.log('Cover Image atualizada:', coverImage);
    console.log('Profile Image atualizada:', profileImage);
  }, [coverImage, profileImage]);

  const pickImage = async (imageType: "cover" | "profile") => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'Precisamos de acesso à sua galeria para selecionar imagens.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: imageType === "cover" ? [4, 3] : [1, 1],
        quality: 0.8,
      });

      console.log('Resultado do ImagePicker:', result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        console.log('Imagem selecionada:', selectedImage);

        if (imageType === "cover") {
          setCoverImage(selectedImage.uri);
        } else if (imageType === "profile") {
          setProfileImage(selectedImage.uri);
        }
      } else {
        console.log('Seleção de imagem cancelada');
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem');
    }
  };

  const getToken = async () => await AsyncStorage.getItem("token");

  const showSuccessNotification = () => {
    Alert.alert(
      "✅ Sucesso!",
      "Alterações salvas com sucesso!",
      [
        {
          text: "OK",
          onPress: () => {
            // Navega de volta para o perfil
            router.navigate("/profile");
          }
        }
      ]
    );
  };

  const handleSave = async () => {
    if (!userId) {
      Alert.alert("Erro", "ID do usuário não encontrado. Tente relogar.");
      return;
    }

    if (!venueName || !type || !city) {
      Alert.alert("Atenção", "Preencha todos os campos obrigatórios");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      // Adiciona os campos de texto
      formData.append("name", venueName);
      formData.append("type", type);
      formData.append("city", city);

      console.log('Cover Image URI:', coverImage);
      console.log('Profile Image URI:', profileImage);

      // ADICIONA AS IMAGENS
      if (coverImage && coverImage.startsWith('blob:')) {
        try {
          const coverFile = await blobToFile(coverImage, `cover_${Date.now()}.jpg`, 'image/jpeg');
          formData.append("coverPhoto", coverFile);
          console.log('Cover File adicionado ao FormData');
        } catch (error) {
          console.error('Erro ao processar cover image:', error);
        }
      }

      if (profileImage && profileImage.startsWith('blob:')) {
        try {
          const profileFile = await blobToFile(profileImage, `profile_${Date.now()}.jpg`, 'image/jpeg');
          formData.append("profilePhoto", profileFile);
          console.log('Profile File adicionado ao FormData');
        } catch (error) {
          console.error('Erro ao processar profile image:', error);
        }
      }

      const token = await getToken();
      
      if (!token) {
        Alert.alert("Erro", "Token de autenticação não encontrado");
        return;
      }

      console.log('Enviando FormData...');

      // Fazer a requisição
      const response = await api.patch(`/venues/user/${userId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        timeout: 30000,
      });

      console.log('Resposta do servidor:', response.data);

      // MOSTRA NOTIFICAÇÃO DE SUCESSO E VOLTA PARA O PERFIL
      showSuccessNotification();

    } catch (error: any) {
      console.log("ERRO DETALHADO:");
      console.log("Mensagem:", error.message);
      
      if (error.response) {
        console.log("Status:", error.response.status);
        console.log("Data:", error.response.data);
        
        Alert.alert(
          "Erro do Servidor", 
          error.response.data?.message || `Erro ${error.response.status}`
        );
      } else if (error.request) {
        console.log("Request error:", error.request);
        Alert.alert("Erro de Conexão", "Não foi possível conectar ao servidor.");
      } else {
        Alert.alert("Erro", error.message || "Erro desconhecido");
      }
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
          {/* Venue Name */}
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