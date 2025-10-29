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
} from "react-native";
import { Ionicons, Entypo, FontAwesome } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getBandById } from "@/src/services/bandas";
import { Band } from "@/src/types/band";

const { width } = Dimensions.get("window");

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

  useEffect(() => {
    const fetchData = async () => {
      const bandData = await getBandById(id as string);
      setBanda(bandData);
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

  const renderPhoto = ({ item }: { item: any }) => (
    <Image
      source={getImageSource(item)}
      style={styles.photo}
      resizeMode="cover"
    />
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* CAPA */}
        <View>
          <Image
            source={
              banda.coverPicture
                ? getImageSource(banda.coverPicture)
                : require("./../../assets/images/icon.png")
            }
            style={styles.cover}
            resizeMode="cover"
          />

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.avatarWrap}>
            <Image
              source={
                banda.profilePicture
                  ? getImageSource(banda.profilePicture)
                  : require("./../../assets/images/icon.png")
              }
              style={styles.avatar}
            />
          </View>

          <View style={styles.titleBlock}>
            <Text style={styles.title}>{banda.bandName}</Text>
            <Text style={styles.subtitle}>{banda.genre}</Text>

            <TouchableOpacity
              style={styles.hireButton}
              activeOpacity={0.8}
              onPress={() => console.log("Contratar", banda.id)}
            >
              <Text style={styles.hireText}>Contratar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* INFO */}
        <View style={styles.infoRow}>
          <View style={styles.infoCard}>
            <Ionicons name="people" size={18} />
            <Text style={styles.infoText}>
              {banda.members ? `${banda.members} membros` : "Carreira Solo"}
            </Text>
          </View>

          <View style={styles.infoCard}>
            <Entypo name="location-pin" size={18} />
            <Text style={styles.infoText}>{banda.city}</Text>
          </View>

          <View style={styles.infoCard}>
            <FontAwesome name="music" size={18} />
            <Text style={styles.infoText} numberOfLines={1}>
              {banda.genre}
            </Text>
          </View>
        </View>

        {/* DESCRIÇÃO */}
        <Text style={styles.sectionTitle}>Descrição</Text>
        <View style={styles.card}>
          <Text style={styles.description}>
            {banda.description ||
              "Esta banda ainda não adicionou uma descrição."}
          </Text>
        </View>

        {/* FOTOS */}
        <Text style={styles.sectionTitle}>Fotos</Text>
        <View style={{ paddingLeft: 15 }}>
          <FlatList
            ref={flatRef}
            data={banda.profilePicture ? [banda.profilePicture] : []}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, idx) => String(idx)}
            renderItem={renderPhoto}
            pagingEnabled
            snapToAlignment="center"
            decelerationRate="fast"
            contentContainerStyle={{ paddingRight: 15 }}
          />

          <View style={styles.dots}>
            {(banda.profilePicture ? [banda.profilePicture] : []).map(
              (_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    activeIndex === i ? styles.dotActive : undefined,
                  ]}
                />
              )
            )}
          </View>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

/* ===== Styles ===== */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1, backgroundColor: "#fff" },
  cover: { width: "100%", height: 180, backgroundColor: "#ddd" },

  /* 🔙 Botão de voltar */
  backButton: {
    position: "absolute",
    top: 16,
    left: 16,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 8,
    borderRadius: 50,
  },

  header: { marginTop: -60, paddingHorizontal: 16, alignItems: "center" },
  avatarWrap: {
    width: 120,
    height: 120,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "#fff",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    backgroundColor: "#fff",
  },
  avatar: { width: "100%", height: "100%" },
  titleBlock: { marginTop: 10, alignItems: "center", width: "100%" },
  title: { fontSize: 20, fontWeight: "700", textAlign: "center" },
  subtitle: { fontSize: 13, color: "#666", marginTop: 6, marginBottom: 10 },
  hireButton: {
    borderWidth: 1.2,
    borderColor: "#000",
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderRadius: 8,
    marginTop: 6,
    backgroundColor: "#fff",
  },
  hireText: { color: "#000", fontWeight: "700" },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 15,
    marginTop: 18,
  },
  infoCard: {
    flex: 1,
    backgroundColor: "#fff",
    marginHorizontal: 6,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#eee",
  },
  infoText: { marginTop: 6, fontSize: 13, color: "#333" },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 18,
    marginBottom: 10,
    marginLeft: 15,
  },
  photo: {
    width: width - 60,
    height: 180,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: "#eee",
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ddd",
    marginHorizontal: 4,
  },
  dotActive: { backgroundColor: "#333", width: 18, borderRadius: 9 },
  card: {
    marginHorizontal: 15,
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#eee",
  },
  description: { fontSize: 14, color: "#333", lineHeight: 20 },
});
