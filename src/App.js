import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/components/ThemeProvider';
import Layout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import CreateContract from '@/pages/CreateContract';
import VerifyContract from '@/pages/VerifyContract';
import ContractHistory from '@/pages/ContractHistory';
import { Toaster } from '@/components/ui/sonner';
import '@/App.css';

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="blockchain-theme">
      <BrowserRouter>
        <Toaster position="bottom-center" />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="create" element={<CreateContract />} />
            <Route path="verify" element={<VerifyContract />} />
            <Route path="history" element={<ContractHistory />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
