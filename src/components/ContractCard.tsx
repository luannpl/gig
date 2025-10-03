// src/components/ContractCard.tsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Contract } from "../types/contracts";

// Definindo o tipo das props que o componente recebe
interface ContractCardProps {
  contract: Contract;
}

const ContractCard: React.FC<ContractCardProps> = ({ contract }) => {
  return (
    <View style={styles.cardContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>{contract.title}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{contract.status}</Text>
        </View>
      </View>

      <View style={styles.detailsContainer}>
        <Text style={styles.detailText}>{contract.type}</Text>
        <Text style={styles.detailText}>{contract.dateTime}</Text>
        <Text style={styles.detailText}>{contract.location}</Text>
      </View>

      <Text style={styles.price}>{contract.price}</Text>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.acceptButton}>
          <Text style={styles.buttonText}>Aceitar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.rejectButton}>
          <Text style={styles.buttonText}>Recusar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Os estilos permanecem os mesmos...
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
    backgroundColor: "#DFFF00",
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#000",
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
