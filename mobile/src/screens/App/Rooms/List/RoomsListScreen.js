import React, { useState, useEffect } from 'react';
import {
  Text,
  SafeAreaView,
  View,
  ScrollView,
  StatusBar,
  Dimensions,
  ImageBackground,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import useRoomsAPI from '../../../../context/rooms/UseRoomsAPI';
import usePlantsAPI from '../../../../context/plants/UsePlantsAPI';
import CustomButton from '../../../../components/CustomButton/CustomButton';
import RoomCard from './RoomCard';
import LoadingScreen from '../../../../components/LoadingIndicator/LoadingIndicator';
import { commonStyles } from '../../../../assets/styles/CommonStyles';

const { height } = Dimensions.get('window');

const RoomsListScreen = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();

  const { getRooms } = useRoomsAPI();
  const { loadNotificationsForPlant } = usePlantsAPI();

  const [loading, setLoading] = useState(true);
  const [roomsList, setRoomsList] = useState([]);
  const [scrollEnabled, setScrollEnabled] = useState(false);

  useEffect(async () => {
    const roomsList = await getRooms();

    await Promise.all(
      roomsList.map(async (room) => {
        let notificationsCount = 0;

        await Promise.all(
          room.plants.map(async (plantID) => {
            const notificationsForPlant = await loadNotificationsForPlant(plantID);
            if (notificationsForPlant) {
              notificationsCount += notificationsForPlant.length;
            }
          }),
        );

        room['notificationsCount'] = notificationsCount;
      }),
    );

    setRoomsList(roomsList);
    setLoading(false);
  }, []);

  const onRoomAddBtnClick = () => {
    navigation.navigate('Rooms', { screen: 'NewRoom' });
  };

  return loading ? (
    <LoadingScreen />
  ) : (
    <SafeAreaView style={commonStyles.listContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" />
      {roomsList.length > 0 ? (
        <ScrollView
          scrollEnabled={scrollEnabled}
          onContentSizeChange={(contentWidth, contentHeight) => {
            const viewHeight = contentHeight + 115;

            viewHeight > height ? setScrollEnabled(true) : setScrollEnabled(false);
          }}
          enableOnAndroid
          contentContainerStyle={commonStyles.paddedListContainer}
          showsVerticalScrollIndicator={false}>
          {roomsList.map((value, index) => {
            return (
              <RoomCard
                key={index}
                id={value.id}
                name={value.name}
                photo={value.photo}
                plants={value.plantsCount}
                notifications={value.notificationsCount}
                notes={value.notesCount}
              />
            );
          })}
          <View style={commonStyles.footerContainer}>
            <CustomButton text="rooms.newRoom.btnNewRoom" onPress={onRoomAddBtnClick} />
          </View>
        </ScrollView>
      ) : (
        <ImageBackground
          source={require('../../../../assets/images/adaptive-icon.png')}
          imageStyle={{ borderRadius: 20, opacity: 0.25 }}
          resizeMode="center"
          style={styles.image}>
          <Text style={{ marginTop: 20, width: '80%', textAlign: 'center' }}>
            {t('rooms.noRooms', { ns: 'app' })}
          </Text>
          <View style={commonStyles.footerContainer}>
            <CustomButton text="rooms.newRoom.btnNewRoom" onPress={onRoomAddBtnClick} />
          </View>
        </ImageBackground>
      )}
    </SafeAreaView>
  );
};

export default RoomsListScreen;

const styles = StyleSheet.create({
  image: {
    height: '100%',
    width: '100%',
    alignItems: 'center',
  },
});
