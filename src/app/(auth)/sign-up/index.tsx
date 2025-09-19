import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Link, router } from 'expo-router';

export default function SignUp() {
  const handleBandSignUp = () => {
    router.push('/(auth)/sign-up/band');
  };

  const handleVenueSignUp = () => {
    router.push('/(auth)/sign-up/venue');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
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
        <View style={styles.optionsContainer}>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: 'center',
    paddingTop: 50,
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
    width: 60,
    height: 60,
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