import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

const CustomPlaceholder = (props) => {
  const { label, iconsLibrary, iconName } = props;

  const { t } = useTranslation();

  return (
    <View style={styles.label}>
      {iconsLibrary == 'Feather' ? (
        <Feather style={styles.icon} name={iconName} />
      ) : (
        <MaterialCommunityIcons style={styles.icon} name={iconName} />
      )}
      <Text style={styles.labelText}>{t(label, { ns: 'app' })}</Text>
    </View>
  );
};

export default CustomPlaceholder;

const styles = StyleSheet.create({
  label: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  labelText: {
    color: 'grey',
  },
  icon: {
    color: 'grey',
    marginRight: 5,
  },
});
