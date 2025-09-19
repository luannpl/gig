import React, { useState } from 'react';
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
} from 'react-native';
import { Link, router } from 'expo-router';
import { Picker } from '@react-native-picker/picker';

const genres = [
  'Rock',
  'Pop',
  'Jazz',
  'Blues',
  'Country',
  'Electronic',
  'Hip Hop',
  'Reggae',
  'Folk',
  'Classical',
  'Heavy Metal',
  'Punk',
  'Alternative',
  'Indie',
  'R&B',
  'Soul',
  'Funk',
  'Outros'
];

export default function BandSignUp() {
  const [formData, setFormData] = useState({
    bandName: '',
    genre: '',
    city: '',
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSignUp = async () => {
    if (!formData.bandName.trim() || !formData.genre || !formData.city.trim() || 
        !formData.email.trim() || !formData.password.trim()) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    if (!agreeToTerms) {
      Alert.alert('Erro', 'Você deve concordar com os termos e condições');
      return;
    }

    setIsLoading(true);
    
    // SIMULAÇÃO TEMPORÁRIA
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert('Sucesso', 'Conta da banda criada com sucesso!', [
        {
          text: 'OK',
          onPress: () => router.replace('/(tabs)/home')
        }
      ]);
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
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
                value={formData.bandName}
                onChangeText={(value) => handleInputChange('bandName', value)}
                autoCapitalize="words"
              />

              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.genre}
                  onValueChange={(value) => handleInputChange('genre', value)}
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
                onChangeText={(value) => handleInputChange('city', value)}
                autoCapitalize="words"
              />

              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#999"
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />

              <TextInput
                style={styles.input}
                placeholder="Senha"
                placeholderTextColor="#999"
                value={formData.password}
                onChangeText={(value) => handleInputChange('password', value)}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="password"
              />
            </View>

            {/* Terms and Conditions */}
            <TouchableOpacity 
              style={styles.checkboxContainer}
              onPress={() => setAgreeToTerms(!agreeToTerms)}
            >
              <View style={[styles.checkbox, agreeToTerms && styles.checkboxChecked]}>
                {agreeToTerms && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.termsText}>
                Li e concordo com os{' '}
                <Text style={styles.termsLink}>termos e condições</Text>.
              </Text>
            </TouchableOpacity>

            {/* Sign Up Button */}
            <TouchableOpacity
              style={[styles.signUpButton, isLoading && styles.signUpButtonDisabled]}
              onPress={handleSignUp}
              disabled={isLoading}
            >
              <Text style={styles.signUpButtonText}>
                {isLoading ? 'Criando conta...' : 'Criar conta'}
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
    backgroundColor: '#ffffff',
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
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
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
    marginBottom: 20,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
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
  switchContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  switchLink: {
    color: '#007AFF',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  formContainer: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 15,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: '#fafafa',
    color: '#000',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    marginBottom: 15,
    backgroundColor: '#fafafa',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    color: '#000',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    marginRight: 12,
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
  termsText: {
    color: '#666',
    fontSize: 14,
    flex: 1,
  },
  termsLink: {
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
  signUpButton: {
    backgroundColor: '#2C2B2B',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  signUpButtonDisabled: {
    backgroundColor: '#999',
  },
  signUpButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
});