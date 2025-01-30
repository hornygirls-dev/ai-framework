import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ChatHeader.module.css';

const ChatHeader = ({ name, avatarUrl }) => {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => navigate('/')}>
          ←
        </button>
        <div className={styles.profile}>
          <span className={styles.name}>{name}</span>
          <img src={avatarUrl} alt={name} className={styles.avatar} />
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;