import {
  View,
  Text,
  TextInput,
  Image,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import api from "@/src/services/api";
import { router } from "expo-router";

// Tipos
interface Band {
  id: number;
  bandName: string;
  genre: string;
  city: string;
  profilePicture?: string;
  description?: string;
  type: "band";
}

interface Venue {
  id: string;
  name: string;
  type: string;
  city: string;
  profilePhoto?: string;
  description?: string;
  itemType: "venue";
}

type SearchItem = Band | Venue;

interface SearchResponse {
  bands: Band[];
  venues: Venue[];
  total: number;
}

export default function Search() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "band" | "venue">("all");

  // Debounce
  const handleSearchChange = (text: string) => {
    setSearch(text);
    const timer = setTimeout(() => {
      setDebouncedSearch(text);
    }, 500);
    return () => clearTimeout(timer);
  };

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
          bands = bandResponse.data.data.map((b: any) => ({ ...b, type: "band" }));
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
          venues = venueResponse.data.data.map((v: any) => ({ ...v, itemType: "venue" }));
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

  // Combina e ordena resultados
  const combinedResults: SearchItem[] = [
    ...(data?.bands || []),
    ...(data?.venues || []),
  ];

  const renderItem = ({ item }: { item: SearchItem }) => {
    const isBand = "bandName" in item;
    
    if (isBand) {
      return (
        <TouchableOpacity
          onPress={() => router.push(`/bandProfile/${item.id}`)}
          activeOpacity={0.9}
        >
          <View style={styles.card}>
            <Image
              source={{
                uri:
                  item.profilePicture ||
                  "https://via.placeholder.com/400x200?text=Sem+Foto",
              }}
              style={styles.image}
              resizeMode="cover"
            />
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
        >
          <View style={styles.card}>
            <Image
              source={{
                uri:
                  venue.profilePhoto ||
                  "https://via.placeholder.com/400x200?text=Sem+Foto",
              }}
              style={styles.image}
              resizeMode="cover"
            />
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
    if (isLoading) return null;

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
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filterType === "all" && styles.filterButtonActive]}
          onPress={() => setFilterType("all")}
        >
          <Text style={[styles.filterText, filterType === "all" && styles.filterTextActive]}>
            Todos
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.filterButton, filterType === "band" && styles.filterButtonActive]}
          onPress={() => setFilterType("band")}
        >
          <Ionicons 
            name="musical-notes" 
            size={16} 
            color={filterType === "band" ? "#FFFFFF" : "#6B7280"} 
          />
          <Text style={[styles.filterText, filterType === "band" && styles.filterTextActive]}>
            Bandas
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterButton, filterType === "venue" && styles.filterButtonActive]}
          onPress={() => setFilterType("venue")}
        >
          <Ionicons 
            name="business" 
            size={16} 
            color={filterType === "venue" ? "#FFFFFF" : "#6B7280"} 
          />
          <Text style={[styles.filterText, filterType === "venue" && styles.filterTextActive]}>
            Estabelecimentos
          </Text>
        </TouchableOpacity>
      </View>

      {/* Loading */}
      {isLoading && (
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
      {!isLoading && !isError && (
        <FlatList
          data={combinedResults}
          keyExtractor={(item, index) => 
            "bandName" in item ? `band-${item.id}` : `venue-${item.id}`
          }
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Info de resultados */}
      {!isLoading && !isError && data && data.total > 0 && (
        <View style={styles.resultsInfo}>
          <Text style={styles.resultsText}>
            {data.total} {data.total === 1 ? "resultado" : "resultados"}
            {filterType === "all" && ` (${data.bands.length} bandas, ${data.venues.length} estabelecimentos)`}
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
    paddingVertical: 24,
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
  },
  image: {
    width: "100%",
    height: 180,
    backgroundColor: "#374151",
  },
  info: {
    padding: 16,
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