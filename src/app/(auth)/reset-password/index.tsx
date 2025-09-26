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
} from 'react-native';
import { router } from 'expo-router';

export default function NewPassword() {
  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setPasswords(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return 'A senha deve ter pelo menos 8 caracteres';
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return 'A senha deve conter pelo menos uma letra minúscula';
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return 'A senha deve conter pelo menos uma letra maiúscula';
    }
    if (!/(?=.*\d)/.test(password)) {
      return 'A senha deve conter pelo menos um número';
    }
    return null;
  };

  const handleSetNewPassword = async () => {
    const { newPassword, confirmPassword } = passwords;

    if (!newPassword.trim() || !confirmPassword.trim()) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    // Validate password strength
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      Alert.alert('Senha fraca', passwordError);
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }

    setIsLoading(true);
    
    // Simulate password update
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert(
        'Sucesso', 
        'Sua senha foi redefinida com sucesso!',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(auth)/sign-in')
          }
        ]
      );
    }, 1000);
  };

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, label: '' };
    if (password.length < 4) return { strength: 1, label: 'Muito fraca' };
    if (password.length < 6) return { strength: 2, label: 'Fraca' };
    if (password.length < 8) return { strength: 3, label: 'Média' };
    
    const hasLower = /(?=.*[a-z])/.test(password);
    const hasUpper = /(?=.*[A-Z])/.test(password);
    const hasNumber = /(?=.*\d)/.test(password);
    const hasSymbol = /(?=.*[!@#$%^&*])/.test(password);
    
    const score = [hasLower, hasUpper, hasNumber, hasSymbol].filter(Boolean).length;
    
    if (score >= 3 && password.length >= 8) return { strength: 5, label: 'Forte' };
    if (score >= 2) return { strength: 4, label: 'Boa' };
    return { strength: 3, label: 'Média' };
  };

  const passwordStrength = getPasswordStrength(passwords.newPassword);

  const getStrengthColor = (strength: number) => {
    switch (strength) {
      case 1: return '#FF5252';
      case 2: return '#FF9800';
      case 3: return '#FFC107';
      case 4: return '#8BC34A';
      case 5: return '#4CAF50';
      default: return '#E0E0E0';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <View style={styles.logoBox}>
              <Text style={styles.logoText}>gig</Text>
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>cadastrar nova senha</Text>
          
          {/* Subtitle */}
          <Text style={styles.subtitle}>
            Defina aqui sua senha de acesso à plataforma
          </Text>

          {/* Form */}
          <View style={styles.formContainer}>
            {/* New Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nova senha</Text>
              <TextInput
                style={styles.input}
                placeholder="Digite sua nova senha"
                placeholderTextColor="#999"
                value={passwords.newPassword}
                onChangeText={(value) => handleInputChange('newPassword', value)}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="new-password"
              />
              
              {/* Password Strength Indicator */}
              {passwords.newPassword.length > 0 && (
                <View style={styles.strengthContainer}>
                  <View style={styles.strengthBars}>
                    {[1, 2, 3, 4, 5].map((bar) => (
                      <View
                        key={bar}
                        style={[
                          styles.strengthBar,
                          {
                            backgroundColor: bar <= passwordStrength.strength 
                              ? getStrengthColor(passwordStrength.strength) 
                              : '#E0E0E0'
                          }
                        ]}
                      />
                    ))}
                  </View>
                  <Text style={[
                    styles.strengthLabel,
                    { color: getStrengthColor(passwordStrength.strength) }
                  ]}>
                    {passwordStrength.label}
                  </Text>
                </View>
              )}
            </View>

            {/* Confirm Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirme a senha</Text>
              <TextInput
                style={[
                  styles.input,
                  passwords.confirmPassword.length > 0 && passwords.newPassword !== passwords.confirmPassword && styles.inputError
                ]}
                placeholder="Confirme sua nova senha"
                placeholderTextColor="#999"
                value={passwords.confirmPassword}
                onChangeText={(value) => handleInputChange('confirmPassword', value)}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="new-password"
              />
              
              {/* Password Match Indicator */}
              {passwords.confirmPassword.length > 0 && (
                <Text style={[
                  styles.matchIndicator,
                  { color: passwords.newPassword === passwords.confirmPassword ? '#4CAF50' : '#FF5252' }
                ]}>
                  {passwords.newPassword === passwords.confirmPassword ? '✓ Senhas coincidem' : '✗ Senhas não coincidem'}
                </Text>
              )}
            </View>
          </View>

          {/* Set Password Button */}
          <TouchableOpacity
            style={[styles.setPasswordButton, isLoading && styles.setPasswordButtonDisabled]}
            onPress={handleSetNewPassword}
            disabled={isLoading}
          >
            <Text style={styles.setPasswordButtonText}>
              {isLoading ? 'Cadastrando...' : 'Cadastrar senha'}
            </Text>
          </TouchableOpacity>
        </View>
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
  content: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: 'center',
    paddingTop: 50,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 50,
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
  },
  formContainer: {
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    color: '#000',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 15,
    fontSize: 16,
    backgroundColor: '#fafafa',
    color: '#000',
  },
  inputError: {
    borderColor: '#FF5252',
  },
  strengthContainer: {
    marginTop: 8,
  },
  strengthBars: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 4,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  strengthLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  matchIndicator: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  setPasswordButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  setPasswordButtonDisabled: {
    backgroundColor: '#A5D6A7',
  },
  setPasswordButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
});