import React from 'react';
import styles from './ChatMessage.module.css';

const ChatMessage = ({ content, isUser, timestamp }) => {
  return (
    <div
      className={`${styles.message} ${
        isUser ? styles.userMessage : styles.aiMessage
      }`}
    >
      <div className={styles.messageBubble}>{content}</div>
      <div className={styles.messageTime}>{timestamp}</div>
    </div>
  );
};

export const TypingIndicator = () => (
  <div className={`${styles.message} ${styles.aiMessage}`}>
    <div className={`${styles.messageBubble} ${styles.typingIndicator}`}>
      <span></span>
      <span></span>
      <span></span>
    </div>
  </div>
);

export default ChatMessage;
