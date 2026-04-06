import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ReservationScreenProps {
  navigation?: any;
}

const BRAND_ORANGE = '#FF7F3F';
const BRAND_GRAY = '#9E9E9E';

export default function ReservationScreen({
  navigation,
}: ReservationScreenProps) {
  const isDarkMode = useColorScheme() === 'dark';
  const textColor = isDarkMode ? '#fff' : '#333';
  const cardBg = isDarkMode ? '#1A1A1A' : '#F0F0F0';

  const [peopleCount, setPeopleCount] = useState('2');
  const [needsLights, setNeedsLights] = useState(false);
  const [durationTime, setDurationTime] = useState(60);

  const setTime = (nextDurationTime: number) => {
    setDurationTime(nextDurationTime);
  };

  const handleContinuePayment = () => {
    navigation.navigate('Payment');
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? '#000' : '#fff' },
      ]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: textColor }]}>
            Detalles de la Pista
          </Text>
          <Text style={[styles.subtitle, { color: BRAND_GRAY }]}>
            Configura tu reserva deportiva
          </Text>
        </View>

        {/* --- DATOS PERSONALES --- */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: textColor }]}>
            Responsable de la reserva
          </Text>
          <TextInput
            placeholder="Nombre del responsable"
            placeholderTextColor="#999"
            style={[
              styles.input,
              { color: textColor, borderColor: isDarkMode ? '#333' : '#ddd' },
            ]}
          />
          <TextInput
            placeholder="Teléfono de contacto"
            placeholderTextColor="#999"
            keyboardType="phone-pad"
            style={[
              styles.input,
              { color: textColor, borderColor: isDarkMode ? '#333' : '#ddd' },
            ]}
          />
        </View>

        {/* --- CONFIGURACIÓN DEL PARTIDO --- */}
        <View style={styles.section}>
          <View style={styles.rowBetween}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={[styles.label, { color: textColor }]}>
                Nº de Jugadores
              </Text>
              <TextInput
                value={peopleCount}
                onChangeText={setPeopleCount}
                keyboardType="numeric"
                style={[
                  styles.input,
                  {
                    color: textColor,
                    borderColor: isDarkMode ? '#333' : '#ddd',
                  },
                ]}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={[styles.label, { color: textColor }]}>
                Duración (min)
              </Text>
              <View
                style={[
                  styles.input,
                  {
                    justifyContent: 'center',
                    borderColor: isDarkMode ? '#333' : '#ddd',
                  },
                ]}
              >
                <Text style={{ color: textColor }}>{durationTime} minutos</Text>
              </View>
            </View>
          </View>
        </View>

        {/* --- OPCIONALES (LUZ/MATERIAL) --- */}
        <View style={[styles.optionsCard, { backgroundColor: cardBg }]}>
          <View style={styles.rowBetween}>
            <View>
              <Text style={[styles.optionTitle, { color: textColor }]}>
                Iluminación de pista
              </Text>
              <Text style={{ color: BRAND_GRAY, fontSize: 12 }}>
                ¿Juegas de noche, necesitas mas iluminacion? (+2.00€)
              </Text>
            </View>
            <Switch
              value={needsLights}
              onValueChange={setNeedsLights}
              trackColor={{ false: '#767577', true: BRAND_ORANGE }}
              thumbColor={needsLights ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* --- BOTÓN DE CONTINUAR --- */}
        <TouchableOpacity
          onPress={handleContinuePayment}
          style={styles.mainButton}
        >
          <Text style={styles.mainButtonText}>Continuar al Pago</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    padding: 20,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  sportsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  sportChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  sportChipText: {
    fontWeight: 'bold',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionsCard: {
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 16,
    marginTop: 10,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  mainButton: {
    backgroundColor: BRAND_ORANGE,
    marginHorizontal: 20,
    marginTop: 30,
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: BRAND_ORANGE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  mainButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
