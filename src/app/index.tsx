import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Index() {
  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem("token");
      console.log("Token encontrado:", token);
      if (token) {
        router.replace("/(tabs)/home");
      } else {
        router.replace("/(auth)/sign-in");
      }
    };

    checkAuth();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color="#000" />
    </View>
  );
}
