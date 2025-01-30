import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './NotFound.module.css';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        <button className={styles.homeButton} onClick={() => navigate('/')}>
          Return to Home
        </button>
      </div>
      <div className={styles.background}>
        <div className={styles.stars}></div>
        <div className={styles.stars}></div>
        <div className={styles.stars}></div>
        <div className={styles.twinkling}></div>
      </div>
    </div>
  );
};

export default NotFound;
