import React, { Suspense } from 'react';
import { I18nextProvider } from 'react-i18next';
import { RootSiblingParent } from 'react-native-root-siblings';

import './src/utils/i18n';
import { AuthProvider } from './src/context/auth/UseAuth';
import { RoomsProvider } from './src/context/rooms/UseRoomsAPI';
import { PlantsProvider } from './src/context/plants/UsePlantsAPI';
import { NotesProvider } from './src/context/plants/UseNotesAPI';
import { ProfileProvider } from './src/context/profile/UseProfileAPI';
import { StatisticsProvider } from './src/context/statistics/UseStatisticsAPI';
import Routes from './src/navigation/Routes';

export default function App() {
  return (
    <Suspense fallback={null}>
      <I18nextProvider>
        <AuthProvider>
          <ProfileProvider>
            <StatisticsProvider>
              <RoomsProvider>
                <PlantsProvider>
                  <NotesProvider>
                    <RootSiblingParent>
                      <Routes />
                    </RootSiblingParent>
                  </NotesProvider>
                </PlantsProvider>
              </RoomsProvider>
            </StatisticsProvider>
          </ProfileProvider>
        </AuthProvider>
      </I18nextProvider>
    </Suspense>
  );
}
