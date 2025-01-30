import React, { useState, useEffect, useRef } from 'react';
import useCallManager from '../../hooks/useCallManager';

import { useWallet } from '../../context/WalletProvider';

import CallScreen from '../CallScreen/CallScreen';

import styles from './PremiumFeatures.module.css';

const CALL_TOKEN_PRICE = 0;

const PremiumFeatures = ({ currentGirl, addMessage, avatarUrl }) => {
  const {
    tokens,
    walletAddress,
    makePayment,
    setTokens,
    setAddMessageCallback,
  } = useWallet();

  const [loading, setLoading] = useState(false);
  const [activeButton, setActiveButton] = useState('');
  const isCallActive = useRef(false);

  // Вспомогательная функция для безопасной отправки сообщений
  const handleMessage = (message, isUser = false) => {
    if (typeof addMessage === 'function' && message?.trim()) {
      addMessage(message, isUser);
    }
  };

  useEffect(() => {
    if (typeof addMessage === 'function') {
      setAddMessageCallback(addMessage);
    }

    return () => {
      if (isCallActive.current) {
        isCallActive.current = false;
      }
    };
  }, [setAddMessageCallback, addMessage]);

  const { isCallVisible, callManager, startCall, endCall, setIsCallVisible } =
    useCallManager({
      girlName: currentGirl,
      onMessage: handleMessage,
    });

  const handleVoiceCall = async () => {
    if (tokens >= CALL_TOKEN_PRICE && walletAddress) {
      try {
        setActiveButton('voice');
        const response = await fetch(
          'https://api.hornygirls.fun/api/use-tokens',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              wallet_address: walletAddress,
              amount: CALL_TOKEN_PRICE,
            }),
          }
        );

        const data = await response.json();
        if (response.ok) {
          setTokens(data.new_balance);
          handleMessage('Звонок начинается...', false);
          isCallActive.current = true;
          await startCall(walletAddress);
        }
      } catch (error) {
        console.error('Error using tokens:', error);
        handleMessage('Failed to initiate call. Please try again.', false);
      } finally {
        setActiveButton('');
      }
    } else if (!walletAddress) {
      handleMessage('Please connect your wallet first', false);
    } else {
      handleMessage(
        'Not enough tokens. You need 30 tokens for voice call.',
        false
      );
    }
  };

  const handleCallEnd = () => {
    if (isCallActive.current) {
      endCall();
      isCallActive.current = false;
    }
  };

  const handlePaymentClick = async () => {
    setLoading(true);
    setActiveButton('payment');
    try {
      await makePayment();
    } catch (error) {
      handleMessage('Payment failed. Please try again.', false);
    } finally {
      setLoading(false);
      setActiveButton('');
    }
  };

  const handlePhotoClick = () => {
    setActiveButton('photo');
    addMessage('Photo feature coming soon! 😘 Stay tuned!', false);
    setTimeout(() => setActiveButton(''), 200);
  };

  const handleVideoClick = () => {
    setActiveButton('video');
    addMessage('Video feature coming soon! 😘 Check back later!', false);
    setTimeout(() => setActiveButton(''), 200);
  };

  return (
    <>
      <div className={styles.container}>
        {/* Кнопки остаются без изменений */}
        <button
          className={`${styles.premiumButton} ${styles.locked} ${
            activeButton === 'photo' ? styles.active : ''
          }`}
          onClick={handlePhotoClick}
          disabled={true}
        >
          <svg className={styles.buttonIcon} viewBox='0 0 24 24'>
            <rect x='2' y='2' width='20' height='20' rx='2' ry='2' />
            <circle cx='12' cy='12' r='3' />
            <path d='M16 5h.01' />
          </svg>
          <span className={styles.buttonText}>Photo</span>
          <span className={styles.buttonCost}>10 tokens</span>
        </button>

        <button
          className={`${styles.premiumButton} ${styles.locked} ${
            activeButton === 'video' ? styles.active : ''
          }`}
          onClick={handleVideoClick}
          disabled={true}
        >
          <svg className={styles.buttonIcon} viewBox='0 0 24 24'>
            <path d='m22 8-6 4 6 4V8Z' />
            <rect x='2' y='6' width='14' height='12' rx='2' ry='2' />
          </svg>
          <span className={styles.buttonText}>Video</span>
          <span className={styles.buttonCost}>120 tokens</span>
        </button>

        <button
          className={`${styles.premiumButton} ${
            activeButton === 'voice' ? styles.active : ''
          }`}
          onClick={handleVoiceCall}
          disabled={loading}
        >
          <svg className={styles.buttonIcon} viewBox='0 0 24 24'>
            <path d='M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z' />
          </svg>
          <span className={styles.buttonText}>Call</span>
          <span className={styles.buttonCost}>30 tokens</span>
        </button>

        <button
          className={`${styles.premiumButton} ${styles.payment} ${
            activeButton === 'payment' ? styles.active : ''
          }`}
          onClick={handlePaymentClick}
          disabled={loading}
        >
          {loading ? (
            <div className={styles.loadingSpinner} />
          ) : (
            <svg className={styles.buttonIcon} viewBox='0 0 24 24'>
              <path d='M20 6H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2z' />
              <path d='M20 6v-2a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v2m16 4h-2a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h2' />
            </svg>
          )}
          <span className={styles.buttonText}>Buy 100 Tokens</span>
          <span className={styles.buttonCost}>0.1 SOL</span>
        </button>
      </div>

      <CallScreen
        isVisible={isCallVisible}
        girlName={currentGirl}
        avatarUrl={avatarUrl}
        onClose={() => {
          setIsCallVisible(false);
          handleCallEnd();
        }}
        onCallEnd={handleCallEnd}
        callManager={callManager}
      />
    </>
  );
};

export default PremiumFeatures;
