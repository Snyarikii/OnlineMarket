import React from 'react';
import {BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import Login from "./pages/Login/Login";
import LandingPage from './pages/Landingpage/Landingpage';
import ResetPassword from './pages/ResetPassword/ResetPassword';
import SignUp from './pages/SignUp/SignUp';
import Index from './pages/Index/Index';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<LandingPage />} />
        <Route path='/Login' element={<Login />} />
        <Route path='/ResetPassword' element={<ResetPassword />} />
        <Route path='/SignUp' element={<SignUp />} />
        <Route path='/Index' element={<Index />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
