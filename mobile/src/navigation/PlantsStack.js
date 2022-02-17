import React from 'react';
import { Platform } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';

import PlantsListScreen from '../screens/App/Plants/List/PlantsListScreen';
import PlantDetailsScreen from '../screens/App/Plants/Details/PlantDetailsScreen';
import NewPlantScreen from '../screens/App/Plants/New/NewPlantScreen';
import EditPlantScreen from '../screens/App/Plants/Edit/EditPlantScreen';
import PlantNotificationsScreen from '../screens/App/Plants/Notifications/PlantNotificationsScreen';
import PlantNotesScreen from '../screens/App/Plants/Notes/NotesListScreen';

import { NavigationButton } from '../assets/styles/CommonStyles';

const PlantsStack = createStackNavigator();

function PlantsStackScreen({ route }) {
  const plant = route.params?.params?.plant;
  const room = route.params?.params?.room;

  const { t } = useTranslation();

  return (
    <PlantsStack.Navigator>
      <PlantsStack.Screen
        name="PlantsList"
        component={PlantsListScreen}
        options={{
          title: t('plants.title', { ns: 'app' }),
          headerTitleAlign: 'center',
          headerStatusBarHeight: Platform.OS === 'ios' ? 20 : null,
          unmountOnBlur: true,
        }}
      />
      <PlantsStack.Screen
        name="NewPlant"
        component={NewPlantScreen}
        options={() => ({
          title: t('plants.newPlant.title', { ns: 'app' }),
          headerTitleAlign: 'center',
          headerStatusBarHeight: Platform.OS === 'ios' ? 20 : null,
          unmountOnBlur: true,
          tabBarButton: () => null,
          headerLeft: () => <NavigationButton stack="Plants" screen="PlantsList" />,
        })}
      />
      <PlantsStack.Screen
        name="PlantDetails"
        component={PlantDetailsScreen}
        options={() => ({
          title: t('plants.plantDetails.title', { ns: 'app' }),
          headerTitleAlign: 'center',
          headerStatusBarHeight: Platform.OS === 'ios' ? 20 : null,
          unmountOnBlur: true,
          tabBarButton: () => null,
          headerLeft: () => <NavigationButton stack="Plants" screen="PlantsList" />,
        })}
      />
      <PlantsStack.Screen
        name="EditPlant"
        component={EditPlantScreen}
        options={() => ({
          title: t('plants.editPlant.title', { ns: 'app' }),
          headerTitleAlign: 'center',
          headerStatusBarHeight: Platform.OS === 'ios' ? 20 : null,
          unmountOnBlur: true,
          tabBarButton: () => null,
          headerLeft: () => (
            <NavigationButton
              stack="Plants"
              screen="PlantDetails"
              params={{
                plant,
                room,
              }}
            />
          ),
        })}
      />
      <PlantsStack.Screen
        name="PlantNotifications"
        component={PlantNotificationsScreen}
        options={() => ({
          title: t('plants.notifications.title', { ns: 'app' }),
          headerTitleAlign: 'center',
          headerStatusBarHeight: Platform.OS === 'ios' ? 20 : null,
          unmountOnBlur: true,
          tabBarButton: () => null,
          headerLeft: () => (
            <NavigationButton
              stack="Plants"
              screen="PlantDetails"
              params={{
                plant,
                room,
              }}
            />
          ),
        })}
      />
      <PlantsStack.Screen
        name="PlantNotes"
        component={PlantNotesScreen}
        options={() => ({
          title: t('plants.notes.title', { ns: 'app' }),
          headerTitleAlign: 'center',
          headerStatusBarHeight: Platform.OS === 'ios' ? 20 : null,
          unmountOnBlur: true,
          tabBarButton: () => null,
          headerLeft: () => (
            <NavigationButton
              stack="Plants"
              screen="PlantDetails"
              params={{
                plant,
                room,
              }}
            />
          ),
        })}
      />
    </PlantsStack.Navigator>
  );
}

export default PlantsStackScreen;
