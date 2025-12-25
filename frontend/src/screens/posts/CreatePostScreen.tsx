import React, { useMemo, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  PermissionsAndroid,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import {
  launchCamera,
  launchImageLibrary,
  ImagePickerResponse,
  Asset,
} from 'react-native-image-picker';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPost } from '@/services/posts/postService';
import { Buffer } from 'buffer';

if (typeof global.Buffer === 'undefined') {
  (global as any).Buffer = Buffer;
}

const MAX_MEDIA_ITEMS = 5;
const ANDROID_PERMISSION_DIALOG = {
  title: 'Permiso requerido',
  message: 'Necesitamos acceso para poder abrir tu cámara y galería.',
  buttonPositive: 'Aceptar',
};

const openSystemSettings = () => {
  Linking.openSettings().catch(() => {
    Alert.alert(
      'Ajustes no disponibles',
      'Abre la configuración del dispositivo manualmente.',
    );
  });
};

const showPermissionAlert = (
  resource: 'cámara' | 'galería',
  options: { permanent?: boolean } = {},
) => {
  const { permanent } = options;
  const message = permanent
    ? `Debes habilitar la ${resource} desde los ajustes del dispositivo.`
    : `Necesitamos acceso a la ${resource} para continuar.`;

  const buttons = permanent
    ? [
        { text: 'Cancelar', style: 'cancel' as const },
        {
          text: 'Abrir ajustes',
          onPress: openSystemSettings,
        },
      ]
    : [{ text: 'Entendido', style: 'default' as const }];

  Alert.alert(`Activa la ${resource}`, message, buttons);
};

interface SelectedMedia {
  uri: string;
  mimeType: string;
  base64: string;
  fileName?: string;
}

export default function CreatePostScreen() {
  const navigation = useNavigation<any>();
  const queryClient = useQueryClient();
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<SelectedMedia[]>([]);

  const remainingSlots = MAX_MEDIA_ITEMS - selectedMedia.length;
  const hasMedia = selectedMedia.length > 0;

  const processAsset = async (asset: Asset) => {
    if (!asset.uri || !asset.type) {
      return null;
    }

    if (asset.base64) {
      return {
        uri: asset.uri,
        base64: asset.base64,
        mimeType: asset.type,
        fileName: asset.fileName,
      };
    }

    if (!asset.fileSize || asset.fileSize > 10 * 1024 * 1024) {
      return null;
    }

    try {
      const response = await fetch(asset.uri);
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      return {
        uri: asset.uri,
        base64: buffer.toString('base64'),
        mimeType: asset.type,
        fileName: asset.fileName,
      };
    } catch (error) {
      console.log('Asset base64 error', error);
      return null;
    }
  };

  const handlePickerResult = async (result?: ImagePickerResponse | null) => {
    if (!result || result.didCancel || !result.assets?.length) {
      return;
    }

    const assets = result.assets.slice(0, remainingSlots);
    const mapped = await Promise.all(assets.map(processAsset));
    const filtered = mapped.filter(Boolean) as SelectedMedia[];

    if (!filtered.length) {
      Alert.alert('No se pudo cargar', 'Algo falló al obtener la imagen.');
      return;
    }

    setSelectedMedia(prev => [...prev, ...filtered]);
  };

  const ensureCameraPermission = async () => {
    if (Platform.OS !== 'android') {
      return true;
    }
    const permission = PermissionsAndroid.PERMISSIONS.CAMERA;
    if (!permission) return true;

    try {
      const status = await PermissionsAndroid.request(permission, {
        ...ANDROID_PERMISSION_DIALOG,
        message: 'Necesitamos acceso a la cámara para tomar fotos.',
      });

      if (status === PermissionsAndroid.RESULTS.GRANTED) {
        return true;
      }

      if (status === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
        showPermissionAlert('cámara', { permanent: true });
      } else {
        showPermissionAlert('cámara');
      }
      return false;
    } catch {
      Alert.alert('Error', 'No se pudo solicitar el permiso de cámara.');
      return false;
    }
  };

  const ensureLibraryPermission = async () => {
    if (Platform.OS !== 'android') {
      return true;
    }

    const candidates = [
      PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
    ].filter(Boolean) as string[];

    if (candidates.length === 0) {
      return true;
    }

    try {
      const statuses = await PermissionsAndroid.requestMultiple(candidates);

      const hasPermanentDenial = candidates.some(
        permission =>
          statuses[permission] === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN,
      );

      const granted = candidates.every(
        permission =>
          statuses[permission] === PermissionsAndroid.RESULTS.GRANTED,
      );

      if (hasPermanentDenial) {
        showPermissionAlert('galería', { permanent: true });
        return false;
      }

      if (!granted) {
        showPermissionAlert('galería');
      }

      return granted;
    } catch {
      Alert.alert('Error', 'No se pudo solicitar el permiso de galería.');
      return false;
    }
  };

  const openCamera = async () => {
    if (remainingSlots <= 0) {
      Alert.alert(
        'Límite alcanzado',
        `Solo puedes añadir ${MAX_MEDIA_ITEMS} fotos.`,
      );
      return;
    }
    const hasPermission = await ensureCameraPermission();
    if (!hasPermission) {
      return;
    }

    try {
      const result = await launchCamera({
        mediaType: 'photo',
        includeBase64: true,
        quality: 0.9,
        maxWidth: 1800,
        maxHeight: 1800,
        includeExtra: true,
        saveToPhotos: true,
      });
      await handlePickerResult(result);
    } catch (error) {
      console.log('Camera launch error', error);
      Alert.alert('No se pudo abrir la cámara', 'Intenta nuevamente.');
    }
  };

  const openGallery = async () => {
    if (remainingSlots <= 0) {
      Alert.alert(
        'Límite alcanzado',
        `Solo puedes añadir ${MAX_MEDIA_ITEMS} fotos.`,
      );
      return;
    }
    const hasPermission = await ensureLibraryPermission();
    if (!hasPermission) {
      return;
    }

    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        includeBase64: true,
        quality: 0.9,
        selectionLimit: remainingSlots,
        includeExtra: true,
      });
      await handlePickerResult(result);
    } catch (error) {
      console.log('Gallery launch error', error);
      Alert.alert('No se pudo abrir la galería', 'Intenta nuevamente.');
    }
  };

  const removeMedia = (uri: string) => {
    setSelectedMedia(prev => prev.filter(item => item.uri !== uri));
  };

  const createPostMutation = useMutation({
    mutationFn: async () => {
      if (!selectedMedia.length) {
        throw new Error('Agrega al menos una foto.');
      }

      const response = await createPost({
        caption: caption.trim(),
        location: location.trim() || undefined,
        media: selectedMedia.map(media => ({
          base64: media.base64,
          mimeType: media.mimeType,
        })),
      });

      if (!response.success) {
        console.error('Create post API response', response);
        const message =
          response.data?.details ||
          response.data?.message ||
          response.error ||
          'No se pudo publicar.';
        throw new Error(message);
      }
      console.log('Create post success', response.data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      setCaption('');
      setLocation('');
      setSelectedMedia([]);
      navigation.goBack();
    },
    onError: (error: any) => {
      console.error('Create post failed', error);
      Alert.alert(
        'No se pudo publicar',
        error?.message ||
          'Intenta de nuevo. Revisa la consola para más detalles.',
      );
    },
  });

  const canSubmit = useMemo(() => {
    return hasMedia && !createPostMutation.isPending;
  }, [hasMedia, createPostMutation.isPending]);

  const handleSubmit = () => {
    if (!hasMedia) {
      Alert.alert(
        'Agrega fotos',
        'Necesitas al menos una imagen para publicar.',
      );
      return;
    }
    createPostMutation.mutate();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.safeArea}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
              accessibilityRole="button"
            >
              <Icon name="arrow-back" size={22} color="#111" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Nueva publicación</Text>
            <View style={styles.headerPlaceholder} />
          </View>

          <View style={styles.pickRow}>
            <TouchableOpacity
              style={styles.pickButton}
              onPress={openCamera}
              accessibilityRole="button"
            >
              <Icon name="photo-camera" size={22} color="#fff" />
              <Text style={styles.pickButtonText}>Cámara</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.pickButton, styles.pickButtonGhost]}
              onPress={openGallery}
              accessibilityRole="button"
            >
              <Icon name="collections" size={22} color="#FF7F3F" />
              <Text
                style={[styles.pickButtonText, styles.pickButtonGhostLabel]}
              >
                Galería
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.helperText}>
            Puedes subir hasta {MAX_MEDIA_ITEMS} fotos. El primer elemento será
            la portada.
          </Text>

          <View style={styles.mediaGrid}>
            {selectedMedia.map(item => (
              <View key={item.uri} style={styles.mediaItem}>
                <Image source={{ uri: item.uri }} style={styles.mediaImage} />
                <TouchableOpacity
                  style={styles.mediaRemove}
                  onPress={() => removeMedia(item.uri)}
                  accessibilityRole="button"
                >
                  <Icon name="close" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
            {selectedMedia.length === 0 && (
              <View style={styles.mediaPlaceholder}>
                <Icon name="collections" size={36} color="#C7CAD1" />
                <Text style={styles.mediaPlaceholderText}>
                  Añade tus fotos favoritas aquí.
                </Text>
              </View>
            )}
          </View>

          <View style={styles.formSection}>
            <Text style={styles.label}>Texto / biografía</Text>
            <TextInput
              style={styles.captionInput}
              placeholder="Cuéntale al mundo qué pasa..."
              placeholderTextColor="#9CA3AF"
              value={caption}
              onChangeText={setCaption}
              multiline
              maxLength={1000}
            />
          </View>

          <View style={styles.formSection}>
            <Text style={styles.label}>Ubicación</Text>
            <TextInput
              style={styles.locationInput}
              placeholder="¿Dónde ocurrió? (opcional)"
              placeholderTextColor="#9CA3AF"
              value={location}
              onChangeText={setLocation}
            />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.publishButton,
              !canSubmit && styles.publishButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!canSubmit}
            accessibilityRole="button"
          >
            {createPostMutation.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.publishText}>Publicar</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 20,
  },
  container: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    marginBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F4F4F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
  },
  headerPlaceholder: {
    width: 40,
  },
  pickRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  pickButton: {
    flex: 1,
    backgroundColor: '#FF7F3F',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  pickButtonGhost: {
    backgroundColor: '#FFE6D8',
  },
  pickButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  pickButtonGhostLabel: {
    color: '#FF7F3F',
  },
  helperText: {
    color: '#6B7280',
    marginBottom: 14,
  },
  mediaGrid: {
    minHeight: 160,
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    padding: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  mediaItem: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  mediaRemove: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaPlaceholder: {
    flex: 1,
    minHeight: 160,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  mediaPlaceholderText: {
    marginTop: 12,
    textAlign: 'center',
    color: '#9CA3AF',
  },
  formSection: {
    marginTop: 24,
  },
  label: {
    fontWeight: '700',
    color: '#111',
    marginBottom: 8,
  },
  captionInput: {
    minHeight: 120,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    textAlignVertical: 'top',
    fontSize: 15,
  },
  locationInput: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E7EB',
  },
  publishButton: {
    backgroundColor: '#111',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  publishButtonDisabled: {
    opacity: 0.4,
  },
  publishText: {
    color: '#fff',
    fontWeight: '700',
  },
});
