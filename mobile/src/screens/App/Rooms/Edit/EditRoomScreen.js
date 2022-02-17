import React, { useState } from 'react';
import {
  View,
  Alert,
  TextInput,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { MaterialIcons } from '@expo/vector-icons';
import { Formik } from 'formik';
import * as Yup from 'yup';

import useRoomsAPI from '../../../../context/rooms/UseRoomsAPI';
import { pickImageFromCameraUtil, pickImageFromLibraryUtil } from '../../../../utils/ImagePicker';
import CustomButton from '../../../../components/CustomButton/CustomButton';
import CustomPlaceholder from '../../../../components/CustomPlaceholder';
import { commonStyles } from '../../../../assets/styles/CommonStyles';

const { height } = Dimensions.get('window');

const EditRoomScreen = (props) => {
  const room = props.route.params?.room;

  const navigation = useNavigation();

  const { updateRoom } = useRoomsAPI();

  const { t } = useTranslation();

  const [scrollEnabled, setScrollEnabled] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const EditRoomSchema = Yup.object().shape({
    photo: Yup.mixed(),
    name: Yup.string()
      .max(50, t('rooms.newRoom.form.name.tooLong', { ns: 'app' }))
      .required(t('rooms.newRoom.form.name.required', { ns: 'app' })),
  });

  const pickImage = (handleChange) => {
    Alert.alert(
      t('rooms.newRoom.form.image.pickFromTitle', { ns: 'app' }),
      t('rooms.newRoom.form.image.pickFromText', { ns: 'app' }),
      [
        {
          text: t('common.modal.cancel', { ns: 'app' }),
        },
        {
          text: t('rooms.newRoom.form.image.pickFromGallery', { ns: 'app' }),
          onPress: () => {
            pickImageFromLibrary(handleChange('photo'));
          },
        },
        {
          text: t('rooms.newRoom.form.image.pickFromCamera', { ns: 'app' }),
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
    const roomToSubmit = {
      id: values.id,
      name: values.name,
    };

    if (values.photo && !values.photo.uri) {
      roomToSubmit.photo = values.photo;
    }

    await updateRoom(roomToSubmit);

    navigation.reset({
      routes: [{ name: 'Rooms', screen: 'RoomsList' }],
    });
  };

  return (
    <View style={commonStyles.keyboardAwareScrollViewWrapper}>
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps="always"
        contentContainerStyle={commonStyles.keyboardAwareScrollViewContainer}
        scrollEnabled={scrollEnabled}
        onContentSizeChange={(contentWidth, contentHeight) => {
          const viewHeight = contentHeight + 115;

          viewHeight > height && !isFocused ? setScrollEnabled(true) : setScrollEnabled(false);
        }}
        enableOnAndroid
        extraScrollHeight={60}
        showsVerticalScrollIndicator={false}>
        <Formik
          initialValues={{ id: room.id, name: room.name, photo: room.photo }}
          validationSchema={EditRoomSchema}
          onSubmit={onSubmit}>
          {({ handleChange, handleSubmit, handleBlur, values, errors, touched, isValid }) => (
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
                <CustomPlaceholder label="rooms.newRoom.form.name.label" iconName="home-outline" />
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

              <View style={styles.footerContainer}>
                <CustomButton
                  text="rooms.editRoom.btnEditRoom"
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

export default EditRoomScreen;

const { width } = Dimensions.get('screen');

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
