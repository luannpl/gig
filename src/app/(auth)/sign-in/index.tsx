import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Link, router } from "expo-router";
import { LoginData } from "@/src/types/auth";
import { useMutation } from "@tanstack/react-query";
import { authSignIn } from "@/src/services/auth";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { mutate: login, isPending } = useMutation({
    mutationFn: (data: LoginData) => authSignIn(data),
    onSuccess: async (data) => {
      await AsyncStorage.setItem("token", data.accessToken);
      await AsyncStorage.setItem("user", JSON.stringify(data.user));

      Alert.alert("Sucesso", "Login realizado com sucesso!");
      router.replace("/(tabs)/home");
    },
    onError: (error: any) => {
      Alert.alert("Erro", error?.response?.data?.message || "Falha no login");
    },
  });

  const handleLogin = () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Erro", "Por favor, preencha todos os campos");
      return;
    }
    login({ email, password });
  };

  const { width } = Dimensions.get("window");
  const isWeb = Platform.OS === "web";
  const isLargeScreen = width > 768;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={[styles.content, isWeb && isLargeScreen && styles.contentWeb]}>
          {/* Card Container for Web */}
          <View style={[styles.formContainer, isWeb && isLargeScreen && styles.formCard]}>
            {/* Logo Container */}
            <View style={styles.logoContainer}>
              <View style={styles.logoBox}>
                <Text style={styles.logoText}>gig</Text>
              </View>
            </View>

            {/* Login Title */}
            <Text style={styles.title}>login</Text>
            <Text style={[styles.subtitle, isWeb && isLargeScreen && styles.subtitleWeb]}>
              Entre com sua conta para continuar
            </Text>

            {/* Input Fields */}
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, isWeb && isLargeScreen && styles.inputWeb]}
                placeholder="Digite seu email"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />

              <TextInput
                style={[styles.input, isWeb && isLargeScreen && styles.inputWeb]}
                placeholder="Digite sua senha"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="password"
              />
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={[
                styles.loginButton,
                isPending && styles.loginButtonDisabled,
                isWeb && isLargeScreen && styles.loginButtonWeb,
              ]}
              onPress={handleLogin}
              disabled={isPending}
            >
              <Text style={styles.loginButtonText}>
                {isPending ? "Entrando..." : "Entrar"}
              </Text>
            </TouchableOpacity>

            {/* Forgot Password Link */}
            <View style={styles.forgotPassword}>
              <TouchableOpacity>
                <Text style={styles.forgotPasswordText}>Esqueceu a senha?</Text>
              </TouchableOpacity>
            </View>

            {/* Sign Up Link */}
            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Não tem conta? </Text>
              <TouchableOpacity>
                <Text style={styles.signupLink}>Cadastre-se</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: "center",
    paddingTop: 50,
  },
  contentWeb: {
    alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: "#f9fafb",
  },
  formContainer: {
    width: "100%",
  },
  formCard: {
    maxWidth: 480,
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 48,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoBox: {
    width: 120,
    height: 80,
    borderWidth: 2,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fafafa",
  },
  logoText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000",
    fontStyle: "italic",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 32,
  },
  subtitleWeb: {
    fontSize: 16,
    marginBottom: 40,
  },
  inputContainer: {
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 15,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: "#fafafa",
    color: "#000",
  },
  inputWeb: {
    paddingVertical: 18,
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: "#2C2B2B",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 20,
  },
  loginButtonWeb: {
    paddingVertical: 18,
    cursor: "pointer",
  },
  loginButtonDisabled: {
    backgroundColor: "#999",
    opacity: 0.7,
  },
  loginButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
  },
  forgotPassword: {
    alignItems: "center",
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: "#666",
    fontSize: 16,
    textDecorationLine: "underline",
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signupText: {
    color: "#666",
    fontSize: 16,
  },
  signupLink: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});