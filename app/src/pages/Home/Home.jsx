import React from 'react';

import { useBanner } from '../../context/BannerContext';

import { GIRLS_DATA } from '../../constants';

import Header from '../../components/Header/Header';
import GirlProfile from '../../components/GirlProfile/GirlProfile';
import PlatformPromo from '../../components/PlatformPromo/PlatformPromo';

import styles from './Home.module.css';

const Home = () => {
  const { setCurrentBannerImage } = useBanner();

  return (
    <>
      <Header />
      <div className={styles.startScreen}>
        {Object.values(GIRLS_DATA).map((girl) => (
          <GirlProfile
            key={girl.name}
            name={girl.name}
            bio={girl.bio}
            imageUrl={girl.imageUrl}
            onVisibilityChange={setCurrentBannerImage}
          />
        ))}
        <PlatformPromo />
      </div>
    </>
  );
};

export default Home;
