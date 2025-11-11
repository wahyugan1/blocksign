// src/index.js

import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import App from "@/App";
// 👈 Import WalletProvider dari lokasi yang telah ditentukan
import { WalletProvider } from "./lib/WalletContext.jsx"; 

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    {/* 🔑 Bungkus <App /> dengan <WalletProvider> agar state wallet tersedia secara global */}
    <WalletProvider>
      <App />
    </WalletProvider>
  </React.StrictMode>,
);