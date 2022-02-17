import React from 'react';
import { Text, View, Pressable, Dimensions, StatusBar, Platform } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useTranslation } from 'react-i18next';
import { Formik } from 'formik';
import * as Yup from 'yup';

import CustomButton from '../../../components/CustomButton/CustomButton';
import CustomInput from '../../../components/CustomInput/CustomInput';
import useAuth from '../../../context/auth/UseAuth';
import { commonStyles } from '../../../assets/styles/CommonStyles';
import { setLocalStorageItem } from '../../../utils/LocalStorage';

const { width, height } = Dimensions.get('screen');

const ForgotPasswordScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { forgotPassword } = useAuth();

  const [scrollEnabled, setScrollEnabled] = React.useState(false);
  const [isFocused, setIsFocused] = React.useState(false);

  const RegisterSchema = Yup.object().shape({
    email: Yup.string()
      .email(t('common.validation.invalidMail', { ns: 'app' }))
      .required(t('common.validation.emptyEmail', { ns: 'app' })),
  });

  const onInputCodeBtn = () => {
    navigation.navigate('InputResetCode');
  };

  const onSubmit = (values) => {
    forgotPassword({
      email: values.email,
    });

    setLocalStorageItem('@email', values.email);

    navigation.navigate('InputResetCode');
  };

  return (
    <View style={commonStyles.keyboardAwareScrollViewWrapper}>
      <StatusBar barStyle="dark-content" />
      <Formik
        validateOnMount
        initialValues={{ email: '' }}
        validationSchema={RegisterSchema}
        onSubmit={onSubmit}>
        {({ handleChange, handleSubmit, handleBlur, values, errors, touched, isValid }) => (
          <KeyboardAwareScrollView
            scrollEnabled={scrollEnabled}
            onContentSizeChange={(contentWidth, contentHeight) => {
              const viewHeight = contentHeight + 115;

              viewHeight > height && !isFocused ? setScrollEnabled(true) : setScrollEnabled(false);
            }}
            enableOnAndroid
            bounces={false}
            showsVerticalScrollIndicator={false}
            extraScrollHeight={Platform.OS === 'ios' ? 50 : 10}
            contentContainerStyle={commonStyles.keyboardAwareScrollViewContainer}
            keyboardShouldPersistTaps='handled'
          >
            <View style={{ width: width * 0.8, alignItems: 'center', marginTop: 25 }}>
              <CustomInput
                style={[commonStyles.inputField]}
                label="common.forms.email.label"
                iconName="email-outline"
                iconValidationName={!errors.email ? 'check' : null}
                name="email"
                onChangeText={handleChange('email')}
                onBlur={handleBlur('email')}
                onFocus={() => setIsFocused(true)}
                onEndEditing={() => setIsFocused(false)}
                value={values.email}
                placeholder={t('common.forms.email.placeholder', { ns: 'app' })}
              />
              {errors.email && touched.email ? (
                <Text style={commonStyles.inputFieldError}>{errors.email}</Text>
              ) : null}

              <View style={commonStyles.footerContainer}>
                <CustomButton
                  text="forgotPassword.sendEmailBtn"
                  onPress={handleSubmit}
                  btnColor={!isValid ? 'grey' : null}
                  disabled={!isValid}
                />
                <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                  <Text style={{ alignSelf: 'center', color: 'grey' }}>
                    {t('forgotPassword.alreadyReceived', { ns: 'app' })}
                  </Text>
                  <Pressable onPress={onInputCodeBtn}>
                    <Text style={{ marginLeft: 5, color: 'rgb(44, 187, 116)' }}>
                      {t('forgotPassword.inputCode', { ns: 'app' })}
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </KeyboardAwareScrollView>
        )}
      </Formik>
    </View>
  );
};

export default ForgotPasswordScreen;
