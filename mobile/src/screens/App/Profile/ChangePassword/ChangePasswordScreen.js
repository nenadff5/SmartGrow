import React from 'react';
import { View, Text, StyleSheet, Dimensions, Platform } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Formik } from 'formik';
import * as Yup from 'yup';

import CustomButton from '../../../../components/CustomButton/CustomButton';
import CustomInput from '../../../../components/CustomInput/CustomInput';
import useProfileAPI from '../../../../context/profile/UseProfileAPI';
import { commonStyles } from '../../../../assets/styles/CommonStyles';

const ChangePasswordScreen = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();

  const { updatePassword } = useProfileAPI();

  const ChangePasswordSchema = Yup.object().shape({
    currentPassword: Yup.string().required(t('common.validation.emptyPassword', { ns: 'app' })),
    newPassword: Yup.string()
      .min(8, t('common.validation.passwordFormat', { ns: 'app' }))
      .required(t('common.validation.emptyPassword', { ns: 'app' }))
      .matches(
        /^(?=(.*[a-z]){1,})(?=(.*[A-Z]){1,})(?=(.*[0-9]){1,})(?=(.*[!@#$%^&*()\-__+.]){1,}).{8,}$/,
        t('common.validation.passwordFormat', { ns: 'app' }),
      ),
    reNewPassword: Yup.string()
      .required(t('common.validation.emptyPassword', { ns: 'app' }))
      .oneOf([Yup.ref('newPassword')], t('common.validation.passwordsDontMatch', { ns: 'app' })),
  });

  const onSubmit = async (values) => {
    const passwordToSubmit = {
      password: values.currentPassword,
      newPassword: values.newPassword,
      reNewPassword: values.reNewPassword,
    };

    await updatePassword(passwordToSubmit);

    navigation.reset({
      routes: [{ name: 'Profile', screen: 'ProfileScreen' }],
    });
  };

  return (
    <View style={styles.container}>
      <Formik
        initialValues={{ currentPassword: '', newPassword: '', reNewPassword: '' }}
        validationSchema={ChangePasswordSchema}
        validateOnMount
        onSubmit={onSubmit}>
        {({ handleChange, handleSubmit, handleBlur, values, errors, touched, isValid }) => (
          <KeyboardAwareScrollView
            contentContainerStyle={{ alignItems: 'center' }}
            showsVerticalScrollIndicator={false}
            enableOnAndroid={true}
            scrollEnabled={false}
            extraScrollHeight={Platform.OS === 'ios' ? 30 : 50}
            keyboardShouldPersistTaps='handled'
          >
            <View style={{ width: width * 0.8, alignItems: 'center' }}>
              <View style={{ marginBottom: 25 }}></View>
              <CustomInput
                label="profile.changePassword.currentPassword"
                iconsLibrary="Feather"
                iconName="lock"
                secureTextEntry
                name="currentPassword"
                onChangeText={handleChange('currentPassword')}
                onBlur={handleBlur('currentPassword')}
                value={values.currentPassword}
              />
              {errors.currentPassword && touched.currentPassword ? (
                <Text style={commonStyles.inputFieldError}>{errors.currentPassword}</Text>
              ) : null}

              <CustomInput
                label="profile.changePassword.newPassword"
                iconsLibrary="Feather"
                iconName="lock"
                secureTextEntry
                name="newPassword"
                iconValidationName={!errors.newPassword ? 'check' : null}
                onChangeText={handleChange('newPassword')}
                onBlur={handleBlur('newPassword')}
                value={values.newPassword}
              />
              {errors.newPassword && touched.newPassword ? (
                <Text style={commonStyles.inputFieldError}>{errors.newPassword}</Text>
              ) : null}

              <CustomInput
                label="profile.changePassword.confirmPassword"
                iconsLibrary="Feather"
                iconName="lock"
                secureTextEntry
                name="reNewPassword"
                iconValidationName={!errors.reNewPassword ? 'check' : null}
                onChangeText={handleChange('reNewPassword')}
                onBlur={handleBlur('reNewPassword')}
                value={values.reNewPassword}
              />
              {errors.reNewPassword && touched.reNewPassword ? (
                <Text style={commonStyles.inputFieldError}>{errors.reNewPassword}</Text>
              ) : null}

              <View style={styles.footerContainer}>
                <CustomButton
                  text="common.modal.save"
                  onPress={handleSubmit}
                  btnColor={!isValid ? 'grey' : null}
                  disabled={!isValid}
                />
              </View>
            </View>
          </KeyboardAwareScrollView>
        )}
      </Formik>
    </View>
  );
};

export default ChangePasswordScreen;

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
