// src/screens/ContratosScreen.tsx
import ContractCard from "@/src/components/ContractCard";
import ContractsDashboard from "@/src/components/ContractsDashboard";
import api from "@/src/services/api";
import { Contract } from "@/src/types/contracts";
import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  StatusBar,
  useWindowDimensions,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

// Largura máxima para telas largas (desktop)
const MAX_WIDTH = 1200;

// Tipagem para o perfil do usuário logado
type Profile = {
  id: string;
  band: {
    id: number;
  } | null;
  venue: {
    id: string;
  } | null;
};

// Tipagem explícita para o objeto de informação do usuário, corrigindo o erro de tipagem
type UserInfo = {
  id: string | number;
  type: "band" | "venue"; // Garante que o tipo seja especificamente 'band' ou 'venue'
  endpoint: string;
};

// Tipagem para as abas de navegação, incluindo o novo estado "Cancelados"
type ActiveTab =
  | "Painel"
  | "Pendentes"
  | "Aceitos"
  | "Recusados"
  | "Cancelados";

const AdminContractScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>("Painel");
  const { width } = useWindowDimensions();
  const isMobile = width < 600;

  // Busca os dados do perfil do usuário logado
  const { data: me, isLoading: isLoadingProfile } = useQuery<Profile>({
    queryKey: ["me"],
    queryFn: async () => {
      const { data } = await api.get("/users/me");
      return data;
    },
  });

  // Determina o ID, tipo e endpoint da API baseado no perfil do usuário
  const getUserInfo = (): UserInfo | null => {
    if (!me) return null;

    if (me.band) {
      return {
        id: me.band.id,
        type: "band",
        endpoint: `/contract/band/${me.band.id}`,
      };
    } else if (me.venue) {
      return {
        id: me.venue.id,
        type: "venue",
        endpoint: `/contract/venue/${me.venue.id}`,
      };
    }

    return null;
  };

  const userInfo = getUserInfo();

  // Busca os contratos do usuário, habilitado apenas quando 'userInfo' estiver disponível
  const { data: contracts, isLoading: isLoadingContracts } = useQuery<
    Contract[]
  >({
    queryKey: ["contracts", userInfo?.id, userInfo?.type],
    queryFn: async () => {
      if (!userInfo) throw new Error("Usuário não encontrado");
      const { data } = await api.get<Contract[]>(userInfo.endpoint);
      return data;
    },
    enabled: !!userInfo,
  });

  // Filtra os contratos com base na aba ativa e no novo campo 'status'
  const getFilteredContracts = () => {
    if (!contracts) return [];

    switch (activeTab) {
      case "Painel":
        return contracts;
      case "Pendentes":
        return contracts.filter((contract) => contract.status === "pending");
      case "Aceitos":
        return contracts.filter((contract) => contract.status === "confirmed");
      case "Recusados":
        return contracts.filter((contract) => contract.status === "declined");
      case "Cancelados":
        return contracts.filter((contract) => contract.status === "canceled");
      default:
        return contracts;
    }
  };

  if (isLoadingProfile || isLoadingContracts) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.loadingText}>Carregando...</Text>
      </SafeAreaView>
    );
  }

  if (!me || !userInfo) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.errorText}>Usuário não encontrado.</Text>
      </SafeAreaView>
    );
  }

  if (!contracts) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.errorText}>Nenhum contrato encontrado.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f2f2f2" />
      <View style={styles.pageContainer}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.logoText}>gig</Text>
          <Text style={styles.headerTitle}>Contratos</Text>
        </View>

        {/* Abas de Navegação */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "Painel" && styles.activeTab]}
            onPress={() => setActiveTab("Painel")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "Painel" && styles.activeTabText,
              ]}
            >
              Painel
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "Pendentes" && styles.activeTab]}
            onPress={() => setActiveTab("Pendentes")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "Pendentes" && styles.activeTabText,
              ]}
            >
              Pendentes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "Aceitos" && styles.activeTab]}
            onPress={() => setActiveTab("Aceitos")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "Aceitos" && styles.activeTabText,
              ]}
            >
              Aceitos
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "Recusados" && styles.activeTab]}
            onPress={() => setActiveTab("Recusados")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "Recusados" && styles.activeTabText,
              ]}
            >
              Recusados
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "Cancelados" && styles.activeTab]}
            onPress={() => setActiveTab("Cancelados")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "Cancelados" && styles.activeTabText,
              ]}
            >
              Cancelados
            </Text>
          </TouchableOpacity>
        </View>

        {/* Conteúdo: Painel (Dashboard) ou Lista */}
        {activeTab === "Painel" ? (
          <View style={styles.contentWrapper}>
            <ContractsDashboard allContracts={contracts} />
          </View>
        ) : isMobile ? (
          <ScrollView contentContainerStyle={styles.scrollViewContent}>
            {getFilteredContracts().map((contract) => (
              <ContractCard
                key={contract.id}
                contract={contract}
                profileId={userInfo.id}
                userType={userInfo.type}
              />
            ))}
            {getFilteredContracts().length === 0 && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  Nenhum contrato {activeTab.toLowerCase()} encontrado.
                </Text>
              </View>
            )}
          </ScrollView>
        ) : (
          <FlatList
            data={getFilteredContracts()}
            keyExtractor={(item) => item.id}
            numColumns={3}
            columnWrapperStyle={styles.gridRow}
            contentContainerStyle={styles.gridContent}
            renderItem={({ item }) => (
              <View style={styles.cardWrapDesktop}>
                <ContractCard
                  contract={item}
                  profileId={userInfo.id}
                  userType={userInfo.type}
                />
              </View>
            )}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  Nenhum contrato {activeTab.toLowerCase()} encontrado.
                </Text>
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

// Estilos
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f2f2f2",
  },
  headerContainer: {
    alignItems: "center",
    paddingVertical: 20,
    marginBottom: 10,
  },
  pageContainer: {
    flex: 1,
    width: "100%",
    maxWidth: MAX_WIDTH,
    alignSelf: "center",
    paddingHorizontal: 12,
  },
  contentWrapper: {
    flex: 1,
    width: "100%",
    maxWidth: MAX_WIDTH,
    alignSelf: "center",
  },
  logoText: {
    fontSize: 28,
    fontWeight: "bold",
    fontStyle: "italic",
    color: "#333",
  },
  headerTitle: {
    fontSize: 22,
    color: "#555",
    marginTop: 4,
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    width: "100%",
    maxWidth: MAX_WIDTH,
    alignSelf: "center",
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: "#000",
  },
  tabText: {
    fontSize: 10,
    fontWeight: "500",
    color: "#000",
  },
  activeTabText: {
    color: "#fff",
    fontWeight: "bold",
  },
  scrollViewContent: {
    paddingBottom: 20,
  },
  gridContent: {
    paddingHorizontal: 12,
    paddingBottom: 20,
    width: "100%",
    maxWidth: MAX_WIDTH,
    alignSelf: "center",
  },
  gridRow: {
    justifyContent: "flex-start",
    paddingHorizontal: 6,
    marginBottom: 8,
  },
  cardWrapDesktop: {
    width: "33.3333%",
    paddingHorizontal: 6,
    marginBottom: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  loadingText: {
    fontSize: 18,
    color: "#333",
    textAlign: "center",
    marginTop: 50,
  },
  errorText: {
    fontSize: 16,
    color: "#dc3545",
    textAlign: "center",
    marginTop: 50,
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: 60,
    backgroundColor: "#222",
    borderTopWidth: 1,
    borderTopColor: "#444",
  },
});

export default AdminContractScreen;
