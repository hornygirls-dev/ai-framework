import { useState, useCallback, useRef } from 'react';

import { API_URL } from '../constants';

const useChat = (girlName) => {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [currentThreadId, setCurrentThreadId] = useState(null);
  const isInitialized = useRef(false);

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const generateStarterMessage = (name) => {
    const starters = [
      `Hi there! I'm ${name}. I'm excited to chat with you, honey! 😘`,
      `hey! 😘 ${name} here ✌️ what brings you here?`,
      `hi! i'm ${name} 😊 got any fun plans for today?`,
      `heyyy ❤️ ${name} here! love your style btw - where do you usually hang out?`,
      `${name} 👋 what's up? doing anything fun?`,
      `hey cutie :) ${name} here! what's your idea of a perfect date?`,
      `hi! ${name} from your matches 💕 what made you swipe right? 🙈`,
      `hey there!😘 i'm ${name}! what do you like to do for fun?`,
      `${name} here! how's your day going? ✨ any highlights?`,
      `heyy! ${name} 🙈 are you more of a night owl or early bird?`,
    ];
    return starters[Math.floor(Math.random() * starters.length)];
  };

  const addMessage = useCallback((content, isUser = false) => {
    if (!content?.trim()) return; // Пропускаем пустые сообщения

    setMessages((prevMessages) => [
      ...prevMessages,
      {
        id: Date.now(),
        content: content.trim(),
        isUser,
        timestamp: getCurrentTime(),
      },
    ]);
  }, []);

  const initializeChat = useCallback(() => {
    if (isInitialized.current) return Promise.resolve();

    isInitialized.current = true;
    return new Promise((resolve) => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        addMessage(generateStarterMessage(girlName), false);
        resolve();
      }, 1500);
    });
  }, [girlName, addMessage]);

  const sendMessage = async (content) => {
    if (!content?.trim()) return;

    const messageContent = content.trim();
    addMessage(messageContent, true);
    setIsTyping(true);

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageContent,
          thread_id: currentThreadId,
        }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setCurrentThreadId(data.thread_id);

      setTimeout(() => {
        setIsTyping(false);
        addMessage(data.response, false);
      }, 1500);
    } catch (error) {
      console.error('Error sending message:', error);
      setTimeout(() => {
        setIsTyping(false);
        addMessage(
          "Sorry, I'm having trouble responding right now. Please try again later.",
          false
        );
      }, 1500);
    }
  };

  return {
    messages,
    isTyping,
    sendMessage,
    initializeChat,
    addMessage,
  };
};

export default useChat;
