import { useState, useRef, useEffect, useCallback } from 'react';

const BACKEND_URL = 'https://backend.funtimewithaisolutions.com';
const FIREBASE_KEY = 'AIzaSyCWTgYvZ7TnYQiVdvJNDysBrzjNojxj2_s';
const PARTNER = 'app101';

export const useCallManager = ({ girlName, onMessage }) => {
  const [isCallVisible, setIsCallVisible] = useState(false);
  const [callCount, setCallCount] = useState(0);
  const callManagerRef = useRef(null);
  const callStateRef = useRef({
    isEnded: false,
    hasError: false,
  });

  const sendMessage = useCallback(
    (message) => {
      if (typeof onMessage === 'function' && message?.trim()) {
        onMessage(message, false);
      }
    },
    [onMessage]
  );

  const resetCallState = useCallback(() => {
    callStateRef.current = {
      isEnded: false,
      hasError: false,
    };
  }, []);

  const initializeCallManager = useCallback(() => {
    try {
      window.BACKEND_URL = BACKEND_URL;
      window.CHARACTER = girlName;
      resetCallState();

      const callbacks = {
        onCallStart: () => {
          console.log('Call started');
          setIsCallVisible(true);
        },
        onCallError: (error) => {
          console.log('Call failed', error);
          if (!callStateRef.current.isEnded && !callStateRef.current.hasError) {
            callStateRef.current.hasError = true;
            sendMessage(`Call failed with ${girlName}. Please try again!`);
            setIsCallVisible(false);
          }
        },
        onHangUp: () => {
          console.log('Call ended');
          if (!callStateRef.current.hasError && !callStateRef.current.isEnded) {
            callStateRef.current.isEnded = true;
            sendMessage(`Call ended with ${girlName}! 😘`);
            setIsCallVisible(false);
          }
        },
        onStatusUpdate: (status) => {
          console.log('Status update:', status);
        },
      };

      //eslint-disable-next-line
      callManagerRef.current = new CallManager(callbacks);
      return true;
    } catch (error) {
      console.error('Error initializing CallManager:', error);
      return false;
    }
  }, [girlName, sendMessage, resetCallState]);

  const startCall = useCallback(
    async (walletAddress) => {
      if (callCount >= 2) {
        sendMessage('You have reached the maximum number of calls allowed.');
        return false;
      }

      try {
        if (initializeCallManager()) {
          setCallCount((prev) => prev + 1);
          sendMessage(`Here's the voice call you requested! 😘`);

          callManagerRef.current.handleCall(
            FIREBASE_KEY,
            PARTNER,
            girlName,
            window.BACKEND_URL
          );
          return true;
        }
        return false;
      } catch (error) {
        console.error('Error starting call:', error);
        sendMessage('Failed to initiate call. Please try again.');
        return false;
      }
    },
    [callCount, girlName, initializeCallManager, sendMessage]
  );

  const endCall = useCallback(() => {
    if (callManagerRef.current) {
      callManagerRef.current.hangUp();
      callManagerRef.current = null;
    }
    setIsCallVisible(false);
  }, []);

  useEffect(() => {
    return () => {
      if (callManagerRef.current) {
        callManagerRef.current.hangUp();
        callManagerRef.current = null;
        setIsCallVisible(false);
      }
    };
  }, []);

  return {
    isCallVisible,
    callCount,
    callManager: callManagerRef.current,
    startCall,
    endCall,
    setIsCallVisible,
  };
};

export default useCallManager;
