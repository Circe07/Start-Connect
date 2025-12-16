// src/services/authStorage.ts

// Simple token storage (in-memory for now)
let authToken: string | null = null;

// Importar AsyncStorage si es necesario para persistencia
// import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Establece el token de autenticación en la memoria.
 * @param token El token JWT o null para limpiar.
 */
export const setAuthToken = (token: string | null) => {
  authToken = token;

  // TODO: Implementar la persistencia con AsyncStorage aquí
  // if (token) {
  //   AsyncStorage.setItem('authToken', token);
  // } else {
  //   AsyncStorage.removeItem('authToken');
  // }
};

/**
 * Obtiene el token de autenticación de la memoria.
 * @returns El token JWT o null.
 */
export const getAuthToken = (): string | null => {
  return authToken;

  // TODO: Implementar la recuperación de AsyncStorage aquí
  // return await AsyncStorage.getItem('authToken');
};
