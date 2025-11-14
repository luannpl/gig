// src/components/ContractCard.tsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Contract, ContractStatus } from "../types/contracts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../services/api";

interface ContractCardProps {
  contract: Contract;
  profileId: string | number;
  userType: "band" | "venue";
}

// Helper para obter texto e cor para o status
const getStatusProps = (status: ContractStatus) => {
  switch (status) {
    case "confirmed":
      return { text: "Aceito", color: "#28a745" };
    case "declined":
      return { text: "Recusado", color: "#dc3545" };
    case "canceled":
      return { text: "Cancelado", color: "#6c757d" };
    case "pending":
    default:
      return { text: "Pendente", color: "#ffc107" };
  }
};

const ContractCard: React.FC<ContractCardProps> = ({
  contract,
  profileId,
  userType,
}) => {
  const queryClient = useQueryClient();
  const statusProps = getStatusProps(contract.status);

  // Mutações para responder (banda) e cancelar (venue) permanecem as mesmas...
  const { mutate: respondToContract, isPending: isResponding } = useMutation({
    mutationFn: async (accepted: boolean) => {
      const { data } = await api.patch<Contract>(
        `/contract/${contract.id}/respond`,
        { accepted }
      );
      return data;
    },
    onSuccess: () => {
      Alert.alert("Sucesso", "Sua resposta foi enviada.");
      queryClient.invalidateQueries({
        queryKey: ["contracts", profileId, userType],
      });
    },
    onError: (error: any) => {
      Alert.alert(
        "Erro",
        error.response?.data?.message ||
          "Não foi possível responder ao contrato."
      );
    },
  });

  const { mutate: cancelContract, isPending: isCanceling } = useMutation({
    mutationFn: async () => {
      const { data } = await api.patch<Contract>(
        `/contract/${contract.id}/cancel`
      );
      return data;
    },
    onSuccess: () => {
      Alert.alert("Sucesso", "O contrato foi cancelado.");
      queryClient.invalidateQueries({
        queryKey: ["contracts", profileId, userType],
      });
    },
    onError: (error: any) => {
      Alert.alert(
        "Erro",
        error.response?.data?.message || "Não foi possível cancelar o contrato."
      );
    },
  });

  const renderActionButtons = () => {
    // Para BANDAS, os botões só aparecem se o contrato estiver PENDENTE.
    if (userType === "band" && contract.status === "pending") {
      return (
        <>
          <TouchableOpacity
            style={styles.acceptButton}
            onPress={() => respondToContract(true)}
            disabled={isResponding}
          >
            <Text style={styles.buttonText}>Aceitar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.rejectButton}
            onPress={() => respondToContract(false)}
            disabled={isResponding}
          >
            <Text style={styles.buttonText}>Recusar</Text>
          </TouchableOpacity>
        </>
      );
    }

    // Para VENUES, o botão aparece se o contrato estiver PENDENTE ou CONFIRMADO.
    if (
      userType === "venue" &&
      (contract.status === "pending" || contract.status === "confirmed")
    ) {
      // Calculamos se o cancelamento está dentro do prazo permitido
      const today = new Date();
      const eventDate = new Date(contract.eventDate + "T00:00:00");
      const diffInTime = eventDate.getTime() - today.getTime();
      const diffInDays = diffInTime / (1000 * 3600 * 24);
      const isWithinDeadline = diffInDays > 7;

      return (
        <View>
          <TouchableOpacity
            style={[
              styles.cancelButton,
              !isWithinDeadline && styles.disabledButton, // Aplica estilo de desabilitado
            ]}
            onPress={() => cancelContract()}
            disabled={!isWithinDeadline || isCanceling} // Desabilita se fora do prazo ou carregando
          >
            <Text style={styles.buttonText}>Cancelar Proposta</Text>
          </TouchableOpacity>

          {/* Mostra o aviso apenas se o botão estiver desabilitado pelo prazo */}
          {!isWithinDeadline && (
            <Text style={styles.warningText}>
              Cancelamento não permitido com 7 dias ou menos de antecedência.
            </Text>
          )}
        </View>
      );
    }

    // Para todos os outros casos (ex: status 'declined', 'canceled'), não mostra botões.
    return null;
  };

  return (
    <View style={styles.cardContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>{contract.eventName}</Text>
        <View style={[styles.badge, { backgroundColor: statusProps.color }]}>
          <Text style={styles.badgeText}>{statusProps.text}</Text>
        </View>
      </View>

      <View style={styles.detailsContainer}>
        <Text style={styles.detailText}>
          {userType === "band"
            ? `De: ${contract.requester.name}`
            : `Para: ${contract.provider.bandName}`}
        </Text>
        <Text style={styles.detailText}>
          Data:{" "}
          {new Date(contract.eventDate).toLocaleDateString("pt-BR", {
            timeZone: "UTC",
          })}
        </Text>
        <Text style={styles.detailText}>
          Horário: {contract.startTime} - {contract.endTime}
        </Text>
      </View>

      <Text style={styles.price}>
        {new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(contract.budget)}
      </Text>

      <View style={styles.buttonsContainer}>{renderActionButtons()}</View>
    </View>
  );
};

// ... (os estilos permanecem os mesmos)
const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
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
    flex: 1,
  },
  badge: {
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginLeft: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#FFFFFF",
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
  cancelButton: {
    backgroundColor: "#6c757d", // Cor cinza para cancelar
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#B0B0B0", // Cor cinza mais clara para indicar que está desabilitado
    opacity: 0.7,
  },
  warningText: {
    fontSize: 12,
    color: "#666", // Cor de aviso sutil
    textAlign: "center",
    marginTop: 8,
    fontStyle: "italic",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ContractCard;
