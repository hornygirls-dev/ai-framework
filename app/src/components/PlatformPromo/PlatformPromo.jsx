import styles from './PlatformPromo.module.css';

const PlatformPromo = () => (
  <div className={styles.platformContainer}>
    <div className={styles.platformInfo}>
      <h2 className={styles.platformTitle}>Create Your Own AI Model</h2>
      <p className={styles.platformBio}>
        Get your own AI model using HornyGirls.Fun platform with custom features
        and branding
      </p>
      <button
        className={styles.platformButton}
        onClick={() => window.open('https://platform.hornygirls.fun', '_blank')}
      >
        <svg
          className={styles.platformIcon}
          viewBox='0 0 24 24'
          width='24'
          height='24'
        >
          <path
            d='M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
          />
          <path
            d='M12 8v8m-4-4h8'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
          />
        </svg>
        Explore
      </button>
    </div>
  </div>
);

export default PlatformPromo;
