export const getCurrentTime = () => {
  return new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

export const isIOS = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

export const createTransactionUrl = (amountSOL, recipient) => {
  const baseUrl = isIOS()
    ? 'https://phantom.app/ul/v1/transfer'
    : 'phantom://ul/v1/transfer';

  return `${baseUrl}?recipient=${recipient}&amount=${amountSOL}&token=SOL`;
};
