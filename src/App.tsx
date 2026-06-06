import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { MainPage } from './components/MainPage';
import { DecipherPage } from './components/DecipherPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/d/:id" element={<DecipherPage />} />
    </Routes>
  );
}

export default App;