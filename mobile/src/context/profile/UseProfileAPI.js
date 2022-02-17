import PropTypes from 'prop-types';
import React, { createContext, useContext } from 'react';
import Toast from 'react-native-root-toast';
import { useTranslation } from 'react-i18next';

import api from '../../utils/API';

const ProfileContext = createContext({});

export const ProfileProvider = ({ children }) => {
  const { t } = useTranslation();

  const updateProfile = async (profileData) => {
    try {
      const res = await api.post('/update-profile', profileData);

      const { message } = res.data;

      Toast.show(t(message ?? 'common.requestSuccessful', { ns: 'backend' }), {
        duration: Toast.durations.SHORT,
      });

      return res.data;
    } catch (error) {
      Toast.show(t('common.errorOccurred', { ns: 'backend' }), {
        duration: Toast.durations.LONG,
      });
    }
  };

  const updatePassword = async (passwordData) => {
    try {
      const res = await api.post('/update-password', passwordData);

      const { message } = res.data;

      Toast.show(t(message ?? 'common.requestSuccessful', { ns: 'backend' }), {
        duration: Toast.durations.SHORT,
      });

      return res.data;
    } catch (error) {
      Toast.show(t('common.errorOccurred', { ns: 'backend' }), {
        duration: Toast.durations.LONG,
      });
    }
  };

  return (
    <ProfileContext.Provider
      value={{
        updateProfile,
        updatePassword,
      }}>
      {children}
    </ProfileContext.Provider>
  );
};

ProfileProvider.propTypes = {
  children: PropTypes.element,
};

export default function useProfileAPI() {
  return useContext(ProfileContext);
}
