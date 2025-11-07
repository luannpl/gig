import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { Link, router } from 'expo-router';

export default function SignUp() {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const isLargeScreen = width > 768;
  const isExtraLarge = width > 1024;

  const handleBandSignUp = () => {
    router.push('/(auth)/sign-up/band');
  };

  const handleVenueSignUp = () => {
    router.push('/(auth)/sign-up/venue');
  };

  return (
    <SafeAreaView style={[styles.container, isWeb && isLargeScreen && styles.containerWeb]}>
      <View style={[styles.content, isWeb && isLargeScreen && styles.contentWeb]}>
        <View style={[styles.formContainer, isWeb && isLargeScreen && styles.formCard]}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <View style={styles.logoBox}>
              <Text style={styles.logoText}>gig</Text>
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>Criar Conta</Text>
          <Text style={styles.subtitle}>Escolha o tipo de conta que deseja criar:</Text>

          {/* Account Type Options */}
          <View style={[styles.optionsContainer, isExtraLarge && styles.optionsContainerGrid]}>
            <TouchableOpacity style={styles.optionCard} onPress={handleBandSignUp}>
              <View style={styles.optionIcon}>
                <Text style={styles.iconText}>🎵</Text>
              </View>
              <Text style={styles.optionTitle}>Banda</Text>
              <Text style={styles.optionDescription}>
                Para músicos e bandas que querem encontrar shows e oportunidades
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionCard} onPress={handleVenueSignUp}>
              <View style={styles.optionIcon}>
                <Text style={styles.iconText}>🏢</Text>
              </View>
              <Text style={styles.optionTitle}>Estabelecimento</Text>
              <Text style={styles.optionDescription}>
                Para bares, casas de show e locais que querem contratar bandas
              </Text>
            </TouchableOpacity>
          </View>

          {/* Back to Login */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Já tem uma conta? </Text>
            <Link href="/(auth)/sign-in" asChild>
              <TouchableOpacity>
                <Text style={styles.loginLink}>Faça login</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  containerWeb: {
    backgroundColor: '#f9fafb',
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: 'center',
    paddingTop: 50,
  },
  contentWeb: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  formContainer: {
    width: '100%',
  },
  formCard: {
    maxWidth: 680,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoBox: {
    width: 120,
    height: 80,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    fontStyle: 'italic',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  optionsContainer: {
    marginBottom: 40,
  },
  optionsContainerGrid: {
    flexDirection: 'column',
    gap: 20,
  },
  optionCard: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 30,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconText: {
    fontSize: 24,
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    color: '#666',
    fontSize: 16,
  },
  loginLink: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});