import { router, Tabs } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function TabsLayout() {
  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        router.replace("/(auth)/sign-in");
      }
    };

    checkAuth();
  }, []);
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: "#2C2B2B" },
        tabBarActiveTintColor: "#fff",
        tabBarInactiveTintColor: "#fff",
        tabBarLabelStyle: { color: "#fff" },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="home" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="search" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="camera"
        options={{
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="camera" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="trading"
        options={{
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="dollar" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="user" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
