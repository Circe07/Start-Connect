import React from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TextStyle,
  ViewStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface InputBoxProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;

  mainIconName: string;
  mainIconSize?: number;
  mainIconColor?: string;

  actionIconName?: string;
  onActionPress?: () => void;
  actionIconColor?: string;
  actionIconSize?: number;

  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;

  autoFocus?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
}

const BRAND_GRAY = '#9E9E9E';
const BG_COLOR = '#F2F2F2';

export default function SearchInputBox({
  mainIconName,
  onChangeText,
  value,
  autoFocus,
  containerStyle,
  inputStyle,
  keyboardType,
  mainIconColor = BRAND_GRAY,
  mainIconSize = 24,
  actionIconColor = mainIconColor,
  actionIconName,
  actionIconSize = 24,
  onActionPress,
  placeholder = 'Escribe aqui...',
  ...rest
}: InputBoxProps) {
  const showActionIcon = actionIconName ? true : value.length > 0;

  const resolvedActionIconName = actionIconName || 'close';
  const resolvedOnActionPress = onActionPress || (() => onChangeText(''));

  return (
    <View style={[styles.inputContainer, containerStyle]}>
      {/* Principal Icon (Left) */}
      <Icon
        name={mainIconName}
        size={mainIconSize}
        color={mainIconColor}
        style={styles.mainIcon}
      />

      {/* INPUT BOX */}
      <TextInput
        style={[styles.textBoxInput, inputStyle]}
        placeholder={placeholder}
        placeholderTextColor={BRAND_GRAY}
        value={value}
        onChangeText={onChangeText}
        {...rest}
      />

      {/* Action button (Right) - Clean or Send */}
      {showActionIcon && (
        <TouchableOpacity onPress={resolvedOnActionPress}>
          <Icon
            name={resolvedActionIconName}
            size={actionIconSize}
            color={actionIconColor}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BG_COLOR,
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 40,
  },
  mainIcon: {
    marginRight: 10,
  },
  textBoxInput: {
    flex: 1,
    height: 40,
    color: '#000',
    fontSize: 16,
  },
});
