import React from 'react';
import { Dimensions, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AntDesign } from '@expo/vector-icons';

const { width } = Dimensions.get('screen');

export const commonStyles = StyleSheet.create({
  keyboardAwareScrollViewContainer: {
    backgroundColor: '#f9fafd',
    alignItems: 'center',
  },
  keyboardAwareScrollViewWrapper: {
    flex: 1,
    backgroundColor: '#f9fafd',
  },
  listContainer: {
    flex: 1,
    backgroundColor: '#f9fafd',
    alignItems: 'center',
  },
  paddedListContainer: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  navigationBackBtn: {
    marginLeft: 10,
    padding: 7,
    borderRadius: 20,
    alignItems: 'center',
    backgroundColor: 'rgb(240,240,240)',
  },
  formContainer: {
    width: width * 0.8,
    justifyContent: 'center',
    marginBottom: 15,
  },
  footerContainer: {
    width: width * 0.8,
    alignItems: 'center',
    marginTop: 25,
    marginBottom: 10,
  },
  inputField: {
    borderBottomWidth: 1,
    borderBottomColor: '#e8e8e8',
    marginVertical: 10,
    paddingLeft: 16,
  },
  inputFieldError: { fontSize: 12, color: 'red', alignSelf: 'flex-start', overflow: 'scroll' },
  newEntityBtn: {
    marginTop: 15,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export const NavigationButton = ({ stack, screen = null, params = null }) => {
  const navigation = useNavigation();
  return (
    <TouchableOpacity
      style={commonStyles.navigationBackBtn}
      activeOpacity={0.7}
      onPress={() => navigation.navigate(stack, { screen, params })}>
      <AntDesign name="left" size={24} color="'rgb(44, 187, 116)'" />
    </TouchableOpacity>
  );
};
