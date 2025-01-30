import React from 'react';
import { Link } from 'react-router-dom';
import styles from './GirlProfile.module.css';

const GirlProfile = ({ name, bio, imageUrl }) => {
  return (
    <div className={styles.girlProfile}>
      <img src={imageUrl} alt={name} className={styles.profileAvatar} />
      <div className={styles.profileName}>{name}</div>
      <div className={styles.profileBio}>{bio}</div>
      <Link to={`/chat/${name.toLowerCase()}`} className={styles.chatButton}>
        Chat with {name}
      </Link>
    </div>
  );
};

export default GirlProfile;
