import React, { useEffect, useState } from 'react';
import {
  View,
  Alert,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { Formik } from 'formik';
import * as Yup from 'yup';

import LoadingScreen from '../../../../components/LoadingIndicator/LoadingIndicator';
import usePlantsAPI from '../../../../context/plants/UsePlantsAPI';
import useRoomsAPI from '../../../../context/rooms/UseRoomsAPI';
import { pickImageFromCameraUtil, pickImageFromLibraryUtil } from '../../../../utils/ImagePicker';
import CustomButton from '../../../../components/CustomButton/CustomButton';
import CustomPlaceholder from '../../../../components/CustomPlaceholder';
import { commonStyles } from '../../../../assets/styles/CommonStyles';

const { height } = Dimensions.get('window');

const EditPlantScreen = (props) => {
  const plant = props.route.params?.plant;

  const navigation = useNavigation();
  const { t } = useTranslation();
  const { updatePlant } = usePlantsAPI();
  const { getRooms } = useRoomsAPI();

  const [roomsList, setRoomsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scrollEnabled, setScrollEnabled] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(async () => {
    const roomsList = await getRooms();
    setLoading(false);
    setRoomsList(roomsList);
  }, []);

  const EditPlantSchema = Yup.object().shape({
    photo: Yup.mixed(),
    name: Yup.string()
      .max(50, t('plants.newPlant.form.name.tooLong', { ns: 'app' }))
      .required(t('plants.newPlant.form.name.required', { ns: 'app' })),
    roomID: Yup.string().required(t('plants.newPlant.form.room.required', { ns: 'app' })),
  });

  const pickImage = (handleChange) => {
    Alert.alert(
      t('plants.newPlant.form.image.pickFromTitle', { ns: 'app' }),
      t('plants.newPlant.form.image.pickFromText', { ns: 'app' }),
      [
        {
          text: t('common.modal.cancel', { ns: 'app' }),
        },
        {
          text: t('plants.newPlant.form.image.pickFromGallery', { ns: 'app' }),
          onPress: () => {
            pickImageFromLibrary(handleChange('photo'));
          },
        },
        {
          text: t('plants.newPlant.form.image.pickFromCamera', { ns: 'app' }),
          onPress: () => {
            pickImageFromCamera(handleChange('photo'));
          },
        },
      ],
      { cancelable: true },
    );
  };

  const pickImageFromLibrary = async (handleChange) => {
    let result = await pickImageFromLibraryUtil({ base64: true });

    if (result) {
      handleChange(result);
    }
  };

  const pickImageFromCamera = async (handleChange) => {
    let result = await pickImageFromCameraUtil({ base64: true });

    if (result) {
      handleChange(result);
    }
  };

  const removeImage = (handleChange) => {
    handleChange('');
  };

  const onSubmit = async (values) => {
    const plantToSubmit = {
      id: plant.id,
      name: values.name,
      roomID: values.roomID,
    };

    if (values.photo && !values.photo.uri) {
      plantToSubmit.photo = values.photo;
    }

    await updatePlant(plantToSubmit);

    navigation.reset({
      routes: [{ name: 'Plants', screen: 'PlantsList' }],
    });
  };

  return loading ? (
    <LoadingScreen />
  ) : (
    <View style={commonStyles.keyboardAwareScrollViewWrapper}>
      <KeyboardAwareScrollView
        scrollEnabled={scrollEnabled}
        onContentSizeChange={(contentWidth, contentHeight) => {
          const viewHeight = contentHeight + 115;

          viewHeight > height && !isFocused ? setScrollEnabled(true) : setScrollEnabled(false);
        }}
        enableOnAndroid
        showsVerticalScrollIndicator={false}
        extraScrollHeight={Platform.OS === 'ios' ? 250 : 150}
        keyboardShouldPersistTaps="always"
        contentContainerStyle={commonStyles.keyboardAwareScrollViewContainer}
        keyboardShouldPersistTaps='handled'
      >
        <Formik
          initialValues={{
            id: plant.id,
            name: plant.name,
            photo: plant.photo,
            roomID: plant.roomID,
          }}
          validationSchema={EditPlantSchema}
          onSubmit={onSubmit}>
          {({
            setFieldValue,
            handleChange,
            handleSubmit,
            handleBlur,
            values,
            errors,
            touched,
            isValid,
          }) => (
            <View>
              <View style={styles.imageUploadWrapper1}>
                {values.photo ? (
                  <View style={styles.imageUploadWrapper2}>
                    <Image
                      source={{ uri: values.photo.uri ?? `data:image/jpeg;base64,${values.photo}` }}
                      style={styles.image}
                    />

                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => {
                        removeImage(handleChange('photo'));
                      }}
                      style={styles.imageUploadBtn}>
                      <MaterialIcons
                        name="remove"
                        size={18}
                        color="white"
                        style={Platform.OS === 'ios' ? { marginTop: 1, marginLeft: 1 } : null}
                      />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.imageUploadWrapper2}
                    activeOpacity={0.7}
                    onPress={() => pickImage(handleChange)}>
                    <MaterialIcons name="home" size={40} color="white" />

                    <View style={styles.imageUploadBtn}>
                      <MaterialIcons
                        name="camera-alt"
                        size={18}
                        color="white"
                        style={Platform.OS === 'ios' ? { marginTop: 1, marginLeft: 1 } : null}
                      />
                    </View>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.formContainer}>
                <CustomPlaceholder
                  label="plants.newPlant.form.name.label"
                  iconName="home-outline"
                />
                <TextInput
                  style={commonStyles.inputField}
                  name="name"
                  onChangeText={handleChange('name')}
                  onBlur={handleBlur('name')}
                  onFocus={() => setIsFocused(true)}
                  onEndEditing={() => setIsFocused(false)}
                  value={values.name}
                />
                {errors.name && touched.name ? (
                  <Text style={commonStyles.inputFieldError}>{errors.name}</Text>
                ) : null}
              </View>

              <View style={(styles.formContainer, { marginTop: 15 })}>
                <CustomPlaceholder
                  label="plants.newPlant.form.room.label"
                  iconName="map-marker-outline"
                />
                <Picker
                  mode="dialog"
                  itemStyle={{
                    borderWidth: 1,
                    borderRadius: 25,
                    marginTop: 10,
                    borderColor: 'rgb(220,220,220)',
                    height: 125,
                  }}
                  selectedValue={values.roomID}
                  onValueChange={(itemValue) => setFieldValue('roomID', itemValue)}>
                  {roomsList.map((value, index) => {
                    return <Picker.Item key={index} label={value.name} value={value.id} />;
                  })}
                </Picker>
              </View>

              <View style={styles.footerContainer}>
                <CustomButton
                  text="plants.editPlant.btnEditPlant"
                  btnColor={!isValid ? 'grey' : null}
                  disabled={!isValid}
                  onPress={handleSubmit}
                />
              </View>
            </View>
          )}
        </Formik>
      </KeyboardAwareScrollView>
    </View>
  );
};

export default EditPlantScreen;

const { width } = Dimensions.get('screen');

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f9fafd',
    alignItems: 'center',
  },
  formContainer: {
    marginTop: 15,
    width: width * 0.85,
    justifyContent: 'center',
  },
  footerContainer: {
    width: width * 0.9,
    marginBottom: 10,
    marginTop: 10,
    flexDirection: 'column',
    alignItems: 'center',
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
    backgroundColor: 'rgb(44, 187, 116)',
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
