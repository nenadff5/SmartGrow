import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

const uppercaseFirstLetter = (string) => {
  return string[0].toUpperCase() + string.substr(1).toLowerCase();
};

const NotificationCard = ({ notification, onDelete }) => {
  const { t } = useTranslation();

  const getNotificationText = () => {
    let notificationText = '';
    const [notificationHours, setNotificationsHours] = React.useState('');

    let recalculatedWeekday;
    // In the 'trigger' scheduling option, weekday starts from Sunday (1)
    if (notification.trigger.weekday || notification.trigger.dateComponents.weekday === 1) {
      recalculatedWeekday = 7;
    } else if (notification.trigger.weekday || notification.trigger.dateComponents.weekday > 1) {
      recalculatedWeekday = notification.trigger.weekday || notification.trigger.dateComponents.weekday - 1;
    }
    

    const timeMessage =
      t('plants.notifications.remindAt', { ns: 'app' }) +
      `${ Platform.OS === 'ios' ?
        notification.trigger.dateComponents.hour?.toString().padStart(2, '0') :
        notification.trigger.hour?.toString().padStart(2, '0')
      }:${ Platform.OS === 'ios' ? notification.trigger.dateComponents.minute?.toString().padStart(2,'0') :
        notification.trigger.minute?.toString().padStart(2, '0')}`;

    notificationText = `${uppercaseFirstLetter(
      t(`common.weekdays.long.${recalculatedWeekday}`, { ns: 'app' }),
    )} ${timeMessage}`;

    return notificationText;
  };

  return (
    <View style={styles.container}>
      <Text>{getNotificationText()}</Text>
      <View style={styles.rightSideIconsWrapper}>
        <MaterialCommunityIcons
          name="trash-can-outline"
          size={25}
          color="gray"
          style={{ margin: 5 }}
          onPress={() => {
            onDelete(notification);
          }}
        />
      </View>
    </View>
  );
};

export default NotificationCard;

const styles = StyleSheet.create({
  container: {
    height: 60,
    paddingHorizontal: 10,
    marginVertical: 10,
    borderRadius: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
    flexDirection: 'row',
  },
  rightSideIconsWrapper: {
    flex: 1,
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
});
