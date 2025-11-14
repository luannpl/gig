import { router, Tabs } from "expo-router";
import { AntDesign, FontAwesome } from "@expo/vector-icons";
import { View } from "react-native";
import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getMe } from "@/src/services/auth";

export default function TabsLayout() {
  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        router.replace("/(auth)/sign-in");
        return;
      }
      const user = await getMe(token);
      if (!user) {
        router.replace("/(auth)/sign-in");
        return;
      }
    };

    checkAuth();
  }, []);
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: "#2C2B2B" },
        tabBarActiveTintColor: "#bfdbfe",
        tabBarInactiveTintColor: "#fff",
        tabBarLabelStyle: { color: "#fff" },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                transform: [{ scale: focused ? 1.1 : 1 }],
              }}
            >
              <FontAwesome size={focused ? 30 : 26} name="home" color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Busca",
          tabBarIcon: ({ color, focused }) => (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                transform: [{ scale: focused ? 1.1 : 1 }],
              }}
            >
              <FontAwesome
                size={focused ? 30 : 26}
                name="search"
                color={color}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, focused }) => (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                transform: [{ scale: focused ? 1.1 : 1 }],
              }}
            >
              <FontAwesome size={focused ? 30 : 26} name="user" color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="trading"
        options={{
          title: "Propostas",
          tabBarIcon: ({ color, focused }) => (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                transform: [{ scale: focused ? 1.1 : 1 }],
              }}
            >
              <FontAwesome
                size={focused ? 30 : 26}
                name="dollar"
                color={color}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: "Agenda",
          tabBarIcon: ({ color, focused }) => (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                transform: [{ scale: focused ? 1.1 : 1 }],
              }}
            >
              <AntDesign
                size={focused ? 30 : 26}
                name="calendar"
                color={color}
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
