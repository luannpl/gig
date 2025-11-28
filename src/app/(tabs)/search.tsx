import {
  View,
  Text,
  TextInput,
  Image,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  useWindowDimensions,
  Platform, // Importar Platform para estilos específicos de plataforma
} from "react-native";
import { useState, useEffect, useMemo } from "react"; // Adicionando useMemo
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import api from "@/src/services/api";
import { getMe } from "@/src/services/auth";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Tipos
// Tipos
interface Band {
  id: number;
  bandName: string;
  genre: string;
  city: string;
  profilePicture?: string;
  coverPicture?: string;
  description?: string;
  type: "band";
}

interface Venue {
  id: string;
  name: string;
  type: string;
  city: string;
  profilePhoto?: string;
  coverPhoto?: string;
  description?: string;
  itemType: "venue";
}

interface User {
  name: string;
  id: string; // ID do usuário principal
  role: "venue" | "band" | "user";
  avatar?: string;
  band?: {
    id: number; // ID da entidade banda
    profilePicture?: string;
    bandName?: string;
  };
  venue?: {
    id: string; // ID da entidade venue
    profilePhoto?: string;
    name?: string;
  };
}

type SearchItem = Band | Venue;

interface SearchResponse {
  bands: Band[];
  venues: Venue[];
  total: number;
}

// Constantes para breakpoints
const BREAKPOINT_TABLET = 768;
const BREAKPOINT_DESKTOP = 1024;

export default function Search() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "band" | "venue">("all");
  const [isLoadingUser, setIsLoadingUser] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // 1. OBTENÇÃO DO USUÁRIO LOGADO
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        setIsLoadingUser(true);
        const token = await AsyncStorage.getItem("token");

        if (!token) {
          setCurrentUser(null);
          return;
        }

        try {
          const userData = await getMe(token);
          setCurrentUser(userData as User);
        } catch (apiError) {
          console.error("Erro ao buscar dados do usuário:", apiError);
          throw apiError;
        }
      } catch (error) {
        console.error("ERRO FATAL AO CARREGAR USUÁRIO:", error);
        await AsyncStorage.removeItem("token");
        setCurrentUser(null);
      } finally {
        setIsLoadingUser(false);
      }
    };

    fetchCurrentUser(); // Adicione esta linha para executar a função
  }, []);

  // Debounce
  const handleSearchChange = (text: string) => {
    setSearch(text);
    const timer = setTimeout(() => {
      setDebouncedSearch(text);
    }, 500);
    return () => clearTimeout(timer);
  };

  // Lógica de responsividade
  const { width } = useWindowDimensions();
  const isTablet = width >= BREAKPOINT_TABLET;
  const isDesktop = width >= BREAKPOINT_DESKTOP;

  // Query combinada
  const { data, isLoading, isError, error } = useQuery<SearchResponse>({
    queryKey: ["search", debouncedSearch, filterType],
    queryFn: async () => {
      const searchTerm = debouncedSearch.trim();

      let bands: Band[] = [];
      let venues: Venue[] = [];

      // Busca bandas
      if (filterType === "all" || filterType === "band") {
        try {
          const bandEndpoint = searchTerm
            ? `/bands/pesquisa?name=${encodeURIComponent(searchTerm)}&page=1&limit=20`
            : `/bands?page=1&limit=20`;
          const bandResponse = await api.get(bandEndpoint);
          bands = bandResponse.data.data.map((b: any) => ({
            ...b,
            type: "band",
          }));

          // Filtrar a banda do usuário logado - VERIFICAÇÃO MAIS SEGURA
          if (currentUser?.role === "band" && currentUser.band?.bandName) {
            bands = bands.filter(
              (band) =>
                band.id !== parseInt(currentUser.id) &&
                band.bandName !== currentUser.band?.bandName
            );
          }
        } catch (error) {
          console.error("Erro ao buscar bandas:", error);
        }
      }

      // Busca estabelecimentos
      if (filterType === "all" || filterType === "venue") {
        try {
          const venueEndpoint = searchTerm
            ? `/venues/pesquisa?name=${encodeURIComponent(searchTerm)}&page=1&limit=20`
            : `/venues?page=1&limit=20`;
          const venueResponse = await api.get(venueEndpoint);
          venues = venueResponse.data.data.map((v: any) => ({
            ...v,
            itemType: "venue",
          }));

          // Filtrar o estabelecimento do usuário logado - VERIFICAÇÃO MAIS SEGURA
          if (currentUser?.role === "venue" && currentUser.venue?.name) {
            venues = venues.filter(
              (venue) =>
                venue.id !== currentUser.id &&
                venue.name !== currentUser.venue?.name
            );
          }
        } catch (error) {
          console.error("Erro ao buscar estabelecimentos:", error);
        }
      }

      return {
        bands,
        venues,
        total: bands.length + venues.length,
      };
    },
    enabled: true,
  });

  // 2. FILTRAGEM DOS RESULTADOS COM BASE NO USUÁRIO LOGADO
  const combinedResults: SearchItem[] = useMemo(() => {
    let results: SearchItem[] = [
      ...(data?.bands || []),
      ...(data?.venues || []),
    ];

    if (!currentUser) {
      return results; // Não há usuário logado para filtrar
    }

    const loggedRole = currentUser.role;
    let loggedEntityId: string | number | null = null;

    if (loggedRole === "venue" && currentUser.venue) {
      // O ID da entidade Venue é uma string (UUID)
      loggedEntityId = currentUser.venue.id;
    } else if (loggedRole === "band" && currentUser.band) {
      // O ID da entidade Band é um número
      loggedEntityId = currentUser.band.id;
    }

    if (!loggedEntityId) {
      return results; // Usuário logado, mas não é Venue nem Band (ou dados incompletos)
    }

    return results.filter((item) => {
      if ("bandName" in item) {
        // Se for Banda, o ID é numérico
        return item.id !== loggedEntityId;
      } else {
        // Se for Estabelecimento, o ID é string (UUID)
        return item.id !== loggedEntityId;
      }
    });
  }, [data, currentUser]); // Recalcula quando os dados da busca OU o usuário logado mudarem

  // O estado de carregamento é se a busca principal está carregando OU se ainda estamos esperando o ID do usuário
  const totalLoading = isLoading || isLoadingUser;

  // Determina o número de colunas para a FlatList
  const numColumns = isDesktop ? 3 : isTablet ? 2 : 1;

  const renderItem = ({ item }: { item: SearchItem }) => {
    const isBand = "bandName" in item;

    // Estilo do cartão ajustado para o layout de colunas
    const cardStyle = [
      styles.card,
      isTablet && {
        width: isDesktop ? width / 3 - 24 : width / 2 - 24,
        marginHorizontal: 8,
      },
      !isTablet && { marginHorizontal: 0 }, // No mobile, remove o marginHorizontal se for aplicado no FlatList
    ];

    if (isBand) {
      return (
        <TouchableOpacity
          onPress={() => router.push(`/bandProfile/${item.id}`)}
          activeOpacity={0.9}
          style={cardStyle}
        >
          <View>
            {/* Cover Image */}
            <View style={styles.coverContainer}>
              <Image
                source={{
                  uri:
                    item.coverPicture ||
                    "https://via.placeholder.com/400x120?text=Sem+Capa",
                }}
                style={styles.coverImage}
                resizeMode="cover"
              />
              {/* Profile Image */}
              <View style={styles.profileImageContainer}>
                <Image
                  source={{
                    uri:
                      item.profilePicture ||
                      "https://via.placeholder.com/60x60?text=Foto",
                  }}
                  style={styles.profileImage}
                  resizeMode="cover"
                />
              </View>
            </View>
            <View style={styles.info}>
              <View style={styles.badge}>
                <Ionicons name="musical-notes" size={12} color="#FFFFFF" />
                <Text style={styles.badgeText}>Banda</Text>
              </View>
              <Text style={styles.name}>{item.bandName}</Text>
              <View style={styles.detailsRow}>
                <Ionicons name="musical-notes" size={14} color="#9CA3AF" />
                <Text style={styles.detail}>{item.genre}</Text>
              </View>
              <View style={styles.detailsRow}>
                <Ionicons name="location" size={14} color="#9CA3AF" />
                <Text style={styles.detail}>{item.city}</Text>
              </View>
              {item.description && (
                <Text style={styles.description} numberOfLines={2}>
                  {item.description}
                </Text>
              )}
            </View>
          </View>
        </TouchableOpacity>
      );
    } else {
      const venue = item as Venue;
      return (
        <TouchableOpacity
          onPress={() => router.push(`/venueProfile/${venue.id}`)}
          activeOpacity={0.9}
          style={cardStyle}
        >
          <View>
            {/* Cover Image */}
            <View style={styles.coverContainer}>
              <Image
                source={{
                  uri:
                    venue.coverPhoto ||
                    "https://via.placeholder.com/400x120?text=Sem+Capa",
                }}
                style={styles.coverImage}
                resizeMode="cover"
              />
              {/* Profile Image */}
              <View style={styles.profileImageContainer}>
                <Image
                  source={{
                    uri:
                      venue.profilePhoto ||
                      "https://via.placeholder.com/60x60?text=Foto",
                  }}
                  style={styles.profileImage}
                  resizeMode="cover"
                />
              </View>
            </View>
            <View style={styles.info}>
              <View style={[styles.badge, { backgroundColor: "#3b82f6" }]}>
                <Ionicons name="business" size={12} color="#FFFFFF" />
                <Text style={styles.badgeText}>Estabelecimento</Text>
              </View>
              <Text style={styles.name}>{venue.name}</Text>
              <View style={styles.detailsRow}>
                <Ionicons name="business" size={14} color="#9CA3AF" />
                <Text style={styles.detail}>{venue.type}</Text>
              </View>
              <View style={styles.detailsRow}>
                <Ionicons name="location" size={14} color="#9CA3AF" />
                <Text style={styles.detail}>{venue.city}</Text>
              </View>
              {venue.description && (
                <Text style={styles.description} numberOfLines={2}>
                  {venue.description}
                </Text>
              )}
            </View>
          </View>
        </TouchableOpacity>
      );
    }
  };

  const renderEmptyState = () => {
    if (totalLoading) return null; // Usa totalLoading aqui

    return (
      <View style={styles.emptyState}>
        <Ionicons name="search" size={64} color="#D1D5DB" />
        <Text style={styles.emptyText}>
          {debouncedSearch.trim()
            ? "Nenhum resultado encontrado"
            : "Digite para buscar"}
        </Text>
        {debouncedSearch.trim() && (
          <Text style={styles.emptySubtext}>
            Tente buscar por nome ou cidade
          </Text>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Pesquisa</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="#9CA3AF" />
        <TextInput
          placeholder="Buscar bandas e estabelecimentos..."
          placeholderTextColor="#9CA3AF"
          value={search}
          onChangeText={handleSearchChange}
          style={styles.searchInput}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filtros */}
      <View
        style={[
          styles.filterContainer,
          isTablet && styles.filterContainerTablet,
        ]}
      >
        <TouchableOpacity
          style={[
            styles.filterButton,
            filterType === "all" && styles.filterButtonActive,
          ]}
          onPress={() => setFilterType("all")}
        >
          <Text
            style={[
              styles.filterText,
              filterType === "all" && styles.filterTextActive,
            ]}
          >
            Todos
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            filterType === "band" && styles.filterButtonActive,
          ]}
          onPress={() => setFilterType("band")}
        >
          <Ionicons
            name="musical-notes"
            size={16}
            color={filterType === "band" ? "#FFFFFF" : "#6B7280"}
          />
          <Text
            style={[
              styles.filterText,
              filterType === "band" && styles.filterTextActive,
            ]}
          >
            Bandas
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            filterType === "venue" && styles.filterButtonActive,
          ]}
          onPress={() => setFilterType("venue")}
        >
          <Ionicons
            name="business"
            size={16}
            color={filterType === "venue" ? "#FFFFFF" : "#6B7280"}
          />
          <Text
            style={[
              styles.filterText,
              filterType === "venue" && styles.filterTextActive,
            ]}
          >
            Estabelecimentos
          </Text>
        </TouchableOpacity>
      </View>

      {/* Loading */}
      {totalLoading && ( // Usa totalLoading aqui
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.loadingText}>Buscando...</Text>
        </View>
      )}

      {/* Error */}
      {isError && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#EF4444" />
          <Text style={styles.errorText}>Erro ao buscar</Text>
        </View>
      )}

      {/* Lista */}
      {!totalLoading &&
        !isError && ( // Usa totalLoading aqui
          <FlatList
            key={`search-list-${numColumns}`}
            data={combinedResults}
            keyExtractor={(item, index) =>
              "bandName" in item ? `band-${item.id}` : `venue-${item.id}`
            }
            renderItem={renderItem}
            contentContainerStyle={[
              styles.listContent,
              isTablet && styles.listContentTablet, // Estilo para layout de colunas
            ]}
            numColumns={numColumns} // Adiciona o número de colunas
            columnWrapperStyle={
              numColumns > 1 ? styles.columnWrapper : undefined
            } // Estilo para espaçamento entre colunas
            ListEmptyComponent={renderEmptyState}
            showsVerticalScrollIndicator={false}
          />
        )}

      {/* Info de resultados */}
      {!totalLoading &&
        !isError &&
        combinedResults.length > 0 && ( // Usa combinedResults.length
          <View style={styles.resultsInfo}>
            <Text style={styles.resultsText}>
              {combinedResults.length}{" "}
              {combinedResults.length === 1 ? "resultado" : "resultados"}
            </Text>
          </View>
        )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    backgroundColor: "#F3F4F6",
    paddingVertical: Platform.OS === "ios" ? 48 : 24, // Ajuste para iOS/Android
    paddingHorizontal: 16,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    fontWeight: "700",
    fontSize: 20,
    color: "#111827",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: "#111827",
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterContainerTablet: {
    justifyContent: "center", // Centraliza os filtros em telas maiores
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    gap: 6,
  },
  filterButtonActive: {
    backgroundColor: "#111827",
  },
  filterText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
  },
  filterTextActive: {
    color: "#FFFFFF",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  listContentTablet: {
    paddingHorizontal: 8, // Ajusta o padding para compensar o marginHorizontal dos cards
  },
  columnWrapper: {
    justifyContent: "space-between", // Distribui o espaço entre as colunas
    marginBottom: 16, // Espaçamento entre as linhas
  },
  card: {
    backgroundColor: "#111827",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    flex: 1,
  },
  coverContainer: {
    position: "relative",
    width: "100%",
    height: 120,
  },
  coverImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#374151",
  },
  profileImageContainer: {
    position: "absolute",
    bottom: -30,
    left: 16,
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: "#111827",
    overflow: "hidden",
    backgroundColor: "#374151",
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  info: {
    paddingTop: 40,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#7C3AED",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
    gap: 4,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
  },
  name: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 18,
    marginBottom: 8,
  },
  detailsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  detail: {
    color: "#D1D5DB",
    fontSize: 14,
    marginLeft: 6,
  },
  description: {
    color: "#9CA3AF",
    fontSize: 13,
    marginTop: 8,
    lineHeight: 18,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    color: "#6B7280",
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: "600",
    color: "#EF4444",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
    textAlign: "center",
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
  },
  resultsInfo: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: "#F3F4F6",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  resultsText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
});
