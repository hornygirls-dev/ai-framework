import React, { useEffect } from 'react';

import { useWallet } from '../../context/WalletProvider';

import SideBanners from '../SideBanners/SideBanners';

import styles from './Layout.module.css';

const Layout = ({ children }) => {
  const { connectWallet } = useWallet();

  useEffect(() => {
    if (window.solana?.isPhantom && window.solana.isConnected) {
      connectWallet();
    }
    //eslint-disable-next-line
  }, []);

  return (
    <div className={styles.gradientBg}>
      <div className={styles.liquidShape}></div>
      <SideBanners />
      <div className={styles.appContainer}>{children}</div>
    </div>
  );
};

export default Layout;
