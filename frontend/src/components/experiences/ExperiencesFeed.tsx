import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  FlatList,
  Animated,
  StyleSheet,
  useColorScheme,
  RefreshControl,
  ActivityIndicator,
  Modal,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Share,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import usePosts from '@/hooks/usePosts';
import useCurrentUserProfile from '@/hooks/useCurrentUserProfile';
import {
  PostSummary,
  PostComment,
  togglePostLike,
  getPostComments,
  addPostComment,
  deletePostComment,
  sharePost,
} from '@/services/posts/postService';

const BRAND_ORANGE = '#FF7F3F';

interface ExperiencesFeedProps {
  filter?: string;
  isSearchExpanded: boolean;
  searchAnimation: Animated.Value;
  addButtonAnimation: Animated.Value;
}

export default function ExperiencesFeed({
  filter = '',
  isSearchExpanded: _isSearchExpanded,
  searchAnimation: _searchAnimation,
  addButtonAnimation: _addButtonAnimation,
}: ExperiencesFeedProps) {
  const isDarkMode = useColorScheme() === 'dark';
  const {
    data: posts = [],
    isLoading,
    isFetching,
    refetch,
    error,
  } = usePosts();
  const queryClient = useQueryClient();
  const { data: currentUser } = useCurrentUserProfile();
  const currentUserId = currentUser?.uid || currentUser?.id;
  const [selectedPost, setSelectedPost] = useState<PostSummary | null>(null);
  const [isCommentsVisible, setCommentsVisible] = useState(false);

  const toggleLikeMutation = useMutation({
    mutationFn: (postId: string) => togglePostLike(postId),
    onSuccess: (response, postId) => {
      if (!response.success) {
        Alert.alert(
          'No se pudo reaccionar',
          response.error || 'Intenta de nuevo más tarde.',
        );
        return;
      }

      const likeCount = response.data?.likeCount ?? 0;
      const liked = response.data?.liked ?? false;

      queryClient.setQueryData<PostSummary[]>(['posts'], previous =>
        previous
          ? previous.map(post =>
              post.id === postId
                ? { ...post, likeCount, viewerHasLiked: liked }
                : post,
            )
          : previous,
      );

      setSelectedPost(prev =>
        prev?.id === postId
          ? { ...prev, likeCount, viewerHasLiked: liked }
          : prev,
      );
    },
    onError: () => {
      Alert.alert(
        'No se pudo reaccionar',
        'Intenta nuevamente en unos segundos.',
      );
    },
  });

  const handleLike = (postId: string) => {
    toggleLikeMutation.mutate(postId);
  };

  const openComments = (post: PostSummary) => {
    setSelectedPost(post);
    setCommentsVisible(true);
  };

  const closeComments = () => {
    setCommentsVisible(false);
    setSelectedPost(null);
  };

  const handleCommentCountChange = (postId: string, nextCount: number) => {
    queryClient.setQueryData<PostSummary[]>(['posts'], previous =>
      previous
        ? previous.map(post =>
            post.id === postId ? { ...post, commentCount: nextCount } : post,
          )
        : previous,
    );

    setSelectedPost(prev =>
      prev?.id === postId ? { ...prev, commentCount: nextCount } : prev,
    );
  };

  const handleShare = async (post: PostSummary) => {
    try {
      const cover = post.media?.[0]?.url;
      const parts = [
        post.caption || 'Mira esta experiencia en Start & Connect',
      ];
      if (cover) {
        parts.push(cover);
      }

      const shareResult = await Share.share({ message: parts.join('\n\n') });
      if (shareResult.action !== Share.sharedAction) {
        return;
      }

      const response = await sharePost(post.id, { context: 'system-share' });
      if (!response.success) {
        return;
      }

      const shareCount =
        response.data?.shareCount ?? (post.shareCount || 0) + 1;

      queryClient.setQueryData<PostSummary[]>(['posts'], previous =>
        previous
          ? previous.map(item =>
              item.id === post.id ? { ...item, shareCount } : item,
            )
          : previous,
      );

      setSelectedPost(prev =>
        prev?.id === post.id ? { ...prev, shareCount } : prev,
      );
    } catch (shareError: any) {
      if (shareError?.message?.includes('User did not share')) {
        return;
      }
      Alert.alert('No se pudo compartir', 'Intenta nuevamente más tarde.');
    }
  };

  const filteredPosts = useMemo(() => {
    if (!filter.trim()) return posts;
    const query = filter.trim().toLowerCase();
    return posts.filter(post => {
      const author =
        post.authorProfile?.username || post.authorProfile?.name || '';
      const caption = post.caption || '';
      return (
        author.toLowerCase().includes(query) ||
        caption.toLowerCase().includes(query)
      );
    });
  }, [posts, filter]);

  const renderPost = ({ item }: { item: PostSummary }) => {
    const cover = item.media?.[0]?.url;
    const isLiked = Boolean(item.viewerHasLiked);
    const authorName =
      item.authorProfile?.username || item.authorProfile?.name || 'Usuario';

    return (
      <View
        style={[
          styles.postContainer,
          { backgroundColor: isDarkMode ? '#1a1a1a' : '#fff' },
        ]}
      >
        <View style={styles.postHeader}>
          <View style={styles.postUserInfo}>
            <View
              style={[styles.postAvatar, { backgroundColor: BRAND_ORANGE }]}
            />
            <Text
              style={[
                styles.postUsername,
                { color: isDarkMode ? '#f2f2f2' : '#333' },
              ]}
            >
              {authorName}
            </Text>
          </View>
          <Text style={styles.postMeta}>
            {item.location ? item.location : ''}
          </Text>
        </View>

        {cover ? (
          <Image
            source={{ uri: cover }}
            style={styles.postImage as any}
            resizeMode="cover"
          />
        ) : null}

        <View style={styles.postActions}>
          <Pressable
            style={styles.postAction}
            onPress={() => handleLike(item.id)}
          >
            <Icon
              name="favorite"
              size={30}
              style={[{ color: isLiked ? '#ff3040' : '#999' }]}
            />
          </Pressable>
          <Pressable
            style={styles.postAction}
            onPress={() => openComments(item)}
          >
            <Icon
              name="comment"
              size={30}
              color={isDarkMode ? '#f2f2f2' : '#555'}
            />
          </Pressable>
          <Pressable
            style={styles.postAction}
            onPress={() => handleShare(item)}
          >
            <Icon
              name="send"
              size={30}
              color={isDarkMode ? '#f2f2f2' : '#555'}
            />
          </Pressable>
        </View>

        <View style={styles.postStats}>
          <Text
            style={[
              styles.postLikes,
              { color: isDarkMode ? '#f2f2f2' : '#333' },
            ]}
          >
            {item.likeCount || 0} likes
          </Text>
          <Text
            style={[
              styles.postSecondaryStat,
              { color: isDarkMode ? '#c5c5c5' : '#555' },
            ]}
          >
            {item.commentCount || 0} comentarios · {item.shareCount || 0}{' '}
            compartidos
          </Text>
        </View>

        <View style={styles.postCaption}>
          <Text
            style={[
              styles.postCaptionText,
              { color: isDarkMode ? '#f2f2f2' : '#333' },
            ]}
          >
            <Text
              style={[
                styles.postCaptionUser,
                { color: isDarkMode ? '#f2f2f2' : '#333' },
              ]}
            >
              {authorName}
            </Text>{' '}
            {item.caption}
          </Text>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingState}>
        <ActivityIndicator size="large" color={BRAND_ORANGE} />
        <Text style={styles.loadingLabel}>Cargando experiencias...</Text>
      </View>
    );
  }

  return (
    <>
      <FlatList
        data={filteredPosts}
        keyExtractor={item => item.id}
        renderItem={renderPost}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          filteredPosts.length === 0 ? styles.emptyContainer : styles.postsList
        }
        style={styles.mainContent}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={refetch}
            tintColor={BRAND_ORANGE}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon name="public-off" size={42} color="#BABEC6" />
            <Text style={styles.emptyTitle}>
              {filter ? 'No hay coincidencias.' : 'Aún no hay publicaciones.'}
            </Text>
            <Text style={styles.emptyCopy}>
              {filter
                ? 'Intenta con otro nombre o hashtag.'
                : 'Sube la primera foto desde el botón naranja en la parte superior.'}
            </Text>
            {error ? (
              <Text style={styles.emptyError}>
                No se pudieron cargar los datos.
              </Text>
            ) : null}
          </View>
        }
      />
      <PostCommentsSheet
        visible={isCommentsVisible}
        post={selectedPost}
        onClose={closeComments}
        currentUserId={currentUserId}
        onCommentCountChange={handleCommentCountChange}
      />
    </>
  );
}

interface PostCommentsSheetProps {
  post: PostSummary | null;
  visible: boolean;
  onClose: () => void;
  onCommentCountChange: (postId: string, nextCount: number) => void;
  currentUserId?: string;
}

function PostCommentsSheet({
  post,
  visible,
  onClose,
  onCommentCountChange,
  currentUserId,
}: PostCommentsSheetProps) {
  const isDarkMode = useColorScheme() === 'dark';
  const [newComment, setNewComment] = useState('');
  const queryClient = useQueryClient();

  const commentsQuery = useQuery<PostComment[]>({
    queryKey: ['postComments', post?.id],
    enabled: visible && Boolean(post?.id),
    queryFn: async () => {
      if (!post?.id) return [];
      const response = await getPostComments(post.id, { limit: 100 });
      if (!response.success) {
        throw new Error(
          response.error || 'No se pudieron cargar los comentarios.',
        );
      }
      return (response.data?.comments || []) as PostComment[];
    },
  });

  const comments = commentsQuery.data || [];

  const addCommentMutation = useMutation({
    mutationFn: async () => {
      if (!post?.id) {
        throw new Error('Publicación no disponible');
      }
      const response = await addPostComment(post.id, {
        content: newComment.trim(),
      });

      if (!response.success) {
        throw new Error(
          response.error ||
            response.data?.message ||
            'No se pudo enviar el comentario.',
        );
      }

      return response.data;
    },
    onSuccess: data => {
      setNewComment('');
      queryClient.setQueryData<PostComment[]>(
        ['postComments', post?.id],
        old => [...(old || []), data.comment as PostComment],
      );
      if (post?.id) {
        onCommentCountChange(
          post.id,
          data.commentCount ?? (post.commentCount || 0) + 1,
        );
      }
    },
    onError: (mutationError: any) => {
      Alert.alert(
        'No se pudo comentar',
        mutationError?.message || 'Intenta nuevamente.',
      );
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      if (!post?.id) {
        throw new Error('Publicación no disponible');
      }
      const response = await deletePostComment(post.id, commentId);
      if (!response.success) {
        throw new Error(response.error || 'No se pudo eliminar el comentario.');
      }
      return { ...response.data, commentId };
    },
    onSuccess: (data, commentId) => {
      queryClient.setQueryData<PostComment[]>(['postComments', post?.id], old =>
        (old || []).filter(comment => comment.id !== commentId),
      );
      if (post?.id) {
        const fallbackCount = Math.max((post.commentCount || 1) - 1, 0);
        onCommentCountChange(post.id, data?.commentCount ?? fallbackCount);
      }
    },
    onError: (mutationError: any) => {
      Alert.alert(
        'No se pudo eliminar',
        mutationError?.message || 'Intenta nuevamente.',
      );
    },
  });

  const handleSendComment = () => {
    const trimmed = newComment.trim();
    if (!trimmed || addCommentMutation.isPending) {
      return;
    }
    addCommentMutation.mutate();
  };

  const confirmDeleteComment = (commentId: string) => {
    Alert.alert('Eliminar comentario', '¿Quieres borrar este mensaje?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => deleteCommentMutation.mutate(commentId),
      },
    ]);
  };

  const formatTimestamp = (value?: number | null) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderComment = ({ item }: { item: PostComment }) => {
    const canDelete =
      currentUserId &&
      (item.userId === currentUserId || post?.authorId === currentUserId);

    const initials = (
      item.authorProfile?.name ||
      item.authorProfile?.username ||
      'U'
    )
      .split(' ')
      .map(part => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase();

    return (
      <View style={styles.commentRow}>
        <View
          style={[
            styles.commentAvatar,
            { backgroundColor: isDarkMode ? '#333' : '#f2f2f2' },
          ]}
        >
          <Text style={styles.commentAvatarText}>{initials}</Text>
        </View>
        <View style={styles.commentBody}>
          <Text
            style={[
              styles.commentAuthor,
              { color: isDarkMode ? '#f2f2f2' : '#111' },
            ]}
          >
            {item.authorProfile?.username ||
              item.authorProfile?.name ||
              'Usuario'}
          </Text>
          <Text
            style={[
              styles.commentText,
              { color: isDarkMode ? '#ddd' : '#333' },
            ]}
          >
            {item.content}
          </Text>
          <Text style={styles.commentMeta}>
            {formatTimestamp(item.createdAt)}
          </Text>
        </View>
        {canDelete ? (
          <Pressable
            style={styles.commentDelete}
            hitSlop={8}
            onPress={() => confirmDeleteComment(item.id)}
          >
            <Icon name="delete" size={18} color="#ff5f5f" />
          </Pressable>
        ) : null}
      </View>
    );
  };

  if (!post) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flex}
        >
          <View
            style={[
              styles.commentsSheet,
              { backgroundColor: isDarkMode ? '#111' : '#fff' },
            ]}
          >
            <View style={styles.commentsHeader}>
              <Text
                style={[
                  styles.commentsTitle,
                  { color: isDarkMode ? '#f2f2f2' : '#111' },
                ]}
              >
                Comentarios
              </Text>
              <Pressable hitSlop={10} onPress={onClose}>
                <Icon
                  name="close"
                  size={22}
                  color={isDarkMode ? '#f2f2f2' : '#111'}
                />
              </Pressable>
            </View>

            {commentsQuery.isLoading ? (
              <View style={styles.commentsLoader}>
                <ActivityIndicator color={BRAND_ORANGE} />
              </View>
            ) : (
              <FlatList
                data={comments}
                keyExtractor={item => item.id}
                renderItem={renderComment}
                contentContainerStyle={
                  comments.length === 0
                    ? styles.commentsEmptyContainer
                    : undefined
                }
                ListEmptyComponent={
                  !commentsQuery.isFetching ? (
                    <Text style={styles.commentsEmptyText}>
                      Aún no hay comentarios.
                    </Text>
                  ) : null
                }
              />
            )}

            <View style={styles.commentInputRow}>
              <TextInput
                placeholder="Escribe algo bonito..."
                placeholderTextColor={isDarkMode ? '#666' : '#aaa'}
                style={[
                  styles.commentInput,
                  {
                    backgroundColor: isDarkMode ? '#1f1f1f' : '#f5f5f5',
                    color: isDarkMode ? '#f2f2f2' : '#111',
                  },
                ]}
                value={newComment}
                onChangeText={setNewComment}
                multiline
              />
              <TouchableOpacity
                style={[
                  styles.commentSendButton,
                  {
                    opacity:
                      newComment.trim().length === 0 ||
                      addCommentMutation.isPending
                        ? 0.5
                        : 1,
                  },
                ]}
                disabled={
                  newComment.trim().length === 0 || addCommentMutation.isPending
                }
                onPress={handleSendComment}
              >
                <Text style={styles.commentSendLabel}>Enviar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  experiencesContainer: {
    gap: 24,
  },
  searchAddContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 16,
    gap: 8,
    paddingHorizontal: 4,
    height: 50,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 0,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingHorizontal: 8,
  },
  addButton: {
    width: 24,
    height: 24,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 44,
    minHeight: 44,
    flex: 1,
    marginLeft: 8,
  },
  addButtonText: {
    color: '#fff',
  },
  searchIconButton: {
    padding: 12,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  postContainer: {
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  postMeta: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  postUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  postAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  postUsername: {
    fontSize: 15,
    fontWeight: '600',
  },
  postImage: {
    width: '100%',
    height: 400,
  },
  postActions: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 16,
  },
  postAction: {
    padding: 4,
  },
  postStats: {
    paddingHorizontal: 12,
    paddingBottom: 4,
  },
  postLikes: {
    fontSize: 15,
    fontWeight: '600',
  },
  postSecondaryStat: {
    fontSize: 13,
    marginTop: 2,
  },
  postCaption: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  postCaptionText: {
    fontSize: 15,
    lineHeight: 18,
  },
  postCaptionUser: {
    fontWeight: '600',
  },
  postsList: {
    paddingBottom: 100,
  },
  emptyContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 120,
    justifyContent: 'center',
  },
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingLabel: {
    color: '#6B7280',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
  },
  emptyCopy: {
    textAlign: 'center',
    color: '#6B7280',
  },
  emptyError: {
    color: '#DC2626',
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  commentsSheet: {
    maxHeight: '85%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  commentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  commentsLoader: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  commentsEmptyContainer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  commentsEmptyText: {
    color: '#999',
  },
  commentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
    gap: 12,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentAvatarText: {
    color: '#111',
    fontWeight: '600',
  },
  commentBody: {
    flex: 1,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '600',
  },
  commentText: {
    fontSize: 14,
    marginTop: 2,
  },
  commentMeta: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
  },
  commentDelete: {
    padding: 4,
  },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e0e0e0',
    paddingTop: 12,
    marginTop: 12,
  },
  commentInput: {
    flex: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 44,
    maxHeight: 120,
  },
  commentSendButton: {
    backgroundColor: BRAND_ORANGE,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  commentSendLabel: {
    color: '#fff',
    fontWeight: '600',
  },
  flex: {
    flex: 1,
  },
});
