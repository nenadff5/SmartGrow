import PropTypes from 'prop-types';
import React, { createContext, useContext } from 'react';
import Toast from 'react-native-root-toast';
import { useTranslation } from 'react-i18next';

import api from '../../utils/API';

const NearContext = createContext({});

const nearAPI = require("near-api-js");

export const NearProvider = ({ children }) => {
  const { t } = useTranslation();

  const nearAPIhandler = async (userData) => {
    try {

      const { connect } = nearAPI;

      const config = {
        networkId: userData.networkId,
        keyStore: userData.keyStore,
        nodeUrl: userData.nodeUrl,
        walletUrl: userData.walletUrl,
        helperUrl: userData.helperUrl,
        explorerUrl: userData.explorerUrl,
      };
      
      // connect to Near
      const near = await connect(config);

      // new wallet connection
      const wallet = new WalletConnection(near);

      // account
      const account = await near.account(userData.account);

      // get account balance
      // await account.getAccountBalance();

      // get account details
      // await account.getAccountDetails();

      // state of the account
      // const response = await account.state();

      // deploy contract
      const response = await account.deployContract(fs.readFileSync(userData.pathToWasmContract));

      Toast.show(t('common.requestSuccessful', { ns: 'backend' }), {
        duration: Toast.durations.SHORT,
      });

      return response.data;

    } catch (error) {
      Toast.show(t('common.errorOccurred', { ns: 'backend' }), {
        duration: Toast.durations.LONG,
      });
    }
  };

  const signInNear = (wallet, userData) => {
    wallet.requestSignIn({
        contractId: userData.contractId,
        methodNames,
        successUrl,
        failureUrl
    });
  };

  const signOutNear = (wallet) => {
    wallet.signOut();
  };

  return (
    <NearContext.Provider
      value={{
        nearAPIhandler,
        signInNear,
        signOutNear,
      }}>
      {children}
    </NearContext.Provider>
  );
};

NearProvider.propTypes = {
  children: PropTypes.element,
};

export default function useNearAPI() {
  return useContext(NearContext);
}
