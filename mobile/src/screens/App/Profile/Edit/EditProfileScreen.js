import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Formik } from 'formik';
import * as Yup from 'yup';

import LoadingScreen from '../../../../components/LoadingIndicator/LoadingIndicator';
import CustomButton from '../../../../components/CustomButton/CustomButton';
import CustomInput from '../../../../components/CustomInput/CustomInput';
import { commonStyles } from '../../../../assets/styles/CommonStyles';
import useProfileAPI from '../../../../context/profile/UseProfileAPI';
import { getLocalStorageItem } from '../../../../utils/LocalStorage';
import jwt_decode from 'jwt-decode';

const EditProfileScreen = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { updateProfile } = useProfileAPI();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({
    name: '',
    email: '',
  });

  const EditProfileSchema = Yup.object().shape({
    email: Yup.string()
      .email(t('common.validation.invalidMail', { ns: 'app' }))
      .required(t('common.validation.emptyEmail', { ns: 'app' })),
    name: Yup.string().required(t('register.form.name.required', { ns: 'app' })),
  });

  useEffect(async () => {
    const localStorageToken = await getLocalStorageItem('@token');
    const decodedData = jwt_decode(localStorageToken);

    setUser({
      name: decodedData.name,
      email: decodedData.email,
    });

    setLoading(false);
  }, []);

  const onSubmit = async (values) => {
    const profileToSubmit = {
      name: values.name,
      email: values.email,
    };

    await updateProfile(profileToSubmit);

    navigation.reset({
      routes: [{ name: 'Profile', screen: 'ProfileScreen' }],
    });
  };

  return loading ? (
    <LoadingScreen />
  ) : (
    <View style={styles.container}>
      <Formik
        validateOnMount
        initialValues={{ name: user.name, email: user.email }}
        validationSchema={EditProfileSchema}
        onSubmit={onSubmit}>
        {({ handleChange, handleSubmit, handleBlur, values, errors, touched, isValid }) => (
          <KeyboardAwareScrollView
            contentContainerStyle={{ alignItems: 'center' }}
            showsVerticalScrollIndicator={false}
            enableOnAndroid={true}
            scrollEnabled={false}
            keyboardShouldPersistTaps='handled'
          >
            <View style={{ width: width * 0.8, alignItems: 'center' }}>
              <View style={{ marginBottom: 25 }}></View>
              <CustomInput
                label="profile.editProfile.fullName"
                iconsLibrary="Feather"
                iconName="user"
                iconValidationName={!errors.name ? 'check' : null}
                name="name"
                onChangeText={handleChange('name')}
                onBlur={handleBlur('name')}
                value={values.name}
              />
              {errors.name && touched.name ? (
                <Text style={commonStyles.inputFieldError}>{errors.name}</Text>
              ) : null}

              <CustomInput
                readonly={true}
                label="profile.editProfile.email"
                iconName="email-outline"
                iconValidationName={!errors.email ? 'check' : null}
                name="email"
                onChangeText={handleChange('email')}
                onBlur={handleBlur('email')}
                value={values.email}
              />
              {errors.email && touched.email ? (
                <Text style={commonStyles.inputFieldError}>{errors.email}</Text>
              ) : null}

              <View style={styles.footerContainer}>
                <CustomButton
                  text="common.modal.save"
                  onPress={handleSubmit}
                  btnColor={!isValid ? 'grey' : null}
                  disabled={!isValid}
                />
              </View>

              <View>
                <Text style={{ textAlign: 'center' }}>
                  {t('profile.editProfile.changesAfter', { ns: 'app' })}
                </Text>
              </View>
            </View>
          </KeyboardAwareScrollView>
        )}
      </Formik>
    </View>
  );
};

export default EditProfileScreen;

const { width } = Dimensions.get('screen');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafd',
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
