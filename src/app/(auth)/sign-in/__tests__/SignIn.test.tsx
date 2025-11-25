import React from "react";
import { render, screen } from "@testing-library/react-native";
import SignIn from "../index";

// 1. MOCK OBRIGATÓRIO: AsyncStorage (Nativo)
jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
}));

// 2. MOCK NOVO E DEFINITIVO: Mock do Serviço de Auth
// Ao mockar isso, o Jest NÃO carrega o arquivo api.ts, resolvendo o erro de Constants.
jest.mock("@/src/services/auth", () => ({
  authSignIn: jest.fn(),
}));

// 3. MOCK do React Query
// Simula o hook useMutation para retornar estados controlados
jest.mock("@tanstack/react-query", () => ({
  useMutation: () => ({
    mutate: jest.fn(),
    isPending: false,
  }),
}));

// 4. MOCK do Expo Router
jest.mock("expo-router", () => ({
  Link: ({ children }: any) => children,
  router: { replace: jest.fn() },
}));

describe("Tela de SignIn", () => {
  it("deve exibir o texto Entrar", () => {
    render(<SignIn />);

    const textElement = screen.getByText("Entrar");

    expect(textElement).toBeTruthy();
  });
  it("deve exibir o texto Cadastre-se", () => {
    render(<SignIn />);

    const textElement = screen.getByText("Cadastre-se");

    expect(textElement).toBeTruthy();
  });
  it("deve exibir o texto Esqueceu a senha?", () => {
    render(<SignIn />);

    const textElement = screen.getByText("Esqueceu a senha?");

    expect(textElement).toBeTruthy();
  });
});
