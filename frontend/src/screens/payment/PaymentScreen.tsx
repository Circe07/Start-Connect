import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  TextInput,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const BRAND_ORANGE = '#FF7F3F';
const BRAND_GRAY = '#9E9E9E';

export default function PaymentScreen() {
  const isDarkMode = useColorScheme() === 'dark';

  // Estados para los datos de la tarjeta
  const [cardNumber, setCardNumber] = useState('');
  const [holderName, setHolderName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');

  const textColor = isDarkMode ? '#fff' : '#333';

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? '#000' : '#f8f9fa' },
      ]}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: textColor }]}>
            Completar Reserva
          </Text>
        </View>

        {/* --- FORMULARIO --- */}
        <View style={styles.formContainer}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Datos Personales
          </Text>

          <Text style={[styles.label, { color: textColor }]}>
            Nombre Completo
          </Text>
          <TextInput
            placeholder="Ej. Juan Pérez"
            placeholderTextColor="#999"
            style={[styles.input, { color: textColor }]}
            onChangeText={setHolderName}
          />

          <Text
            style={[styles.sectionTitle, { color: textColor, marginTop: 10 }]}
          >
            Método de Pago
          </Text>

          <Text style={[styles.label, { color: textColor }]}>
            Número de Tarjeta
          </Text>
          <TextInput
            placeholder="0000 0000 0000 0000"
            placeholderTextColor="#999"
            keyboardType="numeric"
            maxLength={16}
            style={[styles.input, { color: textColor }]}
            onChangeText={setCardNumber}
          />

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={[styles.label, { color: textColor }]}>Fecha</Text>
              <TextInput
                placeholder="MM/AA"
                placeholderTextColor="#999"
                maxLength={5}
                style={[styles.input, { color: textColor }]}
                onChangeText={setExpiry}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={[styles.label, { color: textColor }]}>CVC</Text>
              <TextInput
                placeholder="123"
                placeholderTextColor="#999"
                keyboardType="numeric"
                maxLength={3}
                secureTextEntry
                style={[styles.input, { color: textColor }]}
                onChangeText={setCvc}
              />
            </View>
          </View>

          <TouchableOpacity style={styles.payButton}>
            <Text style={styles.payButtonText}>Confirmar y Pagar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  creditCard: {
    backgroundColor: '#1a1a1a',
    marginHorizontal: 20,
    height: 200,
    borderRadius: 16,
    padding: 24,
    justifyContent: 'space-between',
    // Sombra para iOS y Android
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  cardType: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
  },
  cardNumberDisplay: {
    color: '#fff',
    fontSize: 22,
    letterSpacing: 2,
    marginVertical: 10,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardLabel: {
    color: BRAND_GRAY,
    fontSize: 10,
    textTransform: 'uppercase',
  },
  cardValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 4,
  },
  formContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: 'rgba(150, 150, 150, 0.05)',
  },
  row: {
    flexDirection: 'row',
  },
  payButton: {
    backgroundColor: BRAND_ORANGE,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
