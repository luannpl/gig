import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import SignUpScreen from "../index";
import { router } from "expo-router";

jest.mock("expo-router", () => ({
  router: {
    push: jest.fn(),
  },
  Link: "Link",
}));

describe("SignUpScreen", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should navigate to band sign-up when band option is pressed", () => {
    const { getByText } = render(<SignUpScreen />);
    const bandOption = getByText("Banda");
    fireEvent.press(bandOption);
    expect(router.push).toHaveBeenCalledWith("/(auth)/sign-up/band");
  });

  it("should navigate to venue sign-up when venue option is pressed", () => {
    const { getByText } = render(<SignUpScreen />);
    const venueOption = getByText("Estabelecimento");
    fireEvent.press(venueOption);
    expect(router.push).toHaveBeenCalledWith("/(auth)/sign-up/venue");
  });
});
