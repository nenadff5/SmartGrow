import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';

import useAuth from '../context/auth/UseAuth';
import AppStack from './AppStack';
import AuthStack from './AuthStack';

const Routes = () => {
  const { isAuthenticated, checkIfTokenExists } = useAuth();

  useEffect(() => {
    checkIfTokenExists();
  }, [isAuthenticated]);

  return (
    <NavigationContainer>{isAuthenticated ? <AppStack /> : <AuthStack />}</NavigationContainer>
  );
};

export default Routes;
