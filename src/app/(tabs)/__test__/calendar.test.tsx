import React from "react";
import { render } from "@testing-library/react-native";
import CalendarScreen from "../calendar";

jest.mock("@/src/components/ContractsCalendar", () => {
  const { View, Text } = require("react-native");
  return jest.fn(() => (
    <View>
      <Text>ContractsCalendar</Text>
    </View>
  ));
});

describe("CalendarScreen", () => {
  it("should render the ContractsCalendar component", () => {
    const { getByText } = render(<CalendarScreen />);
    expect(getByText("ContractsCalendar")).toBeTruthy();
  });
});
