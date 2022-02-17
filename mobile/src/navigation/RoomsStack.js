import React from 'react';
import { Platform } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';

import RoomsListScreen from '../screens/App/Rooms/List/RoomsListScreen';
import EditRoomScreen from '../screens/App/Rooms/Edit/EditRoomScreen';
import NewRoomScreen from '../screens/App/Rooms/New/NewRoomScreen';

import { NavigationButton } from '../assets/styles/CommonStyles';

const RoomsStack = createStackNavigator();

function RoomsStackScreen() {
  const { t } = useTranslation();

  return (
    <RoomsStack.Navigator>
      <RoomsStack.Screen
        name="RoomsList"
        component={RoomsListScreen}
        options={{
          title: t('rooms.title', { ns: 'app' }),
          headerTitleAlign: 'center',
          headerStatusBarHeight: Platform.OS === 'ios' ? 20 : null,
        }}
      />
      <RoomsStack.Screen
        name="NewRoom"
        component={NewRoomScreen}
        options={{
          title: t('rooms.newRoom.title', { ns: 'app' }),
          headerTitleAlign: 'center',
          headerStatusBarHeight: Platform.OS === 'ios' ? 20 : null,
          unmountOnBlur: true,
          tabBarButton: () => null,
          headerLeft: () => <NavigationButton stack="Rooms" screen="RoomsList" />,
        }}
      />
      <RoomsStack.Screen
        name="EditRoom"
        component={EditRoomScreen}
        options={{
          title: t('rooms.editRoom.title', { ns: 'app' }),
          headerTitleAlign: 'center',
          headerStatusBarHeight: Platform.OS === 'ios' ? 20 : null,
          unmountOnBlur: true,
          tabBarButton: () => null,
          headerLeft: () => <NavigationButton stack="Rooms" screen="RoomsList" />,
        }}
      />
    </RoomsStack.Navigator>
  );
}

export default RoomsStackScreen;
