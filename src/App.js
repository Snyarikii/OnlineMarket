import React from 'react';
import {BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import Login from "./pages/Login/Login";
import LandingPage from './pages/Landingpage/Landingpage';
import ResetPassword from './pages/ResetPassword/ResetPassword';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<LandingPage />} />
        <Route path='/Login' element={<Login />} />
        <Route path='/ResetPassword' element={<ResetPassword />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
