import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useTranslation } from 'react-i18next';
import { Formik } from 'formik';
import * as Yup from 'yup';

import CustomButton from '../../../../components/CustomButton/CustomButton';
import CustomPlaceholder from '../../../../components/CustomPlaceholder';
import { langsAvailable } from '../../../../assets/i18n/i18n-resources';
import { changeLanguage, getCurrentLanguage } from '../../../../utils/i18n';

const ChangeLanguageScreen = () => {
  const { t } = useTranslation();
  const [currentLang, setCurrentLanguage] = useState('en');

  useEffect(async () => {
    setCurrentLanguage(getCurrentLanguage());
  }, []);

  const ChangeLanguageSchema = Yup.object().shape({
    lang: Yup.string().required(t('profile.changeLanguage.form.lang.required', { ns: 'app' })),
  });

  const onSubmit = async (values) => {
    changeLanguage(values.lang);
  };

  return (
    <View style={styles.container}>
      <Formik
        initialValues={{ lang: currentLang }}
        validationSchema={ChangeLanguageSchema}
        validateOnMount
        onSubmit={onSubmit}>
        {({ handleSubmit, setFieldValue, values, isValid }) => (
          <KeyboardAwareScrollView
            contentContainerStyle={{ alignItems: 'center' }}
            showsVerticalScrollIndicator={false}
            enableOnAndroid={true}
            scrollEnabled={false}
            extraScrollHeight={Platform.OS === 'ios' ? 25 : 50}>
            <View style={(styles.formContainer, { marginTop: 15 })}>
              <CustomPlaceholder label="profile.changeLanguage.form.lang.label" iconName="web" />
              <Picker
                mode="dialog"
                itemStyle={{
                  borderWidth: 1,
                  borderRadius: 25,
                  marginTop: 10,
                  borderColor: 'rgb(220,220,220)',
                  height: 125,
                }}
                selectedValue={values.lang}
                onValueChange={(itemValue) => setFieldValue('lang', itemValue)}>
                {langsAvailable.map((value, index) => {
                  return <Picker.Item key={index} label={value.name} value={value.value} />;
                })}
              </Picker>

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

export default ChangeLanguageScreen;

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
