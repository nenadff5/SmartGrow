import PropTypes from 'prop-types';
import React, { createContext, useContext } from 'react';
import Toast from 'react-native-root-toast';
import { useTranslation } from 'react-i18next';
import { Wallet, Chain, Network } from 'mintbase';

import api from '../../utils/API';

const MintbaseContext = createContext({});

const FETCH_MINTER_STORE = gql`
  query FetchMinterStores($minter: String!) {
    store(where: { minters: { account: { _eq: $minter } } }) {
      id
    }
  }
`

export const MintbaseProvider = ({ children }) => {
  const { t } = useTranslation();

  // Connect to Mintbase and mint
  const connectMintbaseAndMint = async connect() => {
    try {
      const { data: walletData, error } = await new Wallet().init({
        networkName: Network.testnet,
        chain: Chain.near,
        apiKey: API_KEY,
      });

      const { wallet, isConnected } = walletData;
      const [mintImage, setMintImage] = useState<File | null>(null);
      const [isMinting, setIsMinting] = useState<boolean>(false);

      if (isConnected) {
        const { data: details } = await wallet.details();

        useEffect(() => {
          if (!isConnected) return
            fetchStores()
        }, [isConnected]);

        const handleMintImage = (e: any) => {
          const file = e.target.files[0]
          setMintImage(file)
        };

        // Wallet and image
        if (!wallet || !wallet.minter) return;
        if (!mintImage) return;

        // Start minting
        setIsMinting(true);

        const { data: fileUploadResult, error: fileError } = {
          await wallet.minter.uploadField(MetadataField.Media, mintImage);
          return;
        };

        // Add metadata
        wallet.minter.setMetadata({
          title: data.title,
          description: data.description,
        });

        setIsMinting(false);

        // Mint
        wallet.mint(1, data.store, undefined, undefined, undefined);

        const { message } = res.data;

        Toast.show(t(message ?? 'common.requestSuccessful', { ns: 'backend' }), {
          duration: Toast.durations.SHORT,
        });

        return res.data;
      }
    } catch (error) {
      Toast.show(t('common.errorOccurred', { ns: 'backend' }), {
        duration: Toast.durations.LONG,
      });
    };
  };

  return (
    <MintbaseContext.Provider
      value={{
        connectMintbase,
      }}>
      {children}
    </MintbaseContext.Provider>
  );
};

MintbaseProvider.propTypes = {
  children: PropTypes.element,
};

export default function useProfileAPI() {
  return useContext(MintbaseContext);
}
