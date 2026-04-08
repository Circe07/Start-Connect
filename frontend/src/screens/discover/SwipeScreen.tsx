import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getSwipeCandidates,
  submitSwipe,
  SwipeCandidate,
} from '@/services/discover/discoverService';

const BRAND_ORANGE = '#FF7F3F';

export default function SwipeScreen() {
  const isDarkMode = useColorScheme() === 'dark';
  const queryClient = useQueryClient();
  const [cursor, setCursor] = useState(0);

  const discoverQuery = useQuery({
    queryKey: ['discover', 'swipe'],
    queryFn: getSwipeCandidates,
    staleTime: 30 * 1000,
  });

  const cards = useMemo(
    () => (discoverQuery.data?.success ? discoverQuery.data.data?.items || [] : []),
    [discoverQuery.data],
  );

  const currentCard = cards[cursor] as SwipeCandidate | undefined;

  const swipeMutation = useMutation({
    mutationFn: (direction: 'like' | 'pass') => {
      if (!currentCard) {
        return Promise.resolve({ success: false, error: 'No card available' });
      }
      return submitSwipe({ candidate: currentCard, direction });
    },
    onSuccess: result => {
      if (result.success && result.data?.isMatch) {
        Alert.alert('Nuevo match', 'Tienes una nueva conexión.');
      }
      setCursor(prev => prev + 1);
      queryClient.invalidateQueries({ queryKey: ['discover', 'matches'] });
    },
    onError: (error: any) => {
      Alert.alert('No se pudo registrar swipe', error?.message || 'Intenta otra vez.');
    },
  });

  if (discoverQuery.isLoading) {
    return (
      <View style={[styles.centered, { backgroundColor: isDarkMode ? '#000' : '#fff' }]}>
        <ActivityIndicator color={BRAND_ORANGE} />
        <Text style={[styles.helperText, { color: isDarkMode ? '#f2f2f2' : '#333' }]}>
          Cargando recomendaciones...
        </Text>
      </View>
    );
  }

  if (!discoverQuery.data?.success) {
    return (
      <View style={[styles.centered, { backgroundColor: isDarkMode ? '#000' : '#fff' }]}>
        <Text style={[styles.title, { color: isDarkMode ? '#f2f2f2' : '#333' }]}>
          Swipe
        </Text>
        <Text style={[styles.helperText, { color: isDarkMode ? '#bdbdbd' : '#666' }]}>
          {discoverQuery.data?.error || 'No se pudo cargar discover.'}
        </Text>
      </View>
    );
  }

  if (!currentCard) {
    return (
      <View style={[styles.centered, { backgroundColor: isDarkMode ? '#000' : '#fff' }]}>
        <Text style={[styles.title, { color: isDarkMode ? '#f2f2f2' : '#333' }]}>
          Swipe
        </Text>
        <Text style={[styles.helperText, { color: isDarkMode ? '#bdbdbd' : '#666' }]}>
          Ya no hay tarjetas por ahora.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#000' : '#fff' }]}>
      <Text style={[styles.title, { color: isDarkMode ? '#f2f2f2' : '#333' }]}>
        Swipe
      </Text>

      <View
        style={[
          styles.card,
          {
            backgroundColor: isDarkMode ? '#1a1a1a' : '#fff',
            borderColor: isDarkMode ? '#333' : '#e0e0e0',
          },
        ]}
      >
        <Text style={styles.badge}>{currentCard.type.toUpperCase()}</Text>
        <Text style={[styles.cardTitle, { color: isDarkMode ? '#f2f2f2' : '#333' }]}>
          {currentCard.title}
        </Text>
        {currentCard.subtitle ? (
          <Text style={[styles.cardSubtitle, { color: isDarkMode ? '#cfcfcf' : '#666' }]}>
            {currentCard.subtitle}
          </Text>
        ) : null}
        {currentCard.description ? (
          <Text style={[styles.cardDescription, { color: isDarkMode ? '#999' : '#777' }]}>
            {currentCard.description}
          </Text>
        ) : null}
      </View>

      <View style={styles.actionsRow}>
        <Pressable
          style={[styles.actionButton, styles.passButton]}
          disabled={swipeMutation.isPending}
          onPress={() => swipeMutation.mutate('pass')}
        >
          <Text style={styles.passText}>Pasar</Text>
        </Pressable>
        <Pressable
          style={[styles.actionButton, styles.likeButton]}
          disabled={swipeMutation.isPending}
          onPress={() => swipeMutation.mutate('like')}
        >
          <Text style={styles.likeText}>Conectar</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 110,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
  helperText: {
    fontSize: 14,
    textAlign: 'center',
  },
  card: {
    marginTop: 8,
    borderWidth: 1,
    borderRadius: 16,
    padding: 18,
    minHeight: 260,
    justifyContent: 'center',
  },
  badge: {
    alignSelf: 'flex-start',
    fontSize: 12,
    fontWeight: '700',
    color: BRAND_ORANGE,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 15,
    marginBottom: 10,
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  actionButton: {
    flex: 1,
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: 'center',
  },
  passButton: {
    backgroundColor: '#ececec',
  },
  likeButton: {
    backgroundColor: BRAND_ORANGE,
  },
  passText: {
    color: '#555',
    fontWeight: '700',
  },
  likeText: {
    color: '#fff',
    fontWeight: '700',
  },
});
