import PropTypes from 'prop-types';
import React from 'react';
import {
  View,
  Pressable,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import usePlantsAPI from '../../../../context/plants/UsePlantsAPI';
import CustomPlaceholder from '../../../../components/CustomPlaceholder';
import CustomInput from '../../../../components/CustomInput/CustomInput';
import { commonStyles } from '../../../../assets/styles/CommonStyles';

const { height } = Dimensions.get('window');

const PlantDetailsScreen = (props) => {
  const plant = props.route.params?.plant;
  const room = props.route.params?.room;

  const navigation = useNavigation();
  const { t } = useTranslation();
  const { deletePlant } = usePlantsAPI();

  const [scrollEnabled, setScrollEnabled] = React.useState(false);

  const onEditBtnClick = () => {
    navigation.navigate('Plants', {
      screen: 'EditPlant',
      params: {
        plant: {
          photo: {
            uri: plant.photo.uri ? plant.photo.uri : plant.photo,
          },
          id: plant.id,
          name: plant.name,
          roomID: plant.roomId,
        },
        room,
      },
    });
  };

  const onNotificationsBtnClick = () => {
    navigation.navigate('Plants', {
      screen: 'PlantNotifications',
      params: {
        plant,
        room,
      },
    });
  };

  const onNotesBtnClick = () => {
    navigation.navigate('Plants', {
      screen: 'PlantNotes',
      params: {
        plant,
        room,
      },
    });
  };

  const onDeleteBtnClick = () => {
    Alert.alert(
      t('plants.deletePlant.areYouSureTitle', { ns: 'app' }),
      t('plants.deletePlant.areYouSureText', { ns: 'app' }),
      [
        {
          text: t('common.modal.cancel', { ns: 'app' }),
        },
        {
          text: t('common.modal.yes', { ns: 'app' }),
          onPress: async () => {
            try {
              await deletePlant(plant.id);

              navigation.reset({
                routes: [{ name: 'Plants', screen: 'PlantsList' }],
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
    <View style={commonStyles.keyboardAwareScrollViewWrapper}>
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps="always"
        contentContainerStyle={commonStyles.keyboardAwareScrollViewContainer}
        scrollEnabled={scrollEnabled}
        onContentSizeChange={(contentWidth, contentHeight) => {
          const viewHeight = contentHeight + 115;

          viewHeight > height ? setScrollEnabled(true) : setScrollEnabled(false);
        }}
        enableOnAndroid
        showsVerticalScrollIndicator={false}>
        <View>
          <View style={styles.imageUploadWrapper1}>
            {plant.photo ? (
              <View style={styles.imageUploadWrapper2}>
                <Image source={{ uri: plant.photo.uri ?? plant.photo }} style={styles.image} />
              </View>
            ) : null}
          </View>
          <View style={styles.formContainer}>
            <CustomPlaceholder
              label="plants.plantDetails.form.name.label"
              iconName="home-outline"
            />
            <Text style={commonStyles.inputField}>{plant.name}</Text>
          </View>

          <View style={styles.formContainer}>
            <CustomPlaceholder
              label="plants.plantDetails.form.room.label"
              iconName="map-marker-outline"
            />
            <Text style={commonStyles.inputField}>{room.name}</Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: 'rgb(44, 187, 116)' }]}
            activeOpacity={0.7}
            onPress={onEditBtnClick}>
            <Text style={{ color: 'white', fontSize: 16 }}>
              {t('plants.plantDetails.btnEditPlant', { ns: 'app' })}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: 'rgb(44, 187, 116)' }]}
            activeOpacity={0.7}
            onPress={onDeleteBtnClick}>
            <Text style={{ color: 'white', fontSize: 16 }}>
              {t('plants.deletePlant.button', { ns: 'app' })}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: 'rgb(44, 187, 116)' }]}
            activeOpacity={0.7}
            onPress={onNotificationsBtnClick}>
            <Text style={{ color: 'white', fontSize: 16 }}>
              {t('plants.notifications.title', { ns: 'app' })}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: 'rgb(44, 187, 116)' }]}
            activeOpacity={0.7}
            onPress={onNotesBtnClick}>
            <Text style={{ color: 'white', fontSize: 16 }}>
              {t('plants.notes.title', { ns: 'app' })}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
};

PlantDetailsScreen.propTypes = {
  route: PropTypes.shape({
    params: PropTypes.shape({
      plant: PropTypes.shape({
        id: PropTypes.number,
        name: PropTypes.string,
        roomId: PropTypes.number,
      }),
      room: PropTypes.shape({
        name: PropTypes.string,
      }),
    }),
  }),
};

export default PlantDetailsScreen;

const { width } = Dimensions.get('screen');

const styles = StyleSheet.create({
  actionButton: {
    borderRadius: 25,
    width: '40%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgb(44, 187, 116)',
  },
  formContainer: {
    marginTop: 15,
    width: width * 0.85,
    justifyContent: 'center',
  },
  buttonContainer: {
    width: width * 0.9,
    marginBottom: 10,
    marginTop: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  imageUploadWrapper1: {
    marginTop: 20,
    borderRadius: 15,
    height: 175,
    width: width * 0.9,
    borderColor: 'lightgray',
    borderStyle: 'solid',
    borderWidth: 1,
    paddingHorizontal: 3,
    paddingVertical: 2.5,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageUploadWrapper2: {
    height: '100%',
    width: '100%',
    borderRadius: 10,
    backgroundColor: 'rgb(193, 193, 193)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageUploadBtn: {
    position: 'absolute',
    width: 30,
    height: 30,
    bottom: -10,
    right: -10,
    backgroundColor: 'green',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
  },
  image: {
    borderRadius: 10,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
});
