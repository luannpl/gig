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

// Tipando o array de dados com o tipo que criamos
const pendingContracts: Contract[] = [
  {
    id: "1",
    title: "Aniversário da Unifor",
    status: "Pendente",
    type: "Aniversário",
    dateTime: "05/09/2025 - 19:00:00 - 21:30:00",
    location:
      "Floresta Bar - Rua Tenente João Albano, Aerolândia, Fortaleza - CEP 60850710",
    price: "R$ 2.000,00",
  },
  {
    id: "2",
    title: "Aniversário da Unifor",
    status: "Pendente",
    type: "Aniversário",
    dateTime: "05/09/2025 - 19:00:00 - 21:30:00",
    location:
      "Floresta Bar - Rua Tenente João Albano, Aerolândia, Fortaleza - CEP 60850710",
    price: "R$ 2.000,00",
  },
];

// Definindo o tipo para as abas
type ActiveTab = "Pendentes" | "Aceitos" | "Recusados";

const AdminContractScreen: React.FC = () => {
  const bandId = 1;
  const [activeTab, setActiveTab] = useState<ActiveTab>("Pendentes");
  const { data: contracts } = useQuery<Contract[]>({
    queryKey: ["contracts", bandId],
    queryFn: async () => {
      const { data } = await api.get<Contract[]>(`/contract/band/${bandId}`);
      return data;
    },
  });
  console.log(contracts);
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
        {activeTab === "Pendentes" &&
          pendingContracts.map((contract) => (
            <ContractCard key={contract.id} contract={contract} />
          ))}
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
