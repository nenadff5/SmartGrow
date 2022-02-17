import React from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';

const CustomButton = (props) => {
  const { onPress, text, btnColor } = props;
  const { t } = useTranslation();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      {...props}
      onPress={onPress}
      style={[styles.container, { backgroundColor: btnColor ?? 'rgb(44, 187, 116)' }]}>
      <Text style={[styles.text]}>{t(text, { ns: 'app' })}</Text>
    </TouchableOpacity>
  );
};

export default CustomButton;

const styles = StyleSheet.create({
  container: {
    borderRadius: 25,
    width: '100%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgb(44, 187, 116)',
    marginTop: 20,
    marginBottom: 15,
  },
  text: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },
});
