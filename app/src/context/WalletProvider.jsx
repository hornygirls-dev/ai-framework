import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  useEffect,
} from 'react';

import { API_URL } from '../constants';

import { createTransactionUrl, isIOS, isMobileDevice } from '../utils/helpers';

// Конфигурация кошелька
const WALLET_CONFIG = {
  PHANTOM_DOWNLOAD_URL: 'https://phantom.app/',
  PHANTOM_CONNECT_BASE_URL: 'https://phantom.app/ul/v1/connect',
  DEFAULT_RPC_URL:
    'https://mainnet.helius-rpc.com/?api-key=aa666260-8207-4fe9-a4e5-4b79d4d32326',
  RECEIVER_PUBLIC_KEY: 'FAd23rt5wRFkN3oysrSZc1NMQgFtEjiVa1qBd8AfGy4M',
  SOL_TRANSFER_AMOUNT: 0.1,
  CONFIRMATION_TYPE: 'confirmed',
  BLOCKHASH_TYPE: 'finalized',
};

// API эндпоинты
const API_ENDPOINTS = {
  BALANCE: (address) => `${API_URL}/api/balance/${address}`,
  CONNECT: `${API_URL}/api/connect`,
  VERIFY_PAYMENT: `${API_URL}/api/verify-payment`,
};

// Параметры мобильного подключения
const MOBILE_CONFIG = {
  APP_URL: 'https://hornygirls.fun',
  REDIRECT_URL: 'https://hornygirls.fun/callback',
  CLUSTER: 'mainnet-beta',
  DEEP_LINK_TIMEOUT: 2000,
};

// Сообщения для пользователя
const USER_MESSAGES = {
  INSTALL_PHANTOM: 'Пожалуйста, установите кошелек Phantom',
  PAYMENT_SUCCESS: 'Платеж успешен! Добавлено 100 токенов на ваш баланс.',
  CONNECT_ERROR: 'Ошибка подключения кошелька',
  PAYMENT_ERROR: 'Ошибка платежа. Пожалуйста, попробуйте снова.',
  DISCONNECT_ERROR: 'Ошибка при отключении кошелька',
  BALANCE_ERROR: 'Ошибка при получении баланса',
};

// Начальное состояние
const INITIAL_STATE = {
  walletAddress: null,
  tokens: 0,
  isInitialized: false,
};

const WalletContext = createContext();

const usePhantomProvider = () => {
  return window?.phantom?.solana;
};

export const WalletProvider = ({ children }) => {
  const [state, setState] = useState(INITIAL_STATE);
  const provider = usePhantomProvider();
  const [messageCallback, setMessageCallback] = useState(null);

  const handleError = useCallback(
    (error, customMessage) => {
      console.error(customMessage || 'Wallet error:', error);
      if (messageCallback) {
        messageCallback(error.message || customMessage, false);
      }
    },
    [messageCallback]
  );

  const updateTokenBalance = useCallback(
    async (address) => {
      try {
        const { balance } = await fetch(API_ENDPOINTS.BALANCE(address)).then(
          (res) => res.json()
        );
        setState((prev) => ({ ...prev, tokens: balance }));
      } catch (error) {
        handleError(error, USER_MESSAGES.BALANCE_ERROR);
      }
    },
    [handleError]
  );

  const checkPhantomWallet = useCallback(() => {
    if (!provider) {
      if (messageCallback) {
        messageCallback(USER_MESSAGES.INSTALL_PHANTOM, false);
      }
      window.open(WALLET_CONFIG.PHANTOM_DOWNLOAD_URL, '_blank');
      return false;
    }
    return provider.isPhantom;
  }, [provider, messageCallback]);

  const handleMobileConnection = useCallback(() => {
    const params = new URLSearchParams({
      app_url: MOBILE_CONFIG.APP_URL,
      dapp_encryption_public_key: WALLET_CONFIG.RECEIVER_PUBLIC_KEY,
      redirect_link: MOBILE_CONFIG.REDIRECT_URL,
      cluster: MOBILE_CONFIG.CLUSTER,
    });
    window.location.href = `${WALLET_CONFIG.PHANTOM_CONNECT_BASE_URL}?${params}`;
  }, []);

  const connectWallet = useCallback(async () => {
    try {
      if (isMobileDevice()) {
        handleMobileConnection();
        return;
      }

      if (!checkPhantomWallet()) return;

      const resp = await provider.connect();
      const address = resp.publicKey.toString();

      setState((prev) => ({ ...prev, walletAddress: address }));
      await updateTokenBalance(address);

      await fetch(API_ENDPOINTS.CONNECT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet_address: address }),
      });

      if (messageCallback) {
        messageCallback('Кошелек успешно подключен!', false);
      }
    } catch (error) {
      handleError(error, USER_MESSAGES.CONNECT_ERROR);
    }
  }, [
    provider,
    checkPhantomWallet,
    updateTokenBalance,
    handleError,
    handleMobileConnection,
    messageCallback,
  ]);

  const makePayment = useCallback(async () => {
    try {
      if (!state.walletAddress) {
        if (isMobileDevice()) {
          const transactionUrl = createTransactionUrl(
            WALLET_CONFIG.SOL_TRANSFER_AMOUNT,
            WALLET_CONFIG.RECEIVER_PUBLIC_KEY
          );

          if (isIOS()) {
            window.location.href = transactionUrl;
          } else {
            const start = Date.now();
            window.location.href = transactionUrl;
            setTimeout(() => {
              if (
                !document.hidden &&
                !document.webkitHidden &&
                Date.now() - start <= MOBILE_CONFIG.DEEP_LINK_TIMEOUT
              ) {
                window.location.href = WALLET_CONFIG.PHANTOM_DOWNLOAD_URL;
              }
            }, MOBILE_CONFIG.DEEP_LINK_TIMEOUT);
          }
          return;
        }
        await connectWallet();
        return;
      }

      const connection = new window.solanaWeb3.Connection(
        WALLET_CONFIG.DEFAULT_RPC_URL,
        WALLET_CONFIG.CONFIRMATION_TYPE
      );

      const senderPublicKey = new window.solanaWeb3.PublicKey(
        state.walletAddress
      );
      const receiverPublicKey = new window.solanaWeb3.PublicKey(
        WALLET_CONFIG.RECEIVER_PUBLIC_KEY
      );

      if (messageCallback) {
        messageCallback('Подтвердите транзакцию в кошельке...', false);
      }

      const transaction = new window.solanaWeb3.Transaction().add(
        window.solanaWeb3.SystemProgram.transfer({
          fromPubkey: senderPublicKey,
          toPubkey: receiverPublicKey,
          lamports:
            window.solanaWeb3.LAMPORTS_PER_SOL *
            WALLET_CONFIG.SOL_TRANSFER_AMOUNT,
        })
      );

      const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash(WALLET_CONFIG.BLOCKHASH_TYPE);

      transaction.recentBlockhash = blockhash;
      transaction.feePayer = senderPublicKey;

      const signed = await provider.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signed.serialize());
      const confirmation = await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      });

      if (confirmation.value.err) {
        throw new Error(
          'Transaction failed: ' + confirmation.value.err.toString()
        );
      }

      await fetch(API_ENDPOINTS.VERIFY_PAYMENT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet_address: state.walletAddress }),
      });

      await updateTokenBalance(state.walletAddress);

      if (messageCallback) {
        messageCallback(USER_MESSAGES.PAYMENT_SUCCESS, false);
      }
    } catch (error) {
      handleError(error, USER_MESSAGES.PAYMENT_ERROR);
    }
  }, [
    state.walletAddress,
    provider,
    connectWallet,
    updateTokenBalance,
    handleError,
    messageCallback,
  ]);

  const disconnectWallet = useCallback(async () => {
    try {
      if (provider) {
        await provider.disconnect();
        setState((prev) => ({ ...prev, walletAddress: null, tokens: 0 }));
        if (messageCallback) {
          messageCallback('Кошелек отключен', false);
        }
      }
    } catch (error) {
      handleError(error, USER_MESSAGES.DISCONNECT_ERROR);
    }
  }, [provider, handleError, messageCallback]);

  // Подписка на события кошелька
  useEffect(() => {
    if (provider && !state.isInitialized) {
      if (provider.isConnected && provider.publicKey) {
        const address = provider.publicKey.toString();
        setState((prev) => ({ ...prev, walletAddress: address }));
        updateTokenBalance(address);
      }

      const handleConnect = (publicKey) => {
        const address = publicKey.toString();
        setState((prev) => ({ ...prev, walletAddress: address }));
        updateTokenBalance(address);
      };

      const handleDisconnect = () => {
        setState((prev) => ({ ...prev, walletAddress: null, tokens: 0 }));
      };

      const handleAccountChange = (publicKey) => {
        if (publicKey) {
          const address = publicKey.toString();
          setState((prev) => ({ ...prev, walletAddress: address }));
          updateTokenBalance(address);
        } else {
          setState((prev) => ({ ...prev, walletAddress: null, tokens: 0 }));
        }
      };

      provider.on('connect', handleConnect);
      provider.on('disconnect', handleDisconnect);
      provider.on('accountChanged', handleAccountChange);

      setState((prev) => ({ ...prev, isInitialized: true }));

      return () => {
        provider.removeListener('connect', handleConnect);
        provider.removeListener('disconnect', handleDisconnect);
        provider.removeListener('accountChanged', handleAccountChange);
      };
    }
  }, [provider, state.isInitialized, updateTokenBalance]);

  return (
    <WalletContext.Provider
      value={{
        walletAddress: state.walletAddress,
        tokens: state.tokens,
        connectWallet,
        disconnectWallet,
        updateTokenBalance,
        makePayment,
        setTokens: (tokens) => setState((prev) => ({ ...prev, tokens })),
        isWalletAvailable: checkPhantomWallet,
        setAddMessageCallback: setMessageCallback,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
};
