// ProfileBand.tsx
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
import { useRouter } from "expo-router";
import api from "@/src/services/api";

const { width } = Dimensions.get("window");

type Music = { nome: string; url?: string };
type Band = {
  id: number;
  nome: string;
  genero: string;
  cidade: string;
  integrantes: number;
  descricao: string;
  fotoCapa?: any;
  fotoPerfil?: any;
  fotos?: any[];
  musicas?: Music[];
};

export default function ProfileBand() {
  const router = useRouter();

  // --- MOCK: se usar require(...) garanta que o arquivo exista ---
  const [banda] = useState<Band>({
    id: 1,
    nome: "Cidadão Instigado",
    genero: "Rock Alternativo",
    cidade: "Fortaleza, CE",
    integrantes: 5,
    descricao:
      "O Cidadão Instigado é uma banda brasileira de rock, criada em 1996, em Fortaleza",
    // se esses arquivos existirem, OK. Caso contrário troque por URLs ou adicione os arquivos na pasta correta
    fotoCapa: require("../../assets/images/cidadaoInst4.jpg"),
    fotoPerfil: require("../../assets/images/cidadaoInstigado.jpg"),
    fotos: [
      require("../../assets/images/cidadaoInst1.jpg"),
      require("../../assets/images/cidadaoInst2.jpg"),
      require("../../assets/images/cidadaoInst3.jpg"),
    ],
    musicas: [{ nome: "Como as Luzes" }, { nome: "Contando Estrelas" }],
  });

  // helper: aceita require(...) (número) ou URL string
  const getImageSource = (img: any) => {
    if (!img) {
      // fallback remoto — não depende de arquivo local
      return { uri: "https://via.placeholder.com/400x200?text=Sem+imagem" };
    }
    if (typeof img === "number") return img; // require(...) -> número
    if (typeof img === "string") return { uri: img }; // url
    return img;
  };

  // Carousel state
  const [activeIndex, setActiveIndex] = useState(0);
  const flatRef = useRef<FlatList<any> | null>(null);

  useEffect(() => {
    const teste = async () => {
      const response = await api.get("users/me");
      console.log("Usuário logado:", response.data);
    };
    teste();
  }, []);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) setActiveIndex(viewableItems[0].index ?? 0);
  }).current;
  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 });

  // Render foto do carrossel — usa item corretamente
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
        <Image
          source={getImageSource(banda.fotoCapa)}
          style={styles.cover}
          resizeMode="cover"
        />

        {/* Header - perfil flutuante */}
        <View style={styles.header}>
          <View style={styles.avatarWrap}>
            <Image
              source={
                banda.fotoPerfil
                  ? getImageSource(banda.fotoPerfil)
                  : { uri: "https://via.placeholder.com/140" }
              }
              style={styles.avatar}
            />
          </View>

          <View style={styles.titleBlock}>
            <Text style={styles.title}>{banda.nome}</Text>
            <Text style={styles.subtitle}>{banda.genero}</Text>

            <TouchableOpacity
              style={styles.hireButton}
              activeOpacity={0.8}
              onPress={() => console.log("Contratar", banda.id)}
            >
              <Text style={styles.hireText}>Contratar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Info Boxes */}
        <View style={styles.infoRow}>
          <View style={styles.infoCard}>
            <Ionicons name="people" size={18} />
            <Text style={styles.infoText}>{banda.integrantes} membros</Text>
          </View>

          <View style={styles.infoCard}>
            <Entypo name="location-pin" size={18} />
            <Text style={styles.infoText}>{banda.cidade}</Text>
          </View>

          <View style={styles.infoCard}>
            <FontAwesome name="music" size={18} />
            <Text style={styles.infoText} numberOfLines={1}>
              {banda.genero}
            </Text>
          </View>
        </View>

        {/* Fotos - Carrossel */}
        <Text style={styles.sectionTitle}>Fotos</Text>
        <View style={{ paddingLeft: 15 }}>
          <FlatList
            ref={flatRef}
            data={banda.fotos ?? []}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, idx) => String(idx)}
            renderItem={renderPhoto}
            pagingEnabled
            snapToAlignment="center"
            decelerationRate="fast"
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewConfigRef.current}
            contentContainerStyle={{ paddingRight: 15 }}
          />

          <View style={styles.dots}>
            {(banda.fotos ?? []).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  activeIndex === i ? styles.dotActive : undefined,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Descrição */}
        <Text style={styles.sectionTitle}>Descrição</Text>
        <View style={styles.card}>
          <Text style={styles.description}>{banda.descricao}</Text>
        </View>

        {/* Músicas */}
        <Text style={styles.sectionTitle}>Nossas músicas</Text>
        <View style={styles.card}>
          {banda.musicas?.map((m, index) => (
            <View style={styles.musicRow} key={index}>
              <View
                style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
              >
                <Ionicons name="musical-note" size={18} />
                <Text style={styles.musicTitle}>{m.nome}</Text>
              </View>
              <TouchableOpacity
                style={styles.playBtn}
                onPress={() => console.log("Play:", m.url)}
              >
                <Text style={styles.playText}>Play</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

/* ===== Styles (mesmos da sua versão) ===== */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1, backgroundColor: "#fff" },
  cover: { width: "100%", height: 180, backgroundColor: "#ddd" },
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
  musicRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  musicTitle: { marginLeft: 10, fontSize: 15 },
  playBtn: {
    backgroundColor: "#000",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  playText: { color: "#fff", fontWeight: "700" },
});
