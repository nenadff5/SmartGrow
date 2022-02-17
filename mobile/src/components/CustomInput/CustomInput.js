import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

const CustomInput = (props) => {
  const { placeholder, label, iconName, iconsLibrary, iconValidationName } = props;

  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.label}>
        {iconsLibrary == 'Feather' ? (
          <Feather style={styles.icon} size={15} name={iconName} />
        ) : (
          <MaterialCommunityIcons style={styles.icon} size={15} name={iconName} />
        )}
        <Text style={styles.labelText}>{t(label, { ns: 'app' })}</Text>
      </View>
      <View style={styles.inputField}>
        <TextInput
          {...props}
          style={styles.input}
          placeholder={t(placeholder, { ns: 'app' })}
          placeholderTextColor={'grey'}
        />

        {iconValidationName && iconValidationName !== null ? (
          <View style={styles.iconValidationContainer}>
            <Feather style={styles.iconValidation} size={20} name={iconValidationName} />
          </View>
        ) : null}
      </View>
    </View>
  );
};

export default CustomInput;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e8e8e8',
  },
  input: {
    flex: 1,
    color: 'black',
    paddingLeft: 16,
    marginTop: 5,
    height: 40,
    alignSelf: 'flex-start',
  },
  label: {
    alignSelf: 'flex-start',
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexDirection: 'row',
  },
  labelText: {
    fontSize: 13,
    color: 'grey',
  },
  icon: {
    color: 'grey',
    marginRight: 5,
  },
  inputField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconValidationContainer: {
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconValidation: {
    color: 'green',
  },
});
