import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AntDesign, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const PlantCard = (props) => {
  const { plant, room } = props;

  const navigation = useNavigation();

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() =>
        navigation.navigate('Plants', {
          screen: 'PlantDetails',
          params: {
            plant,
            room,
          },
        })
      }
      activeOpacity={0.7}>
      <View style={styles.iconContainer}>
        {plant.photo ? (
          <Image source={{ uri: plant.photo }} style={{ height: 50, width: 50 }} />
        ) : (
          <Ionicons name="leaf" size={35} color="rgb(44, 187, 116)" />
        )}
      </View>
      <Text style={styles.plantName}>{plant.name}</Text>
      <View style={styles.rightSideIconsWrapper}>
        {plant.wateringCan ? (
          <MaterialCommunityIcons
            name="watering-can"
            size={30}
            color="rgb(44, 187, 116)"
            style={{ margin: 5 }}
          />
        ) : null}
        <AntDesign name="right" size={25} color="black" style={{ margin: 5 }} />
      </View>
    </TouchableOpacity>
  );
};

export default PlantCard;

const { width } = Dimensions.get('screen');

const styles = StyleSheet.create({
  container: {
    width: width * 0.8,
    height: 70,
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
    margin: 10,
  },
  image: {
    height: 50,
    width: 50,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  rightSideIconsWrapper: {
    flex: 1,
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  plantName: {
    fontSize: 16,
  },
});
