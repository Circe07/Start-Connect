import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getSwipeCandidates,
  submitSwipe,
  SwipeCandidate,
} from '@/services/discover/discoverService';
import { addFriend } from '@/services/friends/friendsService';
import { joinGroup, sendGroupRequest } from '@/services/groups/authGroup';

const BRAND_ORANGE = '#FF7F3F';
const SWIPE_THRESHOLD = 110;

export default function SwipeScreen() {
  const isDarkMode = useColorScheme() === 'dark';
  const navigation = useNavigation<any>();
  const queryClient = useQueryClient();
  const [cursor, setCursor] = useState(0);
  const position = useRef(new Animated.ValueXY()).current;

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
    mutationFn: (args: { direction: 'like' | 'pass'; candidate?: SwipeCandidate }) => {
      if (!args.candidate) {
        return Promise.resolve({ success: false, error: 'No card available' });
      }
      return submitSwipe({ candidate: args.candidate, direction: args.direction });
    },
    onSuccess: result => {
      if (result.success && result.data?.isMatch) {
        Alert.alert('Nuevo match', 'Tienes una nueva conexión.');
      }
      setCursor(prev => prev + 1);
      position.setValue({ x: 0, y: 0 });
      queryClient.invalidateQueries({ queryKey: ['discover', 'matches'] });
    },
    onError: (error: any) => {
      Alert.alert('No se pudo registrar swipe', error?.message || 'Intenta otra vez.');
      Animated.spring(position, {
        toValue: { x: 0, y: 0 },
        useNativeDriver: false,
      }).start();
    },
  });

  const quickActionMutation = useMutation({
    mutationFn: async () => {
      if (!currentCard) return { success: false, error: 'No card available' };

      if (currentCard.type === 'person') {
        const personId = currentCard.raw?.id || currentCard.raw?.uid;
        if (!personId) return { success: false, error: 'Persona inválida' };
        return addFriend(personId);
      }

      if (currentCard.type === 'group') {
        const groupId = currentCard.raw?.id;
        if (!groupId) return { success: false, error: 'Grupo inválido' };
        if (currentCard.raw?.isPublic) {
          return joinGroup(groupId);
        }
        return sendGroupRequest(groupId);
      }

      return { success: true };
    },
    onSuccess: response => {
      if (!response?.success) {
        Alert.alert('No se pudo completar', response?.error || 'Intenta nuevamente.');
        return;
      }

      if (!currentCard) return;
      if (currentCard.type === 'person') {
        Alert.alert('Listo', 'Usuario agregado a amigos.');
        return;
      }
      if (currentCard.type === 'group') {
        Alert.alert('Listo', 'Acción de grupo completada.');
        return;
      }
      Alert.alert('Actividad', currentCard.description || currentCard.title);
    },
    onError: (error: any) => {
      Alert.alert('No se pudo completar', error?.message || 'Intenta nuevamente.');
    },
  });

  const onSwipe = useCallback((direction: 'like' | 'pass') => {
    if (!currentCard || swipeMutation.isPending) {
      return;
    }
    const toX = direction === 'like' ? 420 : -420;
    Animated.timing(position, {
      toValue: { x: toX, y: 0 },
      duration: 180,
      useNativeDriver: false,
    }).start(() => {
      swipeMutation.mutate({ direction, candidate: currentCard });
    });
  }, [currentCard, position, swipeMutation]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_evt, gesture) =>
          Math.abs(gesture.dx) > 12 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
        onPanResponderMove: (_evt, gesture) => {
          position.setValue({ x: gesture.dx, y: gesture.dy * 0.2 });
        },
        onPanResponderRelease: (_evt, gesture) => {
          if (gesture.dx > SWIPE_THRESHOLD) {
            onSwipe('like');
            return;
          }
          if (gesture.dx < -SWIPE_THRESHOLD) {
            onSwipe('pass');
            return;
          }
          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }).start();
        },
      }),
    [position, onSwipe],
  );

  const rotation = position.x.interpolate({
    inputRange: [-180, 0, 180],
    outputRange: ['-8deg', '0deg', '8deg'],
    extrapolate: 'clamp',
  });

  const likeOpacity = position.x.interpolate({
    inputRange: [10, 80, 140],
    outputRange: [0, 0.55, 1],
    extrapolate: 'clamp',
  });

  const passOpacity = position.x.interpolate({
    inputRange: [-140, -80, -10],
    outputRange: [1, 0.55, 0],
    extrapolate: 'clamp',
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

      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.card,
          {
            backgroundColor: isDarkMode ? '#1a1a1a' : '#fff',
            borderColor: isDarkMode ? '#333' : '#e0e0e0',
          },
          {
            transform: [{ translateX: position.x }, { translateY: position.y }, { rotate: rotation }],
          },
        ]}
      >
        <Animated.View style={[styles.swipeBadge, styles.likeBadge, { opacity: likeOpacity }]}>
          <Text style={styles.swipeBadgeText}>LIKE</Text>
        </Animated.View>
        <Animated.View style={[styles.swipeBadge, styles.passBadge, { opacity: passOpacity }]}>
          <Text style={styles.swipeBadgeText}>PASS</Text>
        </Animated.View>
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
      </Animated.View>

      <View style={styles.actionsRow}>
        <Pressable
          style={[styles.actionButton, styles.passButton]}
          disabled={swipeMutation.isPending}
          onPress={() => onSwipe('pass')}
        >
          <Text style={styles.passText}>Pasar</Text>
        </Pressable>
        <Pressable
          style={[styles.actionButton, styles.likeButton]}
          disabled={swipeMutation.isPending}
          onPress={() => onSwipe('like')}
        >
          <Text style={styles.likeText}>
            {currentCard.type === 'group' ? 'Me interesa' : 'Conectar'}
          </Text>
        </Pressable>
      </View>
      <Pressable
        style={styles.secondaryButton}
        disabled={quickActionMutation.isPending}
        onPress={() => {
          if (!currentCard) return;
          if (currentCard.type === 'group' && currentCard.raw?.id) {
            navigation.navigate('GroupDetail', { groupId: currentCard.raw.id });
            return;
          }
          quickActionMutation.mutate();
        }}
      >
        <Text style={styles.secondaryButtonText}>
          {currentCard.type === 'person'
            ? 'Agregar amigo'
            : currentCard.type === 'group'
            ? 'Ver grupo'
            : 'Ver actividad'}
        </Text>
      </Pressable>
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
  secondaryButton: {
    marginTop: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: BRAND_ORANGE,
    alignItems: 'center',
    paddingVertical: 11,
  },
  secondaryButtonText: {
    color: BRAND_ORANGE,
    fontWeight: '700',
  },
  swipeBadge: {
    position: 'absolute',
    top: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 2,
  },
  likeBadge: {
    right: 16,
    borderColor: '#4caf50',
  },
  passBadge: {
    left: 16,
    borderColor: '#ef5350',
  },
  swipeBadgeText: {
    fontWeight: '800',
    letterSpacing: 1,
    color: '#fff',
  },
});
