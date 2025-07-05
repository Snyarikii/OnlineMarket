import React, { useEffect, useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './AdminLayout.css';
import logo from '../../assets/logo2.png';

const AdminLayout = ({ setUser, setLoggingOut }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [userName, setUserName] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/Login');
            return;
        }

        const fetchAdminData = async () => {
            try {
                const res = await axios.get('http://localhost:3001/api/user/me', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUserName(res.data.name);
            } catch (err) {
                console.error("Failed to fetch admin name", err);
            }
        };
        fetchAdminData();
    }, [navigate]);

    //Log out function
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

    const isActive = (path) => location.pathname.includes(path);

    return (
        <div className="admin-page-body">
            <header className="marketplace-header">
                <Link to="/Admin" className="header-logo-link">
                    <img src={logo} alt="Flea Market Logo" className="header-logo-img" />
                    <span className="header-logo-text">Flea Market</span>
                </Link>
                <div className="header-admin-info">
                    {userName && <span className="user-greeting">Welcome, {userName.split(' ')[0]}</span>}
                    <a onClick={LogOut} className="logout-link">Log Out</a>
                </div>
            </header>
            
            <div className="admin-layout-container">
                <aside className="admin-sidebar">
                    <h3>Admin Menu</h3>
                    <nav className="admin-nav">
                        <Link to="/Admin" className={location.pathname === '/Admin' ? 'active' : ''}>Dashboard</Link>
                        <Link to="/Admin/ManageCategories" className={isActive('/Admin/ManageCategories') ? 'active' : ''}>Manage Categories</Link>
                        <Link to="/Admin/ManageProducts" className={isActive('/Admin/ManageProducts') ? 'active' : ''}>Manage Products</Link>
                        <Link to="/Admin/ManageUsers" className={isActive('/Admin/ManageUsers') ? 'active' : ''}>Manage Users</Link>
                        <Link to="/Admin/TransactionStats" className={isActive('/Admin/TransactionStats') ? 'active' : ''}>Statistics</Link>
                    </nav>
                </aside>

                <main className="admin-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
