import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import SearchScreen from "../search";
import { useQuery } from "@tanstack/react-query";
import { getMe } from "@/src/services/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "@/src/services/api";

// Mock das dependências
jest.mock("@/src/services/api", () => ({
  get: jest.fn(),
}));
jest.mock("@/src/services/auth", () => ({
  getMe: jest.fn(),
}));
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));
jest.mock("expo-router", () => ({
  router: {
    push: jest.fn(),
  },
}));

const mockQueryClient = {
  invalidateQueries: jest.fn(),
};

jest.mock("@tanstack/react-query", () => ({
  ...jest.requireActual("@tanstack/react-query"),
  useQueryClient: () => mockQueryClient,
  useQuery: jest.fn(),
}));

// --- Mocks de Dados ---
const mockBands = [
  { id: 1, bandName: "The Testers", genre: "Rock", city: "Testville", type: "band" },
  { id: 2, bandName: "Mock Stars", genre: "Pop", city: "Mockington", type: "band" },
];

const mockVenues = [
  { id: "v1", name: "The Mock Tavern", type: "Bar", city: "Mockington", itemType: "venue" },
  { id: "v2", name: "Test Arena", type: "Arena", city: "Testville", itemType: "venue" },
];

const mockUser = {
  id: "user-1",
  name: "John Doe",
  role: "user",
};

describe("SearchScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue("fake-token");
    (getMe as jest.Mock).mockResolvedValue(mockUser);
  });

  it("should render loading state initially", () => {
    (useQuery as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
      isError: false,
    });

    const { getByText } = render(<SearchScreen />);
    expect(getByText("Buscando...")).toBeTruthy();
  });

  it("should render empty state when there is no search term", async () => {
    (useQuery as jest.Mock).mockReturnValue({
      data: { bands: [], venues: [] },
      isLoading: false,
      isError: false,
    });

    const { findByText } = render(<SearchScreen />);
    expect(await findByText("Digite para buscar")).toBeTruthy();
  });

  it("should display search results for bands and venues", async () => {
    (useQuery as jest.Mock).mockReturnValue({
      data: { bands: mockBands, venues: mockVenues },
      isLoading: false,
      isError: false,
    });

    const { findByText } = render(<SearchScreen />);
    expect(await findByText("The Testers")).toBeTruthy();
    expect(await findByText("The Mock Tavern")).toBeTruthy();
  });

  it("should filter results by bands", async () => {
    (useQuery as jest.Mock).mockImplementation(({ queryKey }) => {
      const filterType = queryKey[2];
      if (filterType === "band") {
        return {
          data: { bands: mockBands, venues: [] },
          isLoading: false,
          isError: false,
        };
      }
      return {
        data: { bands: mockBands, venues: mockVenues },
        isLoading: false,
        isError: false,
      };
    });

    const { getByText, queryByText, findByText } = render(<SearchScreen />);

    // Aguarda a renderização inicial
    expect(await findByText("The Testers")).toBeTruthy();
    expect(await findByText("The Mock Tavern")).toBeTruthy();

    // Clica no botão de filtro de bandas
    fireEvent.press(getByText("Bandas"));

    // Aguarda a atualização da UI
    await waitFor(() => {
      expect(queryByText("The Testers")).toBeTruthy();
      expect(queryByText("The Mock Tavern")).toBeNull();
    });
  });

  it("should show error state on fetch failure", async () => {
    (useQuery as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      isError: true,
    });

    const { findByText } = render(<SearchScreen />);
    expect(await findByText("Erro ao buscar")).toBeTruthy();
  });

  it("should not show the logged-in user's band in the search results", async () => {
    const loggedInBandUser = {
      id: "user-2",
      name: "LoggedIn Rocker",
      role: "band",
      band: { id: 1, bandName: "The Testers" },
    };
    (getMe as jest.Mock).mockResolvedValue(loggedInBandUser);

    (useQuery as jest.Mock).mockReturnValue({
      data: { bands: mockBands, venues: mockVenues },
      isLoading: false,
      isError: false,
    });

    const { queryByText, findByText } = render(<SearchScreen />);

    await waitFor(() => {
      expect(queryByText("The Testers")).toBeNull();
    });
    expect(await findByText("Mock Stars")).toBeTruthy();
    expect(await findByText("The Mock Tavern")).toBeTruthy();
  });
});
