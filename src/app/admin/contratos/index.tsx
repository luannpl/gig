// src/screens/ContratosScreen.tsx
import ContractCard from "@/src/components/ContractCard";
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
  TouchableOpacity,
  StatusBar,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

type Profile = {
  id: string;
  band: {
    id: number;
  } | null;
  venue: {
    id: string;
  } | null;
};

type ActiveTab = "Pendentes" | "Aceitos" | "Recusados";

const AdminContractScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>("Pendentes");

  const { data: me, isLoading: isLoadingProfile } = useQuery<Profile>({
    queryKey: ["me"],
    queryFn: async () => {
      const { data } = await api.get("/users/me");
      return data;
    },
  });

  // Determinar o ID e o tipo baseado no perfil do usuário
  const getUserInfo = () => {
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

  const { data: contracts, isLoading: isLoadingContracts } = useQuery<
    Contract[]
  >({
    queryKey: ["contracts", userInfo?.id, userInfo?.type],
    queryFn: async () => {
      if (!userInfo) throw new Error("Usuário não encontrado");
      const { data } = await api.get<Contract[]>(userInfo.endpoint);
      return data;
    },
    enabled: !!userInfo, // Só executa a query se o userInfo existir
  });

  console.log(contracts);

  // Função para filtrar contratos baseado na aba ativa
  const getFilteredContracts = () => {
    if (!contracts) return [];

    switch (activeTab) {
      case "Pendentes":
        return contracts.filter((contract) => contract.isConfirmed === null);
      case "Aceitos":
        return contracts.filter((contract) => contract.isConfirmed === true);
      case "Recusados":
        return contracts.filter((contract) => contract.isConfirmed === false);
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

      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.logoText}>gig</Text>
        <Text style={styles.headerTitle}>Contratos</Text>
      </View>

      {/* Abas de Navegação */}
      <View style={styles.tabContainer}>
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
      </View>

      {/* Lista de Contratos */}
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

      {/* Barra de Navegação Inferior */}
      <View style={styles.bottomNav}>
        <Icon name="home" size={30} color="#fff" />
        <Icon name="search" size={30} color="#fff" />
        <Icon name="camera-alt" size={30} color="#fff" />
        <Icon name="attach-money" size={30} color="#fff" />
        <Icon name="person" size={30} color="#fff" />
      </View>
    </SafeAreaView>
  );
};

// Os estilos permanecem os mesmos...
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
    fontSize: 16,
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
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
