import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import BandSignUpScreen from "../index";
import { router } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import { bandSignUp } from "@/src/services/auth";
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
  bandSignUp: jest.fn(),
}));

jest.spyOn(Alert, "alert");

describe("BandSignUpScreen", () => {
  const mockMutate = jest.fn();

  beforeEach(() => {
    (useMutation as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });
    mockMutate.mockClear();
  });

  it("should display an error if fields are empty", async () => {
    const { getByText } = render(<BandSignUpScreen />);
    fireEvent.press(getByText("Criar conta"));
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Erro",
        "Por favor, preencha todos os campos"
      );
    });
  });

  it("should display an error if terms are not agreed to", async () => {
    const { getByText, getByPlaceholderText } = render(<BandSignUpScreen />);
    fireEvent.changeText(getByPlaceholderText("Nome da Banda"), "Test Band");
    fireEvent.changeText(getByPlaceholderText("Cidade/Estado"), "Test City");
    fireEvent.changeText(getByPlaceholderText("Email"), "test@test.com");
    fireEvent.changeText(getByPlaceholderText("Senha"), "password");
    fireEvent.press(getByText("Rock"));

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
      <BandSignUpScreen />
    );
    fireEvent.changeText(getByPlaceholderText("Nome da Banda"), "Test Band");
    fireEvent.changeText(getByPlaceholderText("Cidade/Estado"), "Test City");
    fireEvent.changeText(getByPlaceholderText("Email"), "test@test.com");
    fireEvent.changeText(getByPlaceholderText("Senha"), "password");
    fireEvent.press(getByText("Rock"));
    fireEvent.press(getByTestId("terms-checkbox"));

    fireEvent.press(getByText("Criar conta"));

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalled();
    });
  });
});
