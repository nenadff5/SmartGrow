import PropTypes from 'prop-types';
import React, { createContext, useContext } from 'react';
import Toast from 'react-native-root-toast';
import { useTranslation } from 'react-i18next';
import * as Notifications from 'expo-notifications';

import api from '../../utils/API';

const PlantsContext = createContext({});

export const PlantsProvider = ({ children }) => {
  const { t } = useTranslation();

  const getPlants = async () => {
    try {
      const res = await api.get('/plants');
      return res.data;
    } catch (error) {
      Toast.show(t('common.errorOccurred', { ns: 'backend' }), {
        duration: Toast.durations.LONG,
      });
    }
  };

  const updatePlant = async (plant) => {
    try {
      const res = await api.put(`/plants/${plant.id}`, plant);

      const { message } = res.data;

      Toast.show(t(message ?? 'common.requestSuccessful', { ns: 'backend' }), {
        duration: Toast.durations.SHORT,
      });
    } catch (error) {
      const { message } = error.response.data;

      Toast.show(t(message ?? 'common.errorOccurred', { ns: 'backend' }), {
        duration: Toast.durations.LONG,
      });
    }
  };

  const createPlant = async (plant) => {
    try {
      const res = await api.post('/plants', plant);

      const { message } = res.data;

      Toast.show(t(message ?? 'common.requestSuccessful', { ns: 'backend' }), {
        duration: Toast.durations.SHORT,
      });
    } catch (error) {
      const { message } = error.response.data;

      Toast.show(t(message ?? 'common.errorOccurred', { ns: 'backend' }), {
        duration: Toast.durations.LONG,
      });
    }
  };

  const deletePlant = async (id) => {
    try {
      const res = await api.delete(`/plants/${id}`);

      const { message } = res.data;

      cancelAllNotificationsForPlant(id);

      Toast.show(t(message ?? 'common.requestSuccessful', { ns: 'backend' }), {
        duration: Toast.durations.SHORT,
      });
    } catch (error) {
      const { message } = error.response.data;

      Toast.show(t(message ?? 'common.errorOccurred', { ns: 'backend' }), {
        duration: Toast.durations.LONG,
      });
    }
  };

  const loadNotificationsForPlant = async (id) => {
    const notifications = await Notifications.getAllScheduledNotificationsAsync();

    const filteredNotifications = notifications.filter(
      (notification) => notification.content.data.plant === id,
    );

    return filteredNotifications;
  };

  const cancelNotificationForPlant = async (id) => {
    await Notifications.cancelScheduledNotificationAsync(id);
    return;
  };

  const cancelAllNotificationsForPlant = async (id) => {
    const notifications = await loadNotificationsForPlant(id);

    notifications.forEach(async (notification) => {
      await cancelNotificationForPlant(notification.identifier);
    });

    return;
  };

  return (
    <PlantsContext.Provider
      value={{
        getPlants,
        updatePlant,
        createPlant,
        deletePlant,
        loadNotificationsForPlant,
        cancelNotificationForPlant,
        cancelAllNotificationsForPlant,
      }}>
      {children}
    </PlantsContext.Provider>
  );
};

PlantsProvider.propTypes = {
  children: PropTypes.element,
};

export default function usePlantsAPI() {
  return useContext(PlantsContext);
}
