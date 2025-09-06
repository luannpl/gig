import { Link } from "expo-router";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";

export default function Index() {
  return (
    <View style={styles.container}>
      <Link href="/sign-up" asChild>
        <TouchableOpacity>
          <Text>Cadastro</Text>
        </TouchableOpacity>
      </Link>
      <Text>Bem-vindo ao GIG</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
