import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { EpayRouter } from './epay/EpayRouter';
import './index.css';

const path = window.location.pathname.replace(/\/+$/, "") || "/";
const isPayment = path === "/epay" || path.startsWith("/epay/") || path === "/sa";

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {isPayment ? <EpayRouter /> : <App />}
  </React.StrictMode>,
);
