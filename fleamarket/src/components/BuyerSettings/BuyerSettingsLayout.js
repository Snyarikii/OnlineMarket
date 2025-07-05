import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './BuyerSettings.css'; // This will be the updated CSS file
import logo from '../../assets/logo2.png'; // Import the logo

const BuyerSettingsLayout = ({ setUser, setLoggingOut }) => {
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const [userName, setUserName] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/Login');
            return;
        }

        // Fetch user's name for the greeting
        const fetchUserData = async () => {
            try {
                const res = await axios.get('http://localhost:3001/api/user/me', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUserName(res.data.name);
            } catch (err) {
                console.error("Failed to fetch user name", err);
            }
        };
        fetchUserData();
    }, [navigate]);

    // Logout function
    function LogOut() {
        const confirmLogout = window.confirm("Are you sure you want to log out?");
        if (!confirmLogout) return;

        if (setLoggingOut && setUser) {
            setLoggingOut(true);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
            setTimeout(() => setLoggingOut(false), 500);
        } else {
            localStorage.clear();
        }
        navigate('/');
    }

    // Helper to determine if a link is active
    const isActive = (path) => pathname === path;

    return (
        <div className="settings-page-body">
            {/* Standardized Header */}
            <header className="marketplace-header">
                <Link to="/Index" className="header-logo-link">
                    <img src={logo} alt="Flea Market Logo" className="header-logo-img" />
                    <span className="header-logo-text">Flea Market</span>
                </Link>
                <nav className="header-nav-links">
                    {userName && <span className="user-greeting">Hi, {userName.split(' ')[0]}</span>}
                    <Link to="/Index">Shop</Link>
                    <Link to="/orders">My Orders</Link>
                    <a onClick={LogOut} className="logout-link">Log Out</a>
                </nav>
            </header>

            <main className="settings-main">
                <div className="settings-layout-container">
                    <header className="settings-layout-header">
                        <h1>Account Settings</h1>
                        <nav className="settings-layout-nav">
                            <Link 
                                to="/BuyerSettings" 
                                className={isActive('/BuyerSettings') ? 'active' : ''}
                            >
                                My Account
                            </Link>
                            <Link 
                                to="/BuyerSettings/BuyerShippingInfo" 
                                className={isActive('/BuyerSettings/BuyerShippingInfo') ? 'active' : ''}
                            >
                                My Delivery Info
                            </Link>
                        </nav>
                    </header>
                    <div className="settings-content">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default BuyerSettingsLayout;
