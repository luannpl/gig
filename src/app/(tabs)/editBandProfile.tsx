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
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../services/api";

export default function EditBandProfile() {
  const [bandId, setBandId] = useState<number | null>(null);
  const [bandName, setBandName] = useState("");
  const [genre, setGenre] = useState("");
  const [city, setCity] = useState("");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [bandPhotos, setBandPhotos] = useState<string[]>([]); // 🆕 fotos extras
  const [loading, setLoading] = useState(false);

  // Buscar ID da banda
  useEffect(() => {
    async function getBandId() {
      try {
        const storedBand = await AsyncStorage.getItem("@bandData");
        if (storedBand) {
          const parsed = JSON.parse(storedBand);
          setBandId(parsed.id);
        } else {
          Alert.alert(
            "Erro",
            "ID da banda não encontrado. Faça login novamente."
          );
        }
      } catch (error) {
        console.log("Erro ao obter ID:", error);
      }
    }

    getBandId();
  }, []);

  // Buscar dados da banda
  useEffect(() => {
    async function fetchBand() {
      if (!bandId) return;
      try {
        const response = await api.get(`/bands/${bandId}`);
        const data = response.data;

        setBandName(data.bandName || "");
        setGenre(data.genre || "");
        setCity(data.city || "");
        setCoverImage(data.coverImage || null);
        setProfileImage(data.profileImage || null);
        setBandPhotos(data.bandPhotos || []); // 🆕 fotos extras
      } catch (error) {
        console.log("Erro ao buscar banda:", error);
        Alert.alert("Erro", "Não foi possível carregar os dados da banda.");
      }
    }

    fetchBand();
  }, [bandId]);

  // Escolher imagem
  const pickImage = async (type: "cover" | "profile" | "gallery") => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      allowsMultipleSelection: type === "gallery", // 🆕 múltiplas imagens
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

  // Remover imagem do carrossel
  const removePhoto = (uri: string) => {
    Alert.alert("Remover Foto", "Deseja remover esta imagem?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Remover",
        onPress: () => setBandPhotos((prev) => prev.filter((p) => p !== uri)),
      },
    ]);
  };

  // Salvar alterações
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
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Editar Perfil da Banda</Text>

      {/* CAPA */}
      <TouchableOpacity
        style={styles.cover}
        onPress={() => pickImage("cover")}
        activeOpacity={0.8}
      >
        {coverImage ? (
          <Image source={{ uri: coverImage }} style={styles.coverImage} />
        ) : (
          <Text style={styles.coverText}>Selecionar Capa</Text>
        )}
      </TouchableOpacity>

      {/* AVATAR */}
      <TouchableOpacity
        style={styles.avatarWrapper}
        onPress={() => pickImage("profile")}
        activeOpacity={0.8}
      >
        {profileImage ? (
          <Image source={{ uri: profileImage }} style={styles.avatar} />
        ) : (
          <Text style={{ fontSize: 32 }}>👤</Text>
        )}
      </TouchableOpacity>

      {/* FOTOS */}
      <Text style={styles.label}>Fotos</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {bandPhotos.map((photo, index) => (
          <TouchableOpacity
            key={index}
            onLongPress={() => removePhoto(photo)}
            activeOpacity={0.8}
          >
            <Image source={{ uri: photo }} style={styles.galleryImage} />
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={styles.addPhotoButton}
          onPress={() => pickImage("gallery")}
        >
          <Text style={{ fontSize: 24, color: "#666" }}>＋</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* CAMPOS */}
      <Text style={styles.label}>Nome da Banda</Text>
      <TextInput
        style={styles.input}
        value={bandName}
        onChangeText={setBandName}
        placeholder="Digite o nome da banda"
      />

      <Text style={styles.label}>Gênero</Text>
      <TextInput
        style={styles.input}
        value={genre}
        onChangeText={setGenre}
        placeholder="Ex: Rock, Pop..."
      />

      <Text style={styles.label}>Cidade</Text>
      <TextInput
        style={styles.input}
        value={city}
        onChangeText={setCity}
        placeholder="Ex: Fortaleza, CE"
      />

      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.5 }]}
        onPress={handleSave}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Salvando..." : "Salvar Alterações"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  cover: {
    backgroundColor: "#eee",
    height: 120,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  coverText: {
    color: "#666",
  },
  coverImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  avatarWrapper: {
    alignSelf: "center",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 50,
  },
  label: {
    fontSize: 14,
    marginTop: 10,
    marginBottom: 5,
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  galleryImage: {
    width: 120,
    height: 80,
    borderRadius: 8,
    marginRight: 10,
  },
  addPhotoButton: {
    width: 120,
    height: 80,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    backgroundColor: "#000",
    padding: 15,
    borderRadius: 8,
    marginTop: 25,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
});
