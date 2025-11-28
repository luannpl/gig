import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import VenueSignUpScreen from "../index";
import { router } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import { venueSignUp } from "@/src/services/auth";
import { Alert } from "react-native";

jest.mock("@react-native-picker/picker", () => {
  const React = require("react");
  const { View, Text } = require("react-native");
  const MockPicker = ({ children, onValueChange }) => {
    return (
      <View>
        {React.Children.map(children, (child) => (
          <Text onPress={() => onValueChange(child.props.value)}>
            {child.props.label}
          </Text>
        ))}
      </View>
    );
  };
  MockPicker.Item = ({ label }) => <Text>{label}</Text>;
  return { Picker: MockPicker };
});

jest.mock("expo-router", () => ({
  router: {
    push: jest.fn(),
  },
  Link: "Link",
}));

jest.mock("@tanstack/react-query", () => ({
  ...jest.requireActual("@tanstack/react-query"),
  useMutation: jest.fn(),
}));

jest.mock("@/src/services/auth", () => ({
  venueSignUp: jest.fn(),
}));

jest.spyOn(Alert, "alert");

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () =>
      Promise.resolve({
        localidade: "Test City",
        logradouro: "Test Street",
        bairro: "Test Neighborhood",
      }),
  })
) as jest.Mock;

describe("VenueSignUpScreen", () => {
  const mockMutate = jest.fn();

  beforeEach(() => {
    (useMutation as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });
    mockMutate.mockClear();
    (global.fetch as jest.Mock).mockClear();
  });

  it("should display an error if fields are empty", async () => {
    const { getByText } = render(<VenueSignUpScreen />);
    fireEvent.press(getByText("Criar conta"));
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Erro",
        "Por favor, preencha todos os campos"
      );
    });
  });

  it("should display an error if terms are not agreed to", async () => {
    const { getByText, getByPlaceholderText } = render(<VenueSignUpScreen />);
    fireEvent.changeText(
      getByPlaceholderText("Nome do Estabelecimento"),
      "Test Venue"
    );
    fireEvent.changeText(getByPlaceholderText("Email"), "test@test.com");
    fireEvent.changeText(getByPlaceholderText("Senha"), "password");
    fireEvent.changeText(getByPlaceholderText("CEP"), "12345-678");
    fireEvent.press(getByText("Bar"));

    fireEvent.press(getByText("Criar conta"));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Erro",
        "Você deve concordar com os termos e condições"
      );
    });
  });

  it("should call the mutation when the form is submitted correctly", async () => {
    const { getByText, getByPlaceholderText, getByTestId } = render(
      <VenueSignUpScreen />
    );
    fireEvent.changeText(
      getByPlaceholderText("Nome do Estabelecimento"),
      "Test Venue"
    );
    fireEvent.changeText(getByPlaceholderText("Email"), "test@test.com");
    fireEvent.changeText(getByPlaceholderText("Senha"), "password");
    fireEvent.changeText(getByPlaceholderText("CEP"), "12345-678");
    fireEvent.press(getByText("Bar"));
    fireEvent.press(getByTestId("terms-checkbox"));

    fireEvent.press(getByText("Criar conta"));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "https://viacep.com.br/ws/12345-678/json/"
      );
    });

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({
        name: "Test Venue",
        cep: "12345-678",
        city: "Test City",
        address: "Test Street, Test Neighborhood",
        type: "Bar",
        email: "test@test.com",
        password: "password",
        role: "venue",
      });
    });
  });
});
