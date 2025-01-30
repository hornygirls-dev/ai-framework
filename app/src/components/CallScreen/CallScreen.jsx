import React, { useState, useEffect, useCallback } from 'react';
import styles from './CallScreen.module.css';

const CallScreen = ({ 
  isVisible, 
  girlName, 
  avatarUrl, 
  onClose, 
  onCallEnd,
  callManager 
}) => {
  const [timer, setTimer] = useState('00:00');
  const [status, setStatus] = useState('Connecting...');
  const [conversationText, setConversationText] = useState('');

  useEffect(() => {
    if (isVisible) {
      // Очищаем текст разговора при начале нового звонка
      setConversationText('');
      
      // Сбрасываем статус
      setStatus('Connecting...');
      
      // Запускаем таймер
      const startTime = Date.now();
      const timerInterval = setInterval(() => {
        const seconds = Math.floor((Date.now() - startTime) / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        setTimer(
          `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
        );
      }, 1000);

      return () => {
        clearInterval(timerInterval);
      };
    }
  }, [isVisible]);

  const handleEndCall = () => {
    if (callManager) {
      callManager.hangUp();
    }
    onCallEnd?.();
    onClose?.();
  };

  if (!isVisible) return null;

  return (
    <div className={styles.callScreen}>
      <div className={styles.callContainer}>
        <div className={styles.avatarContainer}>
          <div className={styles.avatarRing}></div>
          <div className={styles.avatarRing}></div>
          <div className={styles.avatarRing}></div>
          <img src={avatarUrl} alt={girlName} className={styles.avatar} />
        </div>
        <div className={styles.callInfo}>
          <h2 className={styles.name}>{girlName}</h2>
          <p className={styles.status}>{status}</p>
          <p className={styles.timer}>{timer}</p>
          <div id="conversation-inner" className={styles.conversationInner}>
            {conversationText}
          </div>
        </div>
        <button className={styles.endCallButton} onClick={handleEndCall}>
          <svg className={styles.endCallIcon} viewBox="0 0 24 24">
            <path 
              d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
              transform="rotate(135, 12, 12)"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default CallScreen;