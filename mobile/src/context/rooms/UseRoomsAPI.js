import PropTypes from 'prop-types';
import React, { createContext, useContext } from 'react';
import Toast from 'react-native-root-toast';
import { useTranslation } from 'react-i18next';

import api from '../../utils/API';

const RoomsContext = createContext({});

export const RoomsProvider = ({ children }) => {
  const { t } = useTranslation();

  const getRooms = async () => {
    try {
      const res = await api.get('/rooms');
      return res.data;
    } catch (error) {
      Toast.show(t('common.errorOccurred', { ns: 'backend' }), {
        duration: Toast.durations.LONG,
      });
    }
  };

  const updateRoom = async (room) => {
    try {
      const res = await api.put(`/rooms/${room.id}`, room);

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

  const createRoom = async (room) => {
    try {
      const res = await api.post('/rooms', room);

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

  const deleteRoom = async (id) => {
    try {
      const res = await api.delete(`/rooms/${id}`);

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

  return (
    <RoomsContext.Provider
      value={{
        getRooms,
        updateRoom,
        createRoom,
        deleteRoom,
      }}>
      {children}
    </RoomsContext.Provider>
  );
};

RoomsProvider.propTypes = {
  children: PropTypes.element,
};

export default function useRoomsAPI() {
  return useContext(RoomsContext);
}
