import React from 'react';

import { useWallet } from '../../context/WalletProvider';

import styles from './Header.module.css';

const Header = () => {
  const { walletAddress, tokens, connectWallet } = useWallet();

  const displayAddress = walletAddress 
    ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`
    : 'Wallet';

  return (
    <div className={styles.header}>
      <h1>The Hottest AI girls</h1>
      <div 
        className={`${styles.walletStatus} ${walletAddress ? styles.connected : ''}`}
        onClick={connectWallet}
      >
        {displayAddress}
      </div>
      <div className={styles.tokenDisplay}>
        Tokens: <span>{tokens}</span>
      </div>
    </div>
  );
};

export default Header;