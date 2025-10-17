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

// Tipos para os dados da banda
interface Band {
  id: number;
  bandName: string;
  genre: string;
  city: string;
  profilePicture?: string;
  description?: string;
  userId: {
    id: string;
    role: string;
  };
}

interface SearchResponse {
  data: Band[];
  total: number;
  page: number;
  lastPage: number;
}

export default function Search() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce: atualiza o termo de busca após o usuário parar de digitar
  const handleSearchChange = (text: string) => {
    setSearch(text);
    
    // Limpa o timeout anterior
    const timer = setTimeout(() => {
      setDebouncedSearch(text);
    }, 500); // Espera 500ms após parar de digitar

    return () => clearTimeout(timer);
  };

  // Query para buscar bandas
  const { data, isLoading, isError, error } = useQuery<SearchResponse>({
    queryKey: ["bands", debouncedSearch],
    queryFn: async () => {
      // Se não houver busca, retorna lista completa
      const endpoint = debouncedSearch.trim()
        ? `/bands/pesquisa?name=${encodeURIComponent(debouncedSearch)}&page=1&limit=20`
        : `/bands?page=1&limit=20`;
      
      const response = await api.get(endpoint);
      return response.data;
    },
    enabled: true, // Sempre habilitado para carregar lista inicial
  });

  const renderBandItem = ({ item }: { item: Band }) => (
    <TouchableOpacity
      onPress={() => console.log("Navegar para banda:", item.id)}
      activeOpacity={0.9}
    >
      <View style={styles.bandCard}>
        {/* Imagem da banda */}
        <Image
          source={{
            uri: item.profilePicture || "https://via.placeholder.com/400x200?text=Sem+Foto",
          }}
          style={styles.bandImage}
          resizeMode="cover"
        />

        {/* Informações da banda */}
        <View style={styles.bandInfo}>
          <Text style={styles.bandName}>{item.bandName}</Text>
          <View style={styles.detailsRow}>
            <Ionicons name="musical-notes" size={14} color="#9CA3AF" />
            <Text style={styles.bandGenre}>{item.genre}</Text>
          </View>
          <View style={styles.detailsRow}>
            <Ionicons name="location" size={14} color="#9CA3AF" />
            <Text style={styles.bandCity}>{item.city}</Text>
          </View>
          {item.description && (
            <Text style={styles.bandDescription} numberOfLines={2}>
              {item.description}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => {
    if (isLoading) return null;
    
    return (
      <View style={styles.emptyState}>
        <Ionicons name="search" size={64} color="#D1D5DB" />
        <Text style={styles.emptyText}>
          {debouncedSearch.trim()
            ? "Nenhuma banda encontrada"
            : "Digite para buscar bandas"}
        </Text>
        {debouncedSearch.trim() && (
          <Text style={styles.emptySubtext}>
            Tente buscar por nome, cidade ou gênero
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
          placeholder="Buscar bandas..."
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

      {/* Indicador de carregamento */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.loadingText}>Buscando bandas...</Text>
        </View>
      )}

      {/* Erro */}
      {isError && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#EF4444" />
          <Text style={styles.errorText}>Erro ao buscar bandas</Text>
          <Text style={styles.errorSubtext}>
            {error instanceof Error ? error.message : "Tente novamente"}
          </Text>
        </View>
      )}

      {/* Lista de bandas */}
      {!isLoading && !isError && (
        <FlatList
          data={data?.data || []}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderBandItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Info de resultados */}
      {!isLoading && !isError && data && data.data.length > 0 && (
        <View style={styles.resultsInfo}>
          <Text style={styles.resultsText}>
            {data.total} {data.total === 1 ? "banda encontrada" : "bandas encontradas"}
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
    marginVertical: 16,
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
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  bandCard: {
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
  bandImage: {
    width: "100%",
    height: 180,
    backgroundColor: "#374151",
  },
  bandInfo: {
    padding: 16,
  },
  bandName: {
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
  bandGenre: {
    color: "#D1D5DB",
    fontSize: 14,
    marginLeft: 6,
  },
  bandCity: {
    color: "#D1D5DB",
    fontSize: 14,
    marginLeft: 6,
  },
  bandDescription: {
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
  errorSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
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