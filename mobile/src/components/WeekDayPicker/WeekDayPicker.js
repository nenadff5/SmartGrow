import React from 'react';
import { StyleSheet, Text, View, Pressable, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';

export const WeekDayPicker = ({
  weekdays,
  setWeekdays,
  dayTextStyle,
  textColor,
  activeColor,
  inactiveColor,
  wrapperStyles,
  itemStyles,
}) => {
  const daysIO = (v) => {
    if (weekdays.includes(v)) {
      const weekdayRemoved = weekdays.filter((element) => element !== v);
      setWeekdays(weekdayRemoved);
    } else {
      setWeekdays([...weekdays, v]);
    }
  };

  const { t } = useTranslation();

  const acColor = activeColor ? activeColor : 'rgb(44, 187, 116)';
  const icColor = inactiveColor ? inactiveColor : 'grey';
  const tColor = textColor ? textColor : 'white';
  const days = [
    t('common.weekdays.short.1', { ns: 'app' }),
    t('common.weekdays.short.2', { ns: 'app' }),
    t('common.weekdays.short.3', { ns: 'app' }),
    t('common.weekdays.short.4', { ns: 'app' }),
    t('common.weekdays.short.5', { ns: 'app' }),
    t('common.weekdays.short.6', { ns: 'app' }),
    t('common.weekdays.short.7', { ns: 'app' }),
  ];

  return (
    <View style={[styles.boxContainer, wrapperStyles]}>
      {days.map((value, index) => (
        <TouchableOpacity activeOpacity={0.7} key={value} onPress={() => daysIO(index + 1)}>
          <View
            style={[
              styles.box,
              itemStyles,
              { backgroundColor: weekdays.includes(index + 1) ? acColor : icColor },
            ]}>
            <Text style={[{ color: tColor }, dayTextStyle]}>{value}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  box: {
    width: 40,
    height: 40,
    marginHorizontal: 1,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  boxContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 15,
    alignItems: 'center',
  },
});

export default WeekDayPicker;
