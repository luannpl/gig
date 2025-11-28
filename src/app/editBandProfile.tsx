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
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getMe } from "../services/auth";

const { width } = Dimensions.get("window");

// Helper to create file object for FormData
const createFileObject = (uri: string) => {
  const filename = uri.split("/").pop() || `image_${Date.now()}.jpg`;
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : "image/jpeg";

  return {
    uri,
    name: filename,
    type,
  } as any;
};

// Helper to convert blob URI to File (for web)
const blobToFile = async (blobUri: string, filename: string): Promise<File> => {
  const response = await fetch(blobUri);
  const blob = await response.blob();
  return new File([blob], filename, { type: blob.type || "image/jpeg" });
};

export default function EditBandProfile() {
  const router = useRouter();
  const [userId, setUserId] = useState<number | null>(null);
  const [bandName, setBandName] = useState("");
  const [genre, setGenre] = useState("");
  const [city, setCity] = useState("");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  // Track if images were changed (new local files)
  const [coverImageChanged, setCoverImageChanged] = useState(false);
  const [profileImageChanged, setProfileImageChanged] = useState(false);

  useEffect(() => {
    async function fetchBand() {
      setLoadingData(true);
      const user = await getMe((await AsyncStorage.getItem("token")) || "");
      const id = user?.id;
      setUserId(id || null);
      if (!id || !user.band) {
        setLoadingData(false);
        return;
      }
      console.log("Buscando dados da banda do usuário:", id);
      try {
        const response = await api.get(`/bands/user/${user.id}`);
        const data = response.data;
        setBandName(data.bandName || "");
        setGenre(data.genre || "");
        setCity(data.city || "");
        setCoverImage(data.coverPicture || null);
        setProfileImage(data.profilePicture || null);
      } catch (error) {
        console.log("Erro ao buscar banda:", error);
        Alert.alert("Erro", "Não foi possível carregar os dados da banda.");
      } finally {
        setLoadingData(false);
      }
    }
    fetchBand();
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
        setCoverImageChanged(true);
      } else if (type === "profile") {
        setProfileImage(result.assets[0].uri);
        setProfileImageChanged(true);
      }
    }
  };

  const handleSave = async () => {
    if (!userId) {
      Alert.alert("Erro", "ID do usuário não encontrado.");
      return;
    }
    if (!bandName || !genre || !city) {
      Alert.alert("Atenção", "Preencha todos os campos");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();

      // Add text fields
      formData.append("bandName", bandName);
      formData.append("genre", genre);
      formData.append("city", city);

      // Check if running on web (blob URI) or native
      const isWeb = Platform.OS === "web";

      // Add cover image if changed (new local file)
      if (coverImageChanged && coverImage) {
        if (isWeb) {
          const coverFile = await blobToFile(
            coverImage,
            `cover_${Date.now()}.jpg`
          );
          console.log("Cover file (web):", coverFile);
          formData.append("coverPicture", coverFile);
        } else {
          const coverFile = createFileObject(coverImage);
          console.log("Cover file (native):", coverFile);
          formData.append("coverPicture", coverFile);
        }
      }

      // Add profile image if changed (new local file)
      if (profileImageChanged && profileImage) {
        if (isWeb) {
          const profileFile = await blobToFile(
            profileImage,
            `profile_${Date.now()}.jpg`
          );
          console.log("Profile file (web):", profileFile);
          formData.append("profilePicture", profileFile);
        } else {
          const profileFile = createFileObject(profileImage);
          console.log("Profile file (native):", profileFile);
          formData.append("profilePicture", profileFile);
        }
      }

      await api.patch(`/bands/user/${userId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      Alert.alert("Sucesso", "Perfil da banda atualizado com sucesso!");

      // Reset change tracking
      setCoverImageChanged(false);
      setProfileImageChanged(false);
    } catch (error) {
      console.log("Erro ao atualizar banda:", error);
      Alert.alert("Erro", "Não foi possível atualizar o perfil da banda");
    } finally {
      setLoading(false);
    }
  };

  // Skeleton component
  const Skeleton = ({ style }: { style: any }) => (
    <View style={[style, styles.skeleton]} />
  );

  if (loadingData) {
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
          {/* Cover Image Skeleton */}
          <View style={styles.coverSection}>
            <Skeleton style={styles.coverContainer} />
            <View style={styles.profileContainer}>
              <Skeleton style={styles.profileWrapperSkeleton} />
            </View>
          </View>

          {/* Form Card Skeleton */}
          <View style={styles.formCard}>
            <View style={styles.section}>
              <Skeleton style={styles.labelSkeleton} />
              <Skeleton style={styles.inputSkeleton} />
            </View>
            <View style={styles.section}>
              <Skeleton style={styles.labelSkeleton} />
              <Skeleton style={styles.inputSkeleton} />
            </View>
            <View style={styles.section}>
              <Skeleton style={styles.labelSkeleton} />
              <Skeleton style={styles.inputSkeleton} />
            </View>
            <Skeleton style={styles.buttonSkeleton} />
          </View>
        </ScrollView>
      </View>
    );
  }

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
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
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
  // Skeleton styles
  skeleton: {
    backgroundColor: "#e5e7eb",
    overflow: "hidden",
  },
  profileWrapperSkeleton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "#fff",
    backgroundColor: "#e5e7eb",
  },
  labelSkeleton: {
    width: 120,
    height: 16,
    borderRadius: 4,
    marginBottom: 8,
  },
  inputSkeleton: {
    width: "100%",
    height: 48,
    borderRadius: 12,
  },
  buttonSkeleton: {
    width: "100%",
    height: 52,
    borderRadius: 12,
    marginTop: 8,
  },
});
