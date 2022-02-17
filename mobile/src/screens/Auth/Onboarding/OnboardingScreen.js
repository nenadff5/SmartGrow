import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  StatusBar,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';
import { useTranslation } from 'react-i18next';

import { setLocalStorageItem, getLocalStorageItem } from '../../../utils/LocalStorage';
import LoadingScreen from '../../../components/LoadingIndicator/LoadingIndicator';

const { width, height } = Dimensions.get('screen');

const slides = [
  {
    key: 'one',
    title: 'onboarding.titles.title1',
    text: 'onboarding.subtitles.subtitle1',
  },
  {
    key: 'two',
    title: 'onboarding.titles.title2',
    text: 'onboarding.subtitles.subtitle2',
  },
  {
    key: 'three',
    title: 'onboarding.titles.title3',
    text: 'onboarding.subtitles.subtitle3',
  },
];

const OnboardingScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);

  const onDone = () => {
    setLocalStorageItem('@viewedOnboarding', 'true');
    navigation.navigate('Login');
  };

  useEffect(async () => {
    const localStorageItem = await getLocalStorageItem('@viewedOnboarding');

    if (localStorageItem !== null) {
      navigation.push('Login');
    } else {
      setLoading(false);
    }
  });

  const renderNextButton = () => {
    return (
      <View style={styles.btnNextDone}>
        <Text style={styles.btnText}>{t('onboarding.buttons.next', { ns: 'app' })}</Text>
      </View>
    );
  };

  const renderSkipButton = () => {
    return <Text style={styles.btnSkip}>{t('onboarding.buttons.skip', { ns: 'app' })}</Text>;
  };

  const renderDoneButton = () => {
    return (
      <View style={styles.btnNextDone}>
        <Text style={styles.btnText}>{t('onboarding.buttons.done', { ns: 'app' })}</Text>
      </View>
    );
  };

  const renderItem = ({ item }) => {
    return (
      <View style={styles.slide}>
        <Text style={styles.title}>{t(item.text, { ns: 'app' })}</Text>
        <Text style={styles.text}>{t(item.text, { ns: 'app' })}</Text>
      </View>
    );
  };

  // Initially, auto scroll is enabled. If the user touches
  // the 'Next' button, the auto scroll will be disabled
  const sliderRef = React.createRef();
  let autoScroll = true;

  const onSlideChange = () => {
    autoScroll = false;
  };

  useEffect(() => {
    setTimeout(() => {
      if (autoScroll && sliderRef.current) {
        sliderRef.current.goToSlide(1);
      }
    }, 4000);

    setTimeout(() => {
      if (autoScroll && sliderRef.current) {
        sliderRef.current.goToSlide(2);
      }
    }, 8000);
  });

  return loading ? (
    <LoadingScreen />
  ) : (
    <View style={styles.view}>
      <StatusBar barStyle="light-content" translucent={true} backgroundColor={'transparent'} />
      <Image
        source={require('../../../assets/images/onboarding/boarding.png')}
        style={styles.image}
      />
      <AppIntroSlider
        ref={sliderRef}
        dotStyle={{ backgroundColor: '#fff', borderWidth: 1, borderColor: '#a8a9aa' }}
        activeDotStyle={{
          backgroundColor: 'rgb(44, 187, 116)',
          borderWidth: 1,
          borderColor: '#a8a9aa',
        }}
        showSkipButton
        bottomButton
        keyExtractor={(item) => item.text}
        renderItem={renderItem}
        renderNextButton={renderNextButton}
        renderSkipButton={renderSkipButton}
        renderDoneButton={renderDoneButton}
        data={slides}
        onSlideChange={onSlideChange}
        onDone={onDone}
        onSkip={onDone}
      />
    </View>
  );
};

export default OnboardingScreen;

const styles = StyleSheet.create({
  view: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    backgroundColor: '#f6f7fb',
  },
  slide: {
    alignItems: 'center',
  },
  image: {
    height: height * 0.6,
    width: width,
    resizeMode: 'stretch',
  },
  title: {
    marginTop: 15,
    fontSize: 20,
    width: '75%',
    color: '#646565',
    textAlign: 'center',
  },
  text: {
    fontSize: 16,
    color: '#a8a9aa',
    textAlign: 'center',
    maxWidth: '70%',
    marginVertical: 10,
  },
  btnNextDone: {
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    borderRadius: 25,
    backgroundColor: 'rgb(44, 187, 116)',
  },
  btnSkip: {
    fontSize: 14,
    color: 'black',
    textAlign: 'center',
    marginBottom: 5,
  },
  btnText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
  },
});
