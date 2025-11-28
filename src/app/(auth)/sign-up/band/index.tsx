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
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { Link, router } from "expo-router";
import { Picker } from "@react-native-picker/picker";
import { useMutation } from "@tanstack/react-query";
import { BandSignUpData } from "@/src/types/auth";
import { bandSignUp } from "@/src/services/auth";

const genres = [
  "Rock",
  "Pop",
  "Jazz",
  "Blues",
  "Sertanejo",
  "Electrônica",
  "Rap",
  "Reggae",
  "Samba",
  "Axé",
  "Clássica",
  "Metal",
  "Punk",
  "Alternativo",
  "Indie",
  "Gospel",
  "Funk",
  "Outros",
];

export default function BandSignUp() {
  const { width } = useWindowDimensions();
  const [formData, setFormData] = useState<BandSignUpData>({
    name: "",
    genre: "",
    city: "",
    email: "",
    password: "",
    role: "band",
  });

  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const { mutate: createBand, isPending } = useMutation({
    mutationFn: bandSignUp,
    onSuccess: () => {
      Alert.alert("Sucesso", "Banda cadastrada com sucesso!");
      router.push("/(auth)/sign-in");
    },
    onError: (error: any) => {
      Alert.alert(
        "Erro",
        error?.response?.data?.message || "Falha ao cadastrar a banda"
      );
    },
  });

  const handleInputChange = (field: keyof BandSignUpData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSignUp = () => {
    if (
      !formData.name.trim() ||
      !formData.genre ||
      !formData.city.trim() ||
      !formData.email.trim() ||
      !formData.password.trim()
    ) {
      Alert.alert("Erro", "Por favor, preencha todos os campos");
      return;
    }

    if (!agreeToTerms) {
      Alert.alert("Erro", "Você deve concordar com os termos e condições");
      return;
    }

    createBand(formData);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollViewContent}
        >
          <View
            style={[
              styles.content,
              width > 768 && styles.contentDesktop,
            ]}
          >
            {/* Logo */}
            <View style={styles.logoContainer}>
              <View style={styles.logoBox}>
                <Text style={styles.logoText}>gig</Text>
              </View>
            </View>

            {/* Title */}
            <Text style={styles.title}>Banda</Text>

            {/* Login Link */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Já tem uma conta? </Text>
              <Link href="/(auth)/sign-in" asChild>
                <TouchableOpacity>
                  <Text style={styles.loginLink}>Login</Text>
                </TouchableOpacity>
              </Link>
            </View>

            <View style={styles.switchContainer}>
              <Link href="/(auth)/sign-up/venue" asChild>
                <TouchableOpacity>
                  <Text style={styles.switchLink}>Sou estabelecimento</Text>
                </TouchableOpacity>
              </Link>
            </View>

            {/* Form */}
            <View style={styles.formContainer}>
              <TextInput
                style={styles.input}
                placeholder="Nome da Banda"
                placeholderTextColor="#999"
                value={formData.name}
                onChangeText={(value) => handleInputChange("name", value)}
                autoCapitalize="words"
              />

              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.genre}
                  onValueChange={(value) => handleInputChange("genre", value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Selecione o gênero" value="" />
                  {genres.map((genre) => (
                    <Picker.Item key={genre} label={genre} value={genre} />
                  ))}
                </Picker>
              </View>

              <TextInput
                style={styles.input}
                placeholder="Cidade/Estado"
                placeholderTextColor="#999"
                value={formData.city}
                onChangeText={(value) => handleInputChange("city", value)}
                autoCapitalize="words"
              />

              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#999"
                value={formData.email}
                onChangeText={(value) => handleInputChange("email", value)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />

              <TextInput
                style={styles.input}
                placeholder="Senha"
                placeholderTextColor="#999"
                value={formData.password}
                onChangeText={(value) => handleInputChange("password", value)}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="password"
              />
            </View>

            {/* Terms and Conditions */}
            <View style={styles.checkboxContainer}>
              <TouchableOpacity
                testID="terms-checkbox"
                onPress={() => setAgreeToTerms(!agreeToTerms)}
                style={styles.checkboxTouchable}
              >
                <View
                  style={[
                    styles.checkbox,
                    agreeToTerms && styles.checkboxChecked,
                  ]}
                >
                  {agreeToTerms && <Text style={styles.checkmark}>✓</Text>}
                </View>
              </TouchableOpacity>

              <View style={styles.termsTextContainer}>
                <Text style={styles.termsText}>Li e concordo com os </Text>
                <Link href="/(auth)/terms-and-conditions" asChild>
                  <TouchableOpacity>
                    <Text style={styles.termsLink}>termos e condições</Text>
                  </TouchableOpacity>
                </Link>
                <Text style={styles.termsText}>.</Text>
              </View>
            </View>

            {/* Sign Up Button */}
            <TouchableOpacity
              style={[
                styles.signUpButton,
                isPending && styles.signUpButtonDisabled,
              ]}
              onPress={handleSignUp}
              disabled={isPending}
            >
              <Text style={styles.signUpButtonText}>
                {isPending ? "Criando conta..." : "Criar conta"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 30,
    paddingTop: 50,
    paddingBottom: 30,
  },
  contentDesktop: {
    maxWidth: 500,
    alignSelf: "center",
    padding: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    backgroundColor: "#fafafa",
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 30,
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
    marginBottom: 20,
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  loginText: {
    color: "#666",
    fontSize: 16,
  },
  loginLink: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  switchContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  switchLink: {
    color: "#007AFF",
    fontSize: 16,
    textDecorationLine: "underline",
  },
  formContainer: {
    marginBottom: 20,
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
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    marginBottom: 15,
    backgroundColor: "#fafafa",
    overflow: "hidden",
  },
  picker: {
    height: 50,
    color: "#000",
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 30,
  },
  checkboxTouchable: {
    marginRight: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  termsTextContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  termsText: {
    color: '#666',
    fontSize: 14,
  },
  termsLink: {
    color: '#007AFF',
    textDecorationLine: 'underline',
    fontSize: 14,
  },
  signUpButton: {
    backgroundColor: "#2C2B2B",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  signUpButtonDisabled: {
    backgroundColor: "#999",
  },
  signUpButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
  },
});
