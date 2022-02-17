import React from 'react';
import { ActivityIndicator, StyleSheet, View, Platform } from 'react-native';

const LoadingIndicator = () => (
  <View style={[styles.container, styles.horizontal]}>
    <ActivityIndicator size="large" color={Platform.OS === 'ios' ? 'black' : 'primary'} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  horizontal: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 30,
  },
});

export default LoadingIndicator;
