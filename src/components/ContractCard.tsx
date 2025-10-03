// src/components/ContractCard.tsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Contract } from "../types/contracts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../services/api";

// Definindo o tipo das props que o componente recebe
interface ContractCardProps {
  contract: Contract;
  profileId: string | number;
  userType: string;
}

const ContractCard: React.FC<ContractCardProps> = ({
  contract,
  profileId,
  userType,
}) => {
  const queryClient = useQueryClient();

  // Função para determinar quais botões mostrar baseado no userType e status do contrato
  const shouldShowAcceptButton = () => {
    // Venues não podem aceitar contratos
    if (userType === "venue") return false;

    // Bandas podem aceitar se não estiver confirmado
    return contract.isConfirmed !== true;
  };

  const shouldShowCancelButton = () => {
    // Venues podem cancelar se foi aceito ou está pendente
    if (userType === "venue") {
      return contract.isConfirmed === true || contract.isConfirmed === null;
    }

    // Bandas podem cancelar/recusar se não foi recusado
    return contract.isConfirmed !== false;
  };

  const { mutate: confirmContract } = useMutation({
    mutationFn: async () => {
      const { data } = await api.patch<Contract>(
        `/contract/confirm/${contract.id}`
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["contracts", profileId, userType],
      });
    },
    onError: (error) => {
      Alert.alert(error.message);
    },
  });

  const { mutate: cancelContract } = useMutation({
    mutationFn: async () => {
      const { data } = await api.patch<Contract>(
        `/contract/cancel/${contract.id}`
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["contracts", profileId, userType],
      });
    },
    onError: (error) => {
      Alert.alert(error.message);
    },
  });

  return (
    <View style={styles.cardContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>{contract.eventName}</Text>
      </View>

      <View style={styles.detailsContainer}>
        <Text style={styles.detailText}>{contract.eventType}</Text>
        <Text style={styles.detailText}>{contract.eventDate}</Text>
        <Text style={styles.detailText}>
          {contract.startTime} - {contract.endTime}
        </Text>
      </View>

      <Text style={styles.price}>{contract.budget}</Text>

      <View style={styles.buttonsContainer}>
        {shouldShowAcceptButton() && (
          <TouchableOpacity
            style={styles.acceptButton}
            onPress={() => confirmContract()}
          >
            <Text style={styles.buttonText}>Aceitar</Text>
          </TouchableOpacity>
        )}
        {shouldShowCancelButton() && (
          <TouchableOpacity
            style={styles.rejectButton}
            onPress={() => cancelContract()}
          >
            <Text style={styles.buttonText}>
              {userType === "venue" ? "Cancelar" : "Recusar"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  badge: {
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  detailsContainer: {
    marginBottom: 12,
  },
  detailText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  price: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2E8B57",
    marginBottom: 16,
  },
  buttonsContainer: {
    flexDirection: "column",
  },
  acceptButton: {
    backgroundColor: "#28a745",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  rejectButton: {
    backgroundColor: "#dc3545",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ContractCard;
