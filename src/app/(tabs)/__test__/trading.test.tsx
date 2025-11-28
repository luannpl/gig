import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import AdminContractScreen from "../trading";
import { useQuery } from "@tanstack/react-query";
import api from "@/src/services/api";

jest.mock("expo-constants", () => ({
  expoConfig: {
    extra: {
      apiUrl: "https://mock.api.com",
    },
  },
}));

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

jest.mock("@tanstack/react-query", () => ({
  ...jest.requireActual("@tanstack/react-query"),
  useQuery: jest.fn(),
}));

jest.mock("@/src/services/api");

const mockContracts = [
  { id: "1", status: "pending" },
  { id: "2", status: "confirmed" },
  { id: "3", status: "declined" },
  { id: "4", status: "canceled" },
  { id: "5", status: "pending" },
];

const mockMeBand = {
  band: { id: 1 },
  venue: null,
};

describe("AdminContractScreen", () => {
  beforeEach(() => {
    (useQuery as jest.Mock).mockClear();
  });

  it("should render loading state initially", () => {
    (useQuery as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
    });
    const { getByText } = render(<AdminContractScreen />);
    expect(getByText("Carregando...")).toBeTruthy();
  });

  it("should render contracts after loading", async () => {
    (useQuery as jest.Mock).mockImplementation(({ queryKey }) => {
      if (queryKey[0] === "me") {
        return { data: mockMeBand, isLoading: false };
      }
      if (queryKey[0] === "contracts") {
        return { data: mockContracts, isLoading: false };
      }
      return { data: undefined, isLoading: false };
    });
    const { findByText } = render(<AdminContractScreen />);
    expect(await findByText("Painel")).toBeTruthy();
    expect(await findByText("ContractsDashboard")).toBeTruthy();
  });

  it("should filter contracts by status", async () => {
    (useQuery as jest.Mock).mockImplementation(({ queryKey }) => {
      if (queryKey[0] === "me") {
        return { data: mockMeBand, isLoading: false };
      }
      if (queryKey[0] === "contracts") {
        return { data: mockContracts, isLoading: false };
      }
      return { data: undefined, isLoading: false };
    });

    const { getByText, queryAllByText, findByText } = render(
      <AdminContractScreen />
    );

    await findByText("Pendentes");
    fireEvent.press(getByText("Pendentes"));
    await waitFor(() => {
      const contractCards = queryAllByText(/ContractCard: \d/);
      expect(contractCards.length).toBe(2);
    });

    fireEvent.press(getByText("Aceitos"));
    await waitFor(() => {
      const contractCards = queryAllByText(/ContractCard: \d/);
      expect(contractCards.length).toBe(1);
    });

    fireEvent.press(getByText("Recusados"));
    await waitFor(() => {
      const contractCards = queryAllByText(/ContractCard: \d/);
      expect(contractCards.length).toBe(1);
    });

    fireEvent.press(getByText("Cancelados"));
    await waitFor(() => {
      const contractCards = queryAllByText(/ContractCard: \d/);
      expect(contractCards.length).toBe(1);
    });
  });
});

jest.mock("@/src/components/ContractCard", () => {
  const { View, Text } = require("react-native");
  return ({ contract }) => (
    <View>
      <Text>ContractCard: {contract.id}</Text>
    </View>
  );
});

jest.mock("@/src/components/ContractsDashboard", () => {
  const { View, Text } = require("react-native");
  return () => (
    <View>
      <Text>ContractsDashboard</Text>
    </View>
  );
});
