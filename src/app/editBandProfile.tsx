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
  const [bandId, setBandId] = useState<number | null>(null);
  const [bandName, setBandName] = useState("");
  const [genre, setGenre] = useState("");
  const [city, setCity] = useState("");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [bandPhotos, setBandPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // useEffect(() => {
  //   async function getBandId() {
  //     try {
  //       const token = await AsyncStorage.getItem("token");
  //       if (!token) {
  //         Alert.alert("Erro", "Token não encontrado. Faça login novamente.");
  //         AsyncStorage.removeItem("user");
  //         AsyncStorage.removeItem("token");
  //         router.replace("/(auth)/sign-in");
  //         return;
  //       }
  //       const storedBand = await getMe(token);
  //       if (storedBand) {
  //         const parsed = JSON.parse(storedBand);
  //         setBandId(parsed.band.id);
  //       } else {
  //         Alert.alert(
  //           "Erro",
  //           "ID da banda não encontrado. Faça login novamente."
  //         );
  //       }
  //     } catch (error) {
  //       console.log("Erro ao obter ID:", error);
  //     }
  //   }
  //   getBandId();
  // }, []);

  useEffect(() => {
    async function fetchBand() {
      const user = await getMe((await AsyncStorage.getItem("token")) || "");
      const bandId = user.band?.id;
      setBandId(bandId || null);
      if (!bandId) return;
      console.log("Buscando dados da banda com ID:", bandId);
      try {
        const response = await api.get(`/bands/${bandId}`);
        const data = response.data;
        setBandName(data.bandName || "");
        setGenre(data.genre || "");
        setCity(data.city || "");
        setCoverImage(data.coverImage || null);
        setProfileImage(data.profileImage || null);
        setBandPhotos(data.bandPhotos || []);
      } catch (error) {
        console.log("Erro ao buscar banda:", error);
        Alert.alert("Erro", "Não foi possível carregar os dados da banda.");
      }
    }
    fetchBand();
  }, []);

  const pickImage = async (type: "cover" | "profile" | "gallery") => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      allowsMultipleSelection: type === "gallery",
    });

    if (!result.canceled) {
      if (type === "cover") {
        setCoverImage(result.assets[0].uri);
      } else if (type === "profile") {
        setProfileImage(result.assets[0].uri);
      } else if (type === "gallery") {
        const selected = result.assets.map((asset) => asset.uri);
        setBandPhotos((prev) => [...prev, ...selected]);
      }
    }
  };

  const removePhoto = (uri: string) => {
    Alert.alert("Remover Foto", "Deseja remover esta imagem?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Remover",
        onPress: () => setBandPhotos((prev) => prev.filter((p) => p !== uri)),
      },
    ]);
  };

  const handleSave = async () => {
    if (!bandId) {
      Alert.alert("Erro", "ID da banda não encontrado.");
      return;
    }
    if (!bandName || !genre || !city) {
      Alert.alert("Atenção", "Preencha todos os campos");
      return;
    }

    setLoading(true);
    try {
      await api.put(`/bands/${bandId}`, {
        bandName,
        genre,
        city,
        coverImage,
        profileImage,
        bandPhotos,
      });
      Alert.alert("Sucesso", "Perfil da banda atualizado com sucesso!");
    } catch (error) {
      console.log("Erro ao atualizar banda:", error);
      Alert.alert("Erro", "Não foi possível atualizar o perfil da banda");
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
          <Ionicons name="musical-notes" size={24} color="#9333ea" />
          <Text style={styles.title}>Editar Perfil da Banda</Text>
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
          {/* Band Photos Gallery */}
          <View style={styles.section}>
            <View style={styles.labelContainer}>
              <Text style={styles.photoEmoji}>📸</Text>
              <Text style={styles.label}>Fotos da Banda</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {bandPhotos.map((photo, index) => (
                <TouchableOpacity
                  key={index}
                  onLongPress={() => removePhoto(photo)}
                  activeOpacity={0.8}
                  style={styles.photoWrapper}
                >
                  <Image source={{ uri: photo }} style={styles.galleryImage} />
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removePhoto(photo)}
                  >
                    <Ionicons name="close" size={16} color="#fff" />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={styles.addPhotoButton}
                onPress={() => pickImage("gallery")}
              >
                <Ionicons name="add" size={32} color="#9ca3af" />
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* Band Name */}
          <View style={styles.section}>
            <Text style={styles.label}>Nome da Banda</Text>
            <TextInput
              style={styles.input}
              value={bandName}
              onChangeText={setBandName}
              placeholder="Digite o nome da banda"
              placeholderTextColor="#9ca3af"
            />
          </View>

          {/* Genre */}
          <View style={styles.section}>
            <Text style={styles.label}>Gênero Musical</Text>
            <TextInput
              style={styles.input}
              value={genre}
              onChangeText={setGenre}
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
  photoEmoji: {
    fontSize: 18,
    marginRight: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  photoWrapper: {
    marginRight: 12,
    position: "relative",
  },
  galleryImage: {
    width: 140,
    height: 96,
    borderRadius: 12,
    backgroundColor: "#e5e7eb",
  },
  removeButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#ef4444",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  addPhotoButton: {
    width: 140,
    height: 96,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#d1d5db",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9fafb",
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
    backgroundColor: "#9333ea",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#9333ea",
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
