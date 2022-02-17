import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, ImageBackground, StatusBar, Dimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import useRoomsAPI from '../../../../context/rooms/UseRoomsAPI';
import usePlantsAPI from '../../../../context/plants/UsePlantsAPI';
import PlantCard from './PlantCard';
import CustomButton from '../../../../components/CustomButton/CustomButton';
import LoadingScreen from '../../../../components/LoadingIndicator/LoadingIndicator';
import { commonStyles } from '../../../../assets/styles/CommonStyles';

const { height } = Dimensions.get('window');

const PlantsListScreen = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [plantsList, setPlantsList] = useState([]);
  const [roomsList, setRoomsList] = useState([]);
  const { getPlants } = usePlantsAPI();
  const { getRooms } = useRoomsAPI();

  const [scrollEnabled, setScrollEnabled] = React.useState(false);

  useEffect(async () => {
    const plantsList = await getPlants();
    const roomsList = await getRooms();
    setLoading(false);
    setPlantsList(plantsList);
    setRoomsList(roomsList);
  }, []);

  const onAddPlantBtnClick = () => {
    navigation.navigate('Plants', { screen: 'NewPlant' });
  };

  const onAddRoomBtnClick = () => {
    navigation.navigate('Rooms', { screen: 'NewRoom' });
  };

  return loading ? (
    <LoadingScreen />
  ) : (
    <View style={commonStyles.keyboardAwareScrollViewWrapper}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" />
      {roomsList.length > 0 && plantsList.length > 0 ? (
        <KeyboardAwareScrollView
          contentContainerStyle={commonStyles.keyboardAwareScrollViewContainer}
          scrollEnabled={scrollEnabled}
          onContentSizeChange={(contentWidth, contentHeight) => {
            const viewHeight = contentHeight + 115;

            viewHeight > height ? setScrollEnabled(true) : setScrollEnabled(false);
          }}
          enableOnAndroid
          showsVerticalScrollIndicator={false}>
          {roomsList.map((roomValue, index) => {
            const room = roomValue.id;
            const foundObject = plantsList.find((elem) => elem.roomId === room);

            // Hide the room if it doesn't contain any plants
            if (!foundObject) {
              return null;
            }

            return (
              <View key={index} style={styles.plantCardWrapper}>
                <Text style={styles.roomNameText}>{roomValue.name}</Text>
                {plantsList.map((plantValue, index) => {
                  return plantValue.roomId === room ? (
                    <PlantCard key={index} plant={plantValue} room={roomValue} />
                  ) : null;
                })}
              </View>
            );
          })}
          <View style={commonStyles.footerContainer}>
            <CustomButton text="plants.newPlant.btnNewPlant" onPress={onAddPlantBtnClick} />
          </View>
        </KeyboardAwareScrollView>
      ) : null}

      {roomsList.length === 0 ? (
        <ImageBackground
          source={require('../../../../assets/images/adaptive-icon.png')}
          imageStyle={{ borderRadius: 20, opacity: 0.25 }}
          resizeMode="center"
          style={styles.image}>
          <Text style={{ marginTop: 20, width: '80%', textAlign: 'center' }}>
            {t('rooms.noRooms', { ns: 'app' })}
          </Text>
          <View style={commonStyles.footerContainer}>
            <CustomButton text="rooms.newRoom.btnNewRoom" onPress={onAddRoomBtnClick} />
          </View>
        </ImageBackground>
      ) : null}

      {roomsList.length > 0 && plantsList.length === 0 ? (
        <ImageBackground
          source={require('../../../../assets/images/adaptive-icon.png')}
          imageStyle={{ borderRadius: 20, opacity: 0.25 }}
          resizeMode="center"
          style={styles.image}>
          <Text style={{ marginTop: 20, width: '80%', textAlign: 'center' }}>
            {t('plants.noPlants', { ns: 'app' })}
          </Text>
          <View style={commonStyles.footerContainer}>
            <CustomButton text="plants.newPlant.btnNewPlant" onPress={onAddPlantBtnClick} />
          </View>
        </ImageBackground>
      ) : null}
    </View>
  );
};

export default PlantsListScreen;

const styles = StyleSheet.create({
  plantCardWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 30,
  },
  roomNameText: {
    alignSelf: 'flex-start',
    marginHorizontal: 25,
    marginBottom: 10,
    color: 'rgb(150,150,150)',
    paddingLeft: 16,
    fontSize: 15,
  },
  image: {
    height: '100%',
    width: '100%',
    alignItems: 'center',
  },
});
