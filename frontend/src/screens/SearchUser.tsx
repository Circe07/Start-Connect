import { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialIcons';

const BRAND_ORANGE = '#FF7F3F';
const BRAND_GRAY = '#9E9E9E';

export default function SearchUser() {
  const [inputUserValue, setInputUserValue] = useState<string>();

  const handleInputUser = () => {
    if (inputUserValue === '') return;
  };
  return (
    <View style={styles.container}>
      <TextInput style={styles.textBoxInput} placeholder="Buscar" />
      <Pressable style={styles.buttonInputValue} onPress={handleInputUser}>
        <Icon
          style={styles.iconTheme}
          name="search"
          size={25}
          color={BRAND_ORANGE}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    paddingBottom: 10,
    alignItems: 'center',
    justifyContent: 'space-around',
    flexDirection: 'row',
  },
  textBoxInput: {
    height: 40,
    width: 300,
    margin: 20,
    borderWidth: 1,
    borderRadius: 30,
    padding: 10,
    color: '#9E9E9E',
  },

  buttonInputValue: {
    height: 40,
    width: 50,
    borderWidth: 1,
    borderRadius: 30,
    padding: 10,
    color: '#9E9E9E',
  },

  iconTheme: {
    alignContent: 'center',
  },
});
