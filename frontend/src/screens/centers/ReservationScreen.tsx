import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  TextInput,
} from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

const BRAND_ORANGE = '#FF7F3F';
const BRAND_GRAY = '#9E9E9E';

export default function ReservationScreen() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? '#000' : '#fff' },
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Completar Reserva</Text>
      </View>
      <View>
        <Text>Nombre</Text>
        <TextInput placeholder="Nombre" style={styles.input} />
      </View>
      <View>
        <Text>Apellido</Text>
        <TextInput placeholder="Apellido" style={styles.input} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  input: {
    marginLeft: 16,
    marginRight: 16,
    marginTop: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    color: '#333',
    width: 400,
  },
});
