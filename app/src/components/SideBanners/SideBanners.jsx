import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useBanner } from '../../context/BannerContext';
import styles from './SideBanners.module.css';

const SideBanners = () => {
  const { currentBannerGirl, autoChangeEnabled, getRandomGirl } = useBanner();
  const [displayedGirl, setDisplayedGirl] = useState(currentBannerGirl);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const updateRandomGirl = useCallback(() => {
    if (autoChangeEnabled) {
      setIsTransitioning(true);
      setTimeout(() => {
        setDisplayedGirl(getRandomGirl());
        setIsTransitioning(false);
      }, 300); // Время должно совпадать с длительностью CSS-анимации
    }
  }, [autoChangeEnabled, getRandomGirl]);

  useEffect(() => {
    if (!autoChangeEnabled) {
      setDisplayedGirl(currentBannerGirl);
      return;
    }

    updateRandomGirl();
    const interval = setInterval(updateRandomGirl, 5000);
    return () => clearInterval(interval);
  }, [autoChangeEnabled, currentBannerGirl, updateRandomGirl]);

  return (
    <div className={styles.sideBannersContainer}>
      <div className={styles.sideBanner + ' ' + styles.left}>
        <Link to={`/chat/${displayedGirl?.name?.toLowerCase()}`}>
          <img
            className={`${styles.bannerImage} ${isTransitioning ? styles.fadeOut : styles.fadeIn}`}
            src={displayedGirl.imageUrl || 'https://pbs.twimg.com/profile_images/1867301246757199872/vWwDbHVw_400x400.jpg'}
            alt='Left Banner'
          />
        </Link>
      </div>
      <div className={styles.sideBanner + ' ' + styles.right}>
        <Link to={`/chat/${displayedGirl?.name?.toLowerCase()}`}>
          <img
            className={`${styles.bannerImage} ${isTransitioning ? styles.fadeOut : styles.fadeIn}`}
            src={displayedGirl.imageUrl || 'https://pbs.twimg.com/profile_images/1867301246757199872/vWwDbHVw_400x400.jpg'}
            alt='Right Banner'
          />
        </Link>
      </div>
    </div>
  );
};

export default SideBanners;