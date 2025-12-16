import React, { useState } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { changePassword } from '@/services/auth/authService';

const BRAND_ORANGE = '#FF7F3F';
const BRAND_GRAY = '#060505';

export default function ForgotPassword() {
  const [email, _] = useState('');

  const handleChangePasssword = () => {
    changePassword(JSON.stringify(email));
    console.log('Cambiando contrasena...');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoiding}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.headerContainer}>
            <Text style={styles.title}>¿Olvidaste tu contraseña?</Text>
            <Text style={styles.subtitle}>
              Introduce tu correo electrónico asociado a tu cuenta para recibir
              un enlace de restablecimiento.
            </Text>
          </View>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Correo Electrónico</Text>
            <TextInput
              style={styles.input}
              placeholder="ejemplo@dominio.com"
              placeholderTextColor="#A9A9A9"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Principal Buttton */}
          <View style={styles.buttonWrapper}>
            <TouchableOpacity
              style={styles.sendEmailButton}
              activeOpacity={0.8}
              onPress={handleChangePasssword}
            >
              <Text style={styles.sendEmailText}>Enviar Enlace</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardAvoiding: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    justifyContent: 'flex-start',
    gap: 32,
  },
  headerContainer: {
    marginBottom: 20,
    gap: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: BRAND_GRAY,
  },
  subtitle: {
    fontSize: 16,
    color: '#6A6A6A',
    lineHeight: 24,
  },
  inputContainer: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: BRAND_GRAY,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D3D3D3',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: BRAND_GRAY,
    backgroundColor: '#F7F7F7',
  },
  buttonWrapper: {
    marginTop: 'auto',
    marginBottom: 30,
  },
  sendEmailButton: {
    borderRadius: 12,
    backgroundColor: BRAND_ORANGE,
    paddingVertical: 16,
    shadowColor: BRAND_ORANGE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  sendEmailText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
  },
});
