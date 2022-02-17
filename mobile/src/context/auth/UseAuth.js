import PropTypes from 'prop-types';
import React, { useState, createContext, useContext } from 'react';
import Toast from 'react-native-root-toast';
import { useTranslation } from 'react-i18next';
import jwt_decode from 'jwt-decode';

import api from '../../utils/API';
import {
  getLocalStorageItem,
  setLocalStorageItem,
  removeLocalStorageItem,
} from '../../utils/LocalStorage';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const { t } = useTranslation();

  const [authState, setAuthState] = useState({
    token: null,
    isAuthenticated: false,
    loading: true,
    user: null,
  });

  const checkIfTokenExists = async () => {
    try {
      // if no token is in authState check localStorage
      const localStorageToken = await getLocalStorageItem('@token');

      if (localStorageToken) {
        const decodedData = jwt_decode(localStorageToken);

        api.defaults.headers.common['Authorization'] = `Bearer ${localStorageToken}`;

        setAuthState({
          ...authState,
          isAuthenticated: true,
          user: {
            id: decodedData.id,
            email: decodedData.email,
          },
        });

        return;
      }

      api.defaults.headers.common['Authorization'] = null;
      return;
    } catch (error) {
      console.log(error);
    }
  };

  const login = async (formData) => {
    try {
      const res = await api.post('/login', formData);

      const jwtToken = res.data;

      setLocalStorageItem('@token', jwtToken);

      const decodedData = jwt_decode(jwtToken);

      api.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`;

      setAuthState({
        ...authState,
        isAuthenticated: true,
        user: {
          id: decodedData.id,
          email: decodedData.email,
        },
      });
    } catch (error) {
      const { message } = error.response.data;

      Toast.show(t(message ?? 'common.errorOccurred', { ns: 'backend' }), {
        duration: Toast.durations.LONG,
      });
    }
  };

  const register = async (formData) => {
    try {
      await api.post('/register', formData);

      login({ email: formData.email, password: formData.password });
    } catch (error) {
      const { message } = error.response.data;

      Toast.show(t(message ?? 'common.errorOccurred', { ns: 'backend' }), {
        duration: Toast.durations.LONG,
      });
    }
  };

  const logout = async () => {
    try {
      removeLocalStorageItem('@token');

      setAuthState({
        ...authState,
        isAuthenticated: false,
        user: {
          id: null,
          email: null,
        },
      });
    } catch (error) {
      const { message } = error.response.data;

      Toast.show(t(message ?? 'common.errorOccurred', { ns: 'backend' }), {
        duration: Toast.durations.LONG,
      });
    }
  };

  const forgotPassword = async (formData) => {
    try {
      const res = await api.post(`/forgot-password`, formData);

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

  const resetPassword = async (formData) => {
    try {
      const res = await api.post(`/reset-password`, formData);

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
    <AuthContext.Provider
      value={{
        token: authState.token,
        isAuthenticated: authState.isAuthenticated,
        loading: authState.loading,
        user: authState.user,
        login,
        register,
        logout,
        checkIfTokenExists,
        forgotPassword,
        resetPassword,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.element,
};

export default function useAuth() {
  return useContext(AuthContext);
}
