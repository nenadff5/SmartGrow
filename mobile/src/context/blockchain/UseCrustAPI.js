import PropTypes from 'prop-types';
import React, { createContext, useContext } from 'react';
import Toast from 'react-native-root-toast';
import { useTranslation } from 'react-i18next';

import api from '../../utils/API';

import { ApiPromise, WsProvider } from '@polkadot/api';
import { typesBundleForPolkadot, crustTypes } from '@crustio/type-definitions';

import {Keyring} from '@polkadot/keyring';
import {KeyringPair} from '@polkadot/keyring/types';

const CrustContext = createContext({});

export const CrustProvider = ({ children }) => {
  const { t } = useTranslation();

  const storeOnCrust = async (imageData) => {
    try {

      const api = new ApiPromise({
        provider: new WsProvider(imageData.user.URL),
        typesBundle: typesBundleForPolkadot,
      });

      const crustKeyring = new Keyring({
        type: ‘sr25519’,
      });

      const krpair = crustKeyring.addFromUri(imageData.user.seeds);

      const transaction = api.tx.market.placeStorageOrder(imageData.fileCID, imageData.fileSize, imageData.tip, false);

      const txResult = JSON.parse(JSON.stringify((await sendTx(krpair, transaction))));

      const { message } = JSON.parse(JSON.stringify(txResult));;

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
    <CrustContext.Provider
      value={{
        storeOnCrust,
      }}>
      {children}
    </CrustContext.Provider>
  );
};

CrustProvider.propTypes = {
  children: PropTypes.element,
};

export default function useCrustAPI() {
  return useContext(CrustContext);
}
