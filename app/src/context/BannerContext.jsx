import React, { createContext, useContext, useState, useCallback } from 'react';

import { GIRLS_DATA } from '../constants';

const BannerContext = createContext();

export const BannerProvider = ({ children }) => {
  const [currentBannerGirl, setCurrentBannerGirl] = useState('');
  const [autoChangeEnabled, setAutoChangeEnabled] = useState(true);

  const getRandomGirl = useCallback(() => {
    const girls = Object.values(GIRLS_DATA);
    return girls[Math.floor(Math.random() * girls.length)];
  }, []);

  const setCurrentGirl = useCallback((imageUrl) => {
    setCurrentBannerGirl(imageUrl);
    setAutoChangeEnabled(false);

    setTimeout(() => {
      setAutoChangeEnabled(true);
    }, 5000);
  }, []);

  return (
    <BannerContext.Provider
      value={{
        currentBannerGirl,
        setCurrentBannerGirl: setCurrentGirl,
        autoChangeEnabled,
        getRandomGirl,
      }}
    >
      {children}
    </BannerContext.Provider>
  );
};

export const useBanner = () => {
  const context = useContext(BannerContext);
  if (!context) {
    throw new Error('useBanner must be used within a BannerProvider');
  }
  return context;
};
