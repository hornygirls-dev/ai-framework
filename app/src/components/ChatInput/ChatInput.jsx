import React, { useState } from 'react';
import styles from './ChatInput.module.css';

const ChatInput = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <form className={styles.inputContainer} onSubmit={handleSubmit}>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
        className={styles.input}
      />
      <button 
        type="submit" 
        className={styles.sendButton}
        disabled={!message.trim()}
      >
        ➤
      </button>
    </form>
  );
};

export default ChatInput;