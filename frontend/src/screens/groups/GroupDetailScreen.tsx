import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  useColorScheme,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useMutation, useQuery } from '@tanstack/react-query';

import { Group } from '@/types/interface/group/group';
import {
  getGroupById,
  joinGroup,
  leaveGroup,
  sendGroupRequest,
} from '@/services/groups/authGroup';

const BRAND_ORANGE = '#FF7F3F';

export default function GroupDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const isDarkMode = useColorScheme() === 'dark';
  const groupId: string | undefined = route?.params?.groupId;

  const groupQuery = useQuery<Group>({
    queryKey: ['groupDetail', groupId],
    queryFn: () => getGroupById(groupId as string),
    enabled: Boolean(groupId),
  });

  const joinMutation = useMutation({
    mutationFn: async () => {
      if (!groupQuery.data) return null;
      if (groupQuery.data.isPublic) {
        return joinGroup(groupQuery.data.id);
      }
      return sendGroupRequest(groupQuery.data.id);
    },
    onSuccess: () => groupQuery.refetch(),
    onError: (error: any) => {
      Alert.alert('No se pudo unir', error?.message || 'Intenta nuevamente.');
    },
  });

  const leaveMutation = useMutation({
    mutationFn: async () => leaveGroup(groupId as string),
    onSuccess: () => groupQuery.refetch(),
    onError: (error: any) => {
      Alert.alert('No se pudo salir', error?.message || 'Intenta nuevamente.');
    },
  });

  const group = groupQuery.data;
  const viewerState = group?.viewerState;

  const infoRows = useMemo(
    () => [
      {
        label: 'Ciudad',
        value: group?.city || 'Sin especificar',
        icon: 'location-on',
      },
      {
        label: 'Deporte',
        value: group?.sport || 'General',
        icon: 'sports-tennis',
      },
      {
        label: 'Nivel',
        value: group?.level || 'Todos los niveles',
        icon: 'trending-up',
      },
      {
        label: 'Miembros',
        value: `${group?.members.length || 0} / ${group?.maxMembers || 0}`,
        icon: 'people',
      },
    ],
    [
      group?.city,
      group?.sport,
      group?.level,
      group?.members,
      group?.maxMembers,
    ],
  );

  const handlePrimaryAction = () => {
    if (!group) return;
    if (viewerState?.isMember) {
      handleOpenChat();
      return;
    }
    if (!group.isPublic && viewerState?.hasPendingRequest) {
      Alert.alert('Pendiente', 'Ya enviaste una solicitud.');
      return;
    }
    joinMutation.mutate();
  };

  const handleLeaveGroup = () => {
    Alert.alert('Salir del grupo', '¿Deseas abandonar este grupo?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Salir',
        style: 'destructive',
        onPress: () => leaveMutation.mutate(),
      },
    ]);
  };

  const handleOpenChat = () => {
    navigation.navigate('GroupChat', {
      groupId,
      groupName: group?.name,
    });
  };

  const handleOpenRequests = () => {
    navigation.navigate('GroupRequests', { groupId });
  };

  if (groupQuery.isLoading || !groupId) {
    return (
      <View style={styles.loaderState}>
        <ActivityIndicator color={BRAND_ORANGE} />
      </View>
    );
  }

  if (!group) {
    return (
      <View style={styles.loaderState}>
        <Text style={{ color: isDarkMode ? '#f2f2f2' : '#333' }}>
          No se pudo cargar el grupo.
        </Text>
      </View>
    );
  }

  const hasPending = viewerState?.hasPendingRequest;
  const primaryLabel = viewerState?.isMember
    ? 'Abrir chat'
    : group.isPublic
    ? 'Unirme al grupo'
    : hasPending
    ? 'Solicitud enviada'
    : 'Solicitar acceso';

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? '#000' : '#fff' },
      ]}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={[styles.title, { color: isDarkMode ? '#f2f2f2' : '#111' }]}>
        {group.name}
      </Text>
      <Text style={styles.subtitle}>
        {group.description || 'Sin descripción'}
      </Text>

      <View style={styles.chipRow}>
        <View style={styles.chip}>
          <Icon
            name={group.isPublic ? 'public' : 'lock'}
            size={14}
            color={BRAND_ORANGE}
          />
          <Text style={styles.chipLabel}>
            {group.isPublic ? 'Grupo público' : 'Grupo privado'}
          </Text>
        </View>
        <View style={styles.chip}>
          <Icon name="event" size={14} color={BRAND_ORANGE} />
          <Text style={styles.chipLabel}>
            Creado el{' '}
            {new Date(
              (group.createdAt?._seconds || 0) * 1000 || Date.now(),
            ).toLocaleDateString()}
          </Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        {infoRows.map(row => (
          <View key={row.label} style={styles.infoRow}>
            <Icon name={row.icon as any} size={20} color={BRAND_ORANGE} />
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>{row.label}</Text>
              <Text
                style={[
                  styles.infoValue,
                  { color: isDarkMode ? '#f2f2f2' : '#111' },
                ]}
              >
                {row.value}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.actionsContainer}>
        <Pressable
          style={[
            styles.primaryButton,
            {
              backgroundColor: viewerState?.isMember
                ? BRAND_ORANGE
                : hasPending
                ? '#bdbdbd'
                : BRAND_ORANGE,
              opacity: hasPending && !viewerState?.isMember ? 0.6 : 1,
            },
          ]}
          disabled={hasPending && !viewerState?.isMember}
          onPress={handlePrimaryAction}
        >
          {joinMutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryButtonLabel}>{primaryLabel}</Text>
          )}
        </Pressable>

        {viewerState?.isMember ? (
          <Pressable style={styles.secondaryButton} onPress={handleLeaveGroup}>
            {leaveMutation.isPending ? (
              <ActivityIndicator color={BRAND_ORANGE} />
            ) : (
              <Text style={styles.secondaryButtonLabel}>Salir del grupo</Text>
            )}
          </Pressable>
        ) : null}

        {viewerState?.isOwner ? (
          <Pressable
            style={styles.secondaryButton}
            onPress={handleOpenRequests}
          >
            <Text style={styles.secondaryButtonLabel}>Ver solicitudes</Text>
          </Pressable>
        ) : null}

        {viewerState?.isMember ? (
          <Pressable style={styles.secondaryButton} onPress={handleOpenChat}>
            <Text style={styles.secondaryButtonLabel}>Chat del grupo</Text>
          </Pressable>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    gap: 16,
  },
  loaderState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: BRAND_ORANGE + '20',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  chipLabel: {
    fontSize: 12,
    color: BRAND_ORANGE,
  },
  infoCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 12,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  actionsContainer: {
    gap: 12,
  },
  primaryButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BRAND_ORANGE,
    alignItems: 'center',
  },
  secondaryButtonLabel: {
    color: BRAND_ORANGE,
    fontWeight: '600',
  },
});
