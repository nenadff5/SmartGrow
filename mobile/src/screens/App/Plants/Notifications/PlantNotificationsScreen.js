import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  Pressable,
  Modal,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Dimensions,
  Platform,
} from 'react-native';
import Toast from 'react-native-root-toast';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { PermissionStatus } from 'expo-modules-core';
import * as Notifications from 'expo-notifications';
import { useTranslation } from 'react-i18next';

import CustomInput from '../../../../components/CustomInput/CustomInput';
import usePlantsAPI from '../../../../context/plants/UsePlantsAPI';
import useStatisticsAPI from '../../../../context/statistics/UseStatisticsAPI';
import { WeekDayPicker } from '../../../../components/WeekDayPicker/WeekDayPicker';
import CustomButton from '../../../../components/CustomButton/CustomButton';
import { commonStyles } from '../../../../assets/styles/CommonStyles';
import NotificationCard from './NotificationCard';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const PlantNotificationsScreen = (props) => {
  const plant = props.route.params?.plant;
  const { t } = useTranslation();
  const { loadNotificationsForPlant, cancelNotificationForPlant } = usePlantsAPI();
  const { incrementNotificationsStatistic } = useStatisticsAPI();

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [scrollEnabled, setScrollEnabled] = React.useState(false);
  const [notificationText, setNotificationText] = useState('');
  const [timeBetweenNotifications, setTimeBetweenNotifications] = useState({
    hours: 0,
    minutes: 0,
  });
  const [notificationPermissions, setNotificationPermissions] = useState(
    PermissionStatus.UNDETERMINED,
  );
  const [weekdays, setWeekdays] = useState([]);
  const [scheduledNotifications, setScheduledNotifications] = useState([]);

  const handleNotification = (notification) => {
    Toast.show(notification.request.content.title, {
      duration: Toast.durations.LONG,
    });
  };

  const loadNotifications = async () => {
    const notifications = await loadNotificationsForPlant(plant.id);

    setScheduledNotifications(notifications);
  };

  const requestNotificationPermissions = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    setNotificationPermissions(status);
    return status;
  };

  const onNotificationDelete = async (notification) => {
    await cancelNotificationForPlant(notification.identifier);
    loadNotifications();
  };

  useEffect(async () => {
    requestNotificationPermissions();
    loadNotifications();
  }, []);

  useEffect(() => {
    if (notificationPermissions !== PermissionStatus.GRANTED) return;
    const listener = Notifications.addNotificationReceivedListener(handleNotification);
    return () => listener.remove();
  }, [notificationPermissions]);

  const onNewNotificationBtnClick = () => {
    setModalVisible(!modalVisible);
  };

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date) => {
    setTimeBetweenNotifications({ hours: date.getHours(), minutes: date.getMinutes() });
    hideDatePicker();
  };

  const onNotificationCreate = async () => {
    const hours = timeBetweenNotifications.hours;
    const minutes = timeBetweenNotifications.minutes;

    await Promise.all(
      weekdays.map(async (weekday) => {
        let recalculatedWeekday;
        // In the 'trigger' scheduling option, weekday starts from Sunday (1)
        if (weekday === 7) {
          recalculatedWeekday = 1;
        } else if (weekday > 0) {
          recalculatedWeekday = weekday + 1;
        }

        const schedulingOptions = {
          content: {
            title: `${t('plants.notifications.notificationTitle', { ns: 'app' })} ${plant.name}`,
            body: notificationText,
            data: {
              plant: plant.id,
            },
            sound: true,
            priority: Notifications.AndroidNotificationPriority.HIGH,
            color: 'green',
          },
          trigger: {
            weekday: recalculatedWeekday,
            hour: hours,
            minute: minutes,
            repeats: true,
          },
        };

        await incrementNotificationsStatistic();

        await Notifications.scheduleNotificationAsync(schedulingOptions);
      }),
    );

    onModalClose();
    loadNotifications();
  };

  const onModalClose = () => {
    setModalVisible(!modalVisible);
    setWeekdays([]);
    setTimeBetweenNotifications({
      hours: 0,
      minutes: 0,
    });
    setNotificationText('');
  };

  const getSchedulingText = () => {
    const hours = timeBetweenNotifications.hours;
    const minutes = timeBetweenNotifications.minutes;

    let weekdayMessage = '';
    if (weekdays.length > 1) {
      weekdayMessage =
        t('plants.notifications.remindAtNDays', { ns: 'app' }) +
        weekdays
          .map((value) => {
            return t(`common.weekdays.long.${value}`, { ns: 'app' });
          })
          .join(', ');
    } else if (weekdays.length === 1) {
      weekdayMessage =
        t('plants.notifications.remindAtDay', { ns: 'app' }) +
        t(`common.weekdays.long.${weekdays[0]}`, { ns: 'app' });
    }

    const timeMessage =
      t('plants.notifications.remindAt', { ns: 'app' }) +
      `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

    const message = `${weekdayMessage} ${timeMessage}`;

    return message;
  };

  return (
    <SafeAreaView style={{flex: 1,backgroundColor: '#f9fafd'}}>
      <ScrollView
        contentContainerStyle={commonStyles.paddedListContainer}
        scrollEnabled={scrollEnabled}
        onContentSizeChange={(contentWidth, contentHeight) => {
          const viewHeight = contentHeight + 115;

          viewHeight > height ? setScrollEnabled(true) : setScrollEnabled(false);
        }}
        enableOnAndroid
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps='handled'
        >
        {scheduledNotifications.length > 0 ? (
          scheduledNotifications.map((value, index) => {
            return (
              <NotificationCard onDelete={onNotificationDelete} notification={value} key={index} />
            );
          })
        ) : (
          <View>
            <Text style={{ marginTop: 20, textAlign: 'center' }}>
              {t('plants.notifications.noNotifications', { ns: 'app' })}
            </Text>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <CustomButton
            text="plants.notifications.btnNewNotification"
            onPress={onNewNotificationBtnClick}
          />
        </View>

        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={onModalClose}>
          <KeyboardAwareScrollView
            contentContainerStyle={styles.centeredView}
            extraScrollHeight={Platform.OS === 'ios' ? 20 : null} 
            scrollEnabled={false}
            keyboardShouldPersistTaps='handled'
          >
            <View style={styles.modalView}>
              <Text style={styles.modalText}>
                {t('plants.notifications.modalTitle', { ns: 'app' })}
              </Text>

              {timeBetweenNotifications.hours === 0 && timeBetweenNotifications.minutes === 0 ? (
                <Text>{t('plants.notifications.modalText', { ns: 'app' })}</Text>
              ) : null}

              <WeekDayPicker weekdays={weekdays} setWeekdays={setWeekdays} />

              <View style={styles.modalButton}>
                <CustomButton onPress={showDatePicker} text="plants.notifications.chooseTime" />
              </View>

              {(timeBetweenNotifications.hours !== 0 || timeBetweenNotifications.minutes !== 0) &&
              weekdays.length !== 0 ? (
                <Text style={{ marginBottom: 20 }}>{getSchedulingText()}</Text>
              ) : null}

              <View style={commonStyles.formContainer}>
                <CustomInput
                  label="plants.notifications.notificationMessage.label"
                  iconName="card-text-outline"
                  style={commonStyles.inputField}
                  onChangeText={(text) => setNotificationText(text)}
                  value={notificationText}
                  placeholder={t('plants.notifications.notificationMessage.placeholder', {
                    ns: 'app',
                  })}
                />
              </View>

              <View style={styles.modalButton}>
                <CustomButton
                  btnColor={
                    (timeBetweenNotifications.hours === 0 &&
                      timeBetweenNotifications.minutes === 0) ||
                    weekdays.length === 0 ||
                    notificationText.length === 0
                      ? 'grey'
                      : null
                  }
                  disabled={
                    (timeBetweenNotifications.hours === 0 &&
                      timeBetweenNotifications.minutes === 0) ||
                    weekdays.length === 0 ||
                    notificationText.length === 0
                  }
                  style={[
                    styles.buttonContainer,
                    {
                      backgroundColor:
                        timeBetweenNotifications.hours === 0 &&
                        timeBetweenNotifications.minutes === 0
                          ? 'gray'
                          : 'rgb(44, 187, 116)',
                    },
                  ]}
                  onPress={onNotificationCreate}
                  text="plants.notifications.confirmTime"
                />
              </View>

              <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="time"
                onConfirm={handleConfirm}
                onCancel={hideDatePicker}
                testID="dateTimePicker"
                is24Hour={true}
              />

              <Pressable style={{ width: '100%' }} onPress={onModalClose}>
                <Text style={styles.textStyle}>
                  {t('plants.notifications.closeModal', { ns: 'app' })}
                </Text>
              </Pressable>
            </View>
          </KeyboardAwareScrollView>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PlantNotificationsScreen;

const { width, height } = Dimensions.get('screen');

const styles = StyleSheet.create({
  modalButton: {
    width: width * 0.8,
    flexDirection: 'column',
    alignItems: 'center',
  },
  buttonContainer: {
    width: width * 0.9,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  centeredView: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    margin: 15,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 18,
  },
});
