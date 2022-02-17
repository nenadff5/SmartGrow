import React, { useState } from 'react';
import { StyleSheet, Text, ImageBackground, View, Alert } from 'react-native';
import { Menu, MenuItem } from 'react-native-material-menu';
import { Entypo } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';

import useRoomsAPI from '../../../../context/rooms/UseRoomsAPI';

const RoomCard = ({ id, name, photo = null, plants = 0, notifications = 0, notes = 0 }) => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  const { deleteRoom } = useRoomsAPI();

  const showMenu = () => setVisible(true);

  const hideMenu = () => setVisible(false);

  const onEditBtnClick = () => {
    setVisible(false);
    navigation.navigate('Rooms', {
      screen: 'EditRoom',
      params: {
        room: {
          id,
          name,
          photo: {
            uri: photo,
          },
        },
      },
    });
  };

  const onDeleteBtnClick = () => {
    setVisible(false);

    if (plants > 0) {
      Alert.alert(
        t('rooms.deleteRoom.thereArePlantsInRoomTitle', { ns: 'app' }),
        t('rooms.deleteRoom.thereArePlantsInRoomText', { ns: 'app' }),
        [
          {
            text: t('common.modal.ok', { ns: 'app' }),
          },
        ],
        { cancelable: true },
      );

      return;
    }

    Alert.alert(
      t('rooms.deleteRoom.areYouSureTitle', { ns: 'app' }),
      t('rooms.deleteRoom.areYouSureText', { ns: 'app' }),
      [
        {
          text: t('common.modal.cancel', { ns: 'app' }),
        },
        {
          text: t('common.modal.yes', { ns: 'app' }),
          onPress: async () => {
            try {
              await deleteRoom(id);

              navigation.reset({
                routes: [{ name: 'Rooms', screen: 'RoomsList' }],
              });
            } catch (error) {
              console.log(error);
            }
          },
        },
      ],
      { cancelable: true },
    );
  };

  return (
    <View style={styles.roomCardWrapper}>
      <ImageBackground
        source={{ uri: photo ? photo : null }}
        imageStyle={{ borderRadius: 20 }}
        resizeMode="cover"
        style={styles.image}>
        <View style={styles.leftPanel}>
          <Text style={styles.leftPanelTitle}>{name}</Text>
          <Text style={styles.leftPanelText}>
            {plants} {t('rooms.card.plants', { ns: 'app' })}
            {'\n'}
            {notifications} {t('rooms.card.notifications', { ns: 'app' })}
            {'\n'}
            {notes} {t('rooms.card.notes', { ns: 'app' })}
            {'\n'}
          </Text>
        </View>
        <View style={styles.rightPanel}>
          <Menu
            visible={visible}
            anchor={
              <Entypo name="dots-three-vertical" size={28} color="darkgray" onPress={showMenu} />
            }
            onRequestClose={hideMenu}>
            <MenuItem onPress={onEditBtnClick}>{t('rooms.btnEditRoom', { ns: 'app' })}</MenuItem>
            <MenuItem onPress={onDeleteBtnClick}>
              {t('rooms.deleteRoom.button', { ns: 'app' })}
            </MenuItem>
          </Menu>
        </View>
      </ImageBackground>
    </View>
  );
};

export default RoomCard;

const styles = StyleSheet.create({
  roomCardWrapper: {
    marginTop: 20,
    height: 160,
  },
  image: {
    height: '100%',
    width: '100%',
    flexDirection: 'row',
  },
  leftPanel: {
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: '40%',
  },
  leftPanelTitle: {
    textAlign: 'center',
    marginTop: 15,
    fontSize: 15,
    color: 'ghostwhite',
  },
  leftPanelText: {
    marginTop: 30,
    marginLeft: 15,
    fontSize: 13,
    color: 'lightgray',
  },
  rightPanel: {
    marginLeft: 'auto',
    marginRight: 15,
    marginTop: 15,
  },
});
