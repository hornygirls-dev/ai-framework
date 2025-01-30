import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { WalletProvider } from './context/WalletProvider';
import { BannerProvider } from './context/BannerContext';

import Home from './pages/Home/Home';
import ChatPage from './pages/ChatPage/ChatPage';
import NotFound from './pages/NotFound/NotFound';

import Layout from './components/Layout/Layout';

const App = () => {
  return (
    <WalletProvider>
      <BannerProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path='/' element={<Home />} />
              <Route path='/chat/:girlName' element={<ChatPage />} />
              <Route path='*' element={<NotFound />} />
            </Routes>
          </Layout>
        </Router>
      </BannerProvider>
    </WalletProvider>
  );
};

export default App;
