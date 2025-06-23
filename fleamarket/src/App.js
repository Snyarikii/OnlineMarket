import React, { useState, useEffect } from 'react';
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
import ProductDetails from './pages/buying/ProductDetails'; // <-- IMPORT FROM THE NEW PATH
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import Cart from './pages/Cart/Cart';


function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if(token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error('Invalid user data in localstorage');
      }
    } else {
      console.log("No token or user found in localstorage");
    }
    setLoading(false);
  }, []);

  if (loading) return <div>Loading...</div>

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<LandingPage />} />
        <Route path='/Login' element={<Login setUser={setUser} />} />
        <Route path='/ResetPassword' element={<ResetPassword />} />
        <Route path='/SignUp' element={<SignUp />} />

        <Route path='/Index' element={<ProtectedRoute allowedRoles={['buyer']} user={user} loggingOut={loggingOut}> <Index setUser={setUser} setLoggingOut={setLoggingOut}/> </ProtectedRoute>} />
        <Route path='/Cart' element={<Cart />} />
        <Route path='/Dashboard' element={<ProtectedRoute allowedRoles={['seller']} user={user} loggingOut={loggingOut}><Dashboard setUser={setUser} setLoggingOut={setLoggingOut}/> </ProtectedRoute>} />
        <Route path="/add-product" element={<ProtectedRoute allowedRoles={['seller']} user={user} loggingOut={loggingOut}><AddProduct setUser={setUser} setLoggingOut={setLoggingOut}/> </ProtectedRoute>} />
        <Route path='/Admin' element={<ProtectedRoute allowedRoles={['admin']} user={user} loggingOut={loggingOut}><AdminLayout setUser={setUser} setLoggingOut={setLoggingOut}/> </ProtectedRoute>}>
          <Route path='ManageCategories' element={<ManageCategories />} />
          <Route path='ManageUsers' element={<ManageUsers />} />
          <Route path='ManageProducts' element={<ManageProducts />} />
        </Route>
        <Route path="/product/:productId" element={<ProtectedRoute allowedRoles={['buyer']} user={user}><ProductDetails /> </ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
