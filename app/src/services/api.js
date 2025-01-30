import { API_URL } from "../constants";


// Создаем базовую функцию для запросов
const fetchApi = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const sendMessage = (message, threadId = null) => {
  return fetchApi('/chat', {
    method: 'POST',
    body: JSON.stringify({ message, thread_id: threadId }),
  });
};

export const spendTokens = (walletAddress, amount) => {
  return fetchApi('/api/use-tokens', {
    method: 'POST',
    body: JSON.stringify({
      wallet_address: walletAddress,
      amount,
    }),
  });
};

export const getTokenBalance = (walletAddress) => {
  return fetchApi(`/api/balance/${walletAddress}`);
};

export const createPayment = (walletAddress, amount) => {
  return fetchApi('/api/create-payment', {
    method: 'POST',
    body: JSON.stringify({
      wallet_address: walletAddress,
      amount,
    }),
  });
};

const apiService = {
  sendMessage,
  spendTokens,
  getTokenBalance,
  createPayment,
};

export default apiService;
