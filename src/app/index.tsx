import { Link } from "expo-router";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";

export default function Index() {
  return (
    <View className="flex-1 items-center justify-center bg-slate-800">
      <Link href="/sign-up" asChild>
        <TouchableOpacity>
          <Text className="text-white">Cadastro</Text>
        </TouchableOpacity>
      </Link>
      <Text className="text-white mt-4">Bem-vindo ao GIG</Text>
    </View>
  );
}
