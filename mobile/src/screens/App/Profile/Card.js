import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';

import { AntDesign, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('screen');

const Card = (props) => {
  const { label = 'Label', iconsLibrary, icon = 'pencil', onPress } = props;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.iconContainer}>
        {iconsLibrary == 'Ionicons' ? (
          <Ionicons name={icon} size={30} color="rgb(44, 187, 116)" />
        ) : iconsLibrary == 'AntDesign' ? (
          <AntDesign name={icon} size={30} color="rgb(44,187,116)" />
        ) : iconsLibrary == 'MaterialCommunityIcons' ? (
          <MaterialCommunityIcons name={icon} size={30} color="rgb(44,187,116)" />
        ) : iconsLibrary == 'MaterialIcon' ? (
          <MaterialIcons name={icon} size={30} color="rgb(44,187,116)" />
        ) : null}
      </View>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.rightSideIconWrapper}>
        <AntDesign name="right" size={25} color="black" style={{ margin: 5 }} />
      </View>
    </TouchableOpacity>
  );
};

export default Card;

const styles = StyleSheet.create({
  container: {
    width: width * 0.75,
    height: 60,
    margin: 10,
    borderRadius: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
    flexDirection: 'row',
  },
  iconContainer: {
    backgroundColor: 'rgb(240,240,240)',
    width: 50,
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
  },
  image: {
    height: 50,
    width: 50,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  rightSideIconWrapper: {
    flex: 1,
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  label: {
    fontSize: 16,
  },
});
