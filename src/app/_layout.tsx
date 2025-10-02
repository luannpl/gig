import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "../styles/global.css";
import { Stack } from "expo-router";

const queryClient = new QueryClient();
export default function MainLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }}></Stack>
    </QueryClientProvider>
  );
}
