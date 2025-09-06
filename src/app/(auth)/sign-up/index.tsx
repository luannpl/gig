import { StyleSheet, Text, View } from "react-native";
import { Link } from "expo-router";

export default function SignUp() {
  return (
    <View style={styles.container}>
      <Text> Criar Conta </Text>
      <Link href="/">Voltar</Link>
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
