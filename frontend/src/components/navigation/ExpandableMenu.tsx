import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  useColorScheme,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface ExpandableMenuProps {
  visible: boolean;
  onClose: () => void;
  onOptionSelect: (option: string) => void;
}

const BRAND_ORANGE = '#FF7F3F';

const MENU_OPTIONS = [
  { id: 'centers', label: 'Centros', icon: 'location-city' },
  { id: 'reservations', label: 'Mis Reservas', icon: 'event' },
  { id: 'tienda', label: 'Tienda', icon: 'shopping-cart' },
  { id: 'hobbie', label: 'Hobbies', icon: 'fitness-center' },
];

export default function ExpandableMenu({
  visible,
  onClose,
  onOptionSelect,
}: ExpandableMenuProps) {
  const isDarkMode = useColorScheme() === 'dark';

  const handleOptionPress = (optionId: string) => {
    onOptionSelect(optionId);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.menuContainer}>
          <View
            style={[
              styles.menu,
              { backgroundColor: isDarkMode ? '#1a1a1a' : '#fff' },
            ]}
          >
            {/* Header */}
            <View style={styles.menuHeader}>
              <Text
                style={[
                  styles.menuTitle,
                  { color: isDarkMode ? '#f2f2f2' : '#333' },
                ]}
              >
                Más Opciones
              </Text>
              <Pressable onPress={onClose} hitSlop={10}>
                <Icon
                  name="close"
                  size={24}
                  color={isDarkMode ? '#f2f2f2' : '#333'}
                />
              </Pressable>
            </View>

            {/* Options Grid */}
            <View style={styles.optionsGrid}>
              {MENU_OPTIONS.map(option => (
                <Pressable
                  key={option.id}
                  style={styles.optionItem}
                  onPress={() => handleOptionPress(option.id)}
                >
                  <View
                    style={[
                      styles.optionIconContainer,
                      { backgroundColor: BRAND_ORANGE + '20' },
                    ]}
                  >
                    <Icon name={option.icon} size={32} color={BRAND_ORANGE} />
                  </View>
                  <Text
                    style={[
                      styles.optionLabel,
                      { color: isDarkMode ? '#f2f2f2' : '#333' },
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  menuContainer: {
    width: '100%',
  },
  menu: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingTop: 20,
    gap: 12,
  },
  optionItem: {
    width: '30%',
    alignItems: 'center',
    paddingVertical: 16,
  },
  optionIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});
