import React, { useEffect, useRef, useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';

import useChat from '../../hooks/useChat';

import { GIRLS_DATA } from '../../constants';

import Header from '../../components/Header/Header';
import PremiumFeatures from '../../components/PremiumFeatures/PremiumFeatures';
import ChatHeader from '../../components/ChatHeader/ChatHeader';
import ChatMessage, {
  TypingIndicator,
} from '../../components/ChatMessage/ChatMessage';
import ChatInput from '../../components/ChatInput/ChatInput';

import styles from './ChatPage.module.css';

const ChatPage = () => {
  const { girlName } = useParams();
  const girl = GIRLS_DATA[girlName.toLowerCase()];
  const messagesContainerRef = useRef(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const { messages, isTyping, sendMessage, initializeChat, addMessage } =
    useChat(girl.name);

  const scrollToBottom = useCallback((smooth = true) => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      container.scrollTo({
        top: container.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto',
      });
    }
  }, []);

  useEffect(() => {
    const initChat = async () => {
      setIsInitializing(true);
      await initializeChat();
      setIsInitializing(false);
      scrollToBottom(false);
    };

    initChat();
  }, [initializeChat, scrollToBottom]);

  useEffect(() => {
    if (!isInitializing && (messages.length > 0 || isTyping)) {
      scrollToBottom();
    }
  }, [messages, isTyping, isInitializing, scrollToBottom]);

  if (!girl) {
    return <div>Girl not found</div>;
  }

  return (
    <div className={styles.pageContainer}>
      <Header />
      <div className={styles.chatContainer}>
        <ChatHeader name={girl.name} avatarUrl={girl.imageUrl} />
        <div className={styles.messages} ref={messagesContainerRef}>
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              content={message.content}
              isUser={message.isUser}
              timestamp={message.timestamp}
            />
          ))}
          {isTyping && <TypingIndicator />}
        </div>
        <ChatInput onSendMessage={sendMessage} />
        <PremiumFeatures
          currentGirl={girl.name}
          addMessage={addMessage}
          avatarUrl={girl.imageUrl}
        />
      </div>
    </div>
  );
};

export default ChatPage;
