import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Pressable,
  useColorScheme,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useMutation, useQuery } from '@tanstack/react-query';

import { GroupRequest } from '@/types/interface/group/groupRequest';
import {
  getGroupRequests,
  approveGroupRequest,
  rejectGroupRequest,
} from '@/services/groups/authGroup';

const BRAND_ORANGE = '#FF7F3F';

export default function GroupRequestsScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const isDarkMode = useColorScheme() === 'dark';
  const groupId: string | undefined = route?.params?.groupId;

  const requestsQuery = useQuery<GroupRequest[]>({
    queryKey: ['groupRequests', groupId],
    enabled: Boolean(groupId),
    queryFn: () => getGroupRequests(groupId as string),
  });

  const approveMutation = useMutation({
    mutationFn: (requestId: string) => approveGroupRequest(requestId),
    onSuccess: () => requestsQuery.refetch(),
    onError: (error: any) => {
      Alert.alert(
        'Error',
        error?.message || 'No se pudo aprobar la solicitud.',
      );
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (requestId: string) => rejectGroupRequest(requestId),
    onSuccess: () => requestsQuery.refetch(),
    onError: (error: any) => {
      Alert.alert(
        'Error',
        error?.message || 'No se pudo rechazar la solicitud.',
      );
    },
  });

  const renderItem = ({ item }: { item: GroupRequest }) => {
    const profile = item.requesterProfile;
    const displayName = profile?.name || profile?.username || item.userId;

    const isProcessing =
      approveMutation.isPending && approveMutation.variables === item.id;

    return (
      <View
        style={[
          styles.requestRow,
          { backgroundColor: isDarkMode ? '#1a1a1a' : '#fff' },
        ]}
      >
        <View style={styles.requestInfo}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarLabel}>
              {displayName
                .split(' ')
                .map(part => part[0])
                .filter(Boolean)
                .slice(0, 2)
                .join('')
                .toUpperCase()}
            </Text>
          </View>
          <View>
            <Text
              style={[
                styles.requestName,
                { color: isDarkMode ? '#f2f2f2' : '#111' },
              ]}
            >
              {displayName}
            </Text>
            <Text style={styles.requestMeta}>{item.userId}</Text>
          </View>
        </View>
        <View style={styles.requestActions}>
          <Pressable
            style={[styles.iconButton, styles.rejectButton]}
            onPress={() => rejectMutation.mutate(item.id)}
            disabled={rejectMutation.isPending}
          >
            <Icon name="close" size={18} color="#fff" />
          </Pressable>
          <Pressable
            style={[styles.iconButton, styles.approveButton]}
            onPress={() => approveMutation.mutate(item.id)}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Icon name="check" size={18} color="#fff" />
            )}
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? '#000' : '#fff' },
      ]}
    >
      <View
        style={[
          styles.header,
          {
            backgroundColor: isDarkMode ? '#1a1a1a' : '#fff',
            borderBottomColor: isDarkMode ? '#333' : '#e0e0e0',
          },
        ]}
      >
        <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
          <Icon
            name="arrow-back"
            size={24}
            color={isDarkMode ? '#f2f2f2' : '#333'}
          />
        </Pressable>
        <Text
          style={[
            styles.headerTitle,
            { color: isDarkMode ? '#f2f2f2' : '#333' },
          ]}
        >
          Solicitudes del grupo
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {requestsQuery.isLoading ? (
        <View style={styles.loaderState}>
          <ActivityIndicator color={BRAND_ORANGE} />
        </View>
      ) : (
        <FlatList
          data={requestsQuery.data || []}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Icon name="inbox" size={48} color="#bbb" />
              <Text style={styles.emptyText}>
                No hay solicitudes pendientes.
              </Text>
            </View>
          }
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  loaderState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    padding: 16,
  },
  requestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  requestInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: BRAND_ORANGE + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLabel: {
    fontWeight: '700',
    color: BRAND_ORANGE,
  },
  requestName: {
    fontSize: 16,
    fontWeight: '600',
  },
  requestMeta: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  approveButton: {
    backgroundColor: BRAND_ORANGE,
  },
  rejectButton: {
    backgroundColor: '#ef4444',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 80,
    gap: 8,
  },
  emptyText: {
    color: '#9CA3AF',
  },
});
