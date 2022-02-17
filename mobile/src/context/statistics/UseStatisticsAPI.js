import PropTypes from 'prop-types';
import React, { createContext, useContext } from 'react';
import Toast from 'react-native-root-toast';
import { useTranslation } from 'react-i18next';

import api from '../../utils/API';

const StatisticsContext = createContext({});

export const StatisticsProvider = ({ children }) => {
  const { t } = useTranslation();

  const incrementNotificationsStatistic = async () => {
    try {
      const res = await api.patch('/increment-notifications');
      return res.data;
    } catch (error) {
      Toast.show(t('common.errorOccurred', { ns: 'backend' }), {
        duration: Toast.durations.LONG,
      });
    }
  };

  return (
    <StatisticsContext.Provider
      value={{
        incrementNotificationsStatistic,
      }}>
      {children}
    </StatisticsContext.Provider>
  );
};

StatisticsProvider.propTypes = {
  children: PropTypes.element,
};

export default function useStatisticsAPI() {
  return useContext(StatisticsContext);
}
