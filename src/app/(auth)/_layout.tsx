import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#ffffff' },
      }}
    >
      <Stack.Screen name="sign-in/index" />
      <Stack.Screen name="sign-up/index" />
      <Stack.Screen name="sign-up/band/index" />
      <Stack.Screen name="sign-up/venue/index" />
      <Stack.Screen name="forgot-password/index" />
      <Stack.Screen name="reset-password/index" />
      <Stack.Screen name="terms-and-conditions/index" />
    </Stack>
  );
}