import React from 'react';
import ReactDOM from 'react-dom/client';
import { Buffer } from 'buffer';

import App from './App';

import './styles/variables.css';
import './index.css';

window.Buffer = Buffer;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
