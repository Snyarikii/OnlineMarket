import React from 'react';
import {BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import Login from "./pages/Login/Login";
import LandingPage from './pages/Landingpage/Landingpage';
import ResetPassword from './pages/ResetPassword/ResetPassword';
import SignUp from './pages/SignUp/SignUp';
import Index from './pages/Index/Index';
import Dashboard from './pages/Dashboard/Dashboard';
import AdminLayout from './components/AdminLayout/AdminLayout';
import ManageCategories from './pages/Admin/ManageCategories';
import ManageUsers from './pages/Admin/ManageUsers';
import AddProduct from './pages/AddProduct/AddProduct';
import ManageProducts from './pages/Admin/ManageProducts';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<LandingPage />} />
        <Route path='/Login' element={<Login />} />
        <Route path='/ResetPassword' element={<ResetPassword />} />
        <Route path='/SignUp' element={<SignUp />} />
        <Route path='/Index' element={<Index />} />
        <Route path='/Dashboard' element={<Dashboard />} />
        <Route path="/add-product" element={<AddProduct />} />
        <Route path='/Admin' element={<AdminLayout />}>
          <Route path='ManageCategories' element={<ManageCategories />} />
          <Route path='ManageUsers' element={<ManageUsers />} />
          <Route path='ManageProducts' element={<ManageProducts />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
