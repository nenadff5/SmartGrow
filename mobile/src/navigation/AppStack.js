import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';

import RoomsStackScreen from './RoomsStack';
import PlantsStackScreen from './PlantsStack';
import ProfileStackScreen from './ProfileStack';

const Tab = createBottomTabNavigator();

const AppStack = () => {
  return (
    <Tab.Navigator
      initialRouteName='Rooms'
      screenOptions={({ route }) => ({
        tabBarHideOnKeyboard: true,
        tabBarIcon: ({ focused }) => {
          if (route.name === 'Plants') {
            return <MaterialIcons name="grass" size={28} color={focused ? 'black' : 'gray'} />;
          }

          if (route.name === 'Rooms') {
            return <MaterialIcons name="apartment" size={28} color={focused ? 'black' : 'gray'} />;
          }

          if (route.name === 'Profile') {
            return <MaterialIcons name="person" size={28} color={focused ? 'black' : 'gray'} />;
          }
        },
        tabBarLabel: () => {
          return null;
        },
      })}>
      <Tab.Screen
        name="Plants"
        component={PlantsStackScreen}
        options={{
          headerShown: false,
          unmountOnBlur: true,
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('Plants', { screen: 'PlantsList' });
          },
        })}
      />
      <Tab.Screen
        name="Rooms"
        component={RoomsStackScreen}
        options={{
          headerShown: false,
          unmountOnBlur: true,
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('Rooms', { screen: 'RoomsList' });
          },
        })}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStackScreen}
        options={{
          headerShown: false,
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('Profile', { screen: 'ProfileScreen' });
          },
        })}
      />
    </Tab.Navigator>
  );
};

export default AppStack;
