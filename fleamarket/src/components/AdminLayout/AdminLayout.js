import React, { useEffect, useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import './AdminLayout.css';


const AdminLayout = ({ setUser, setLoggingOut }) => {
    const navigate = useNavigate();

    function LogOut() {
        const confirmLogout = window.confirm("Are you sure you want to log out?");
        if(!confirmLogout) return;

        setLoggingOut(true);
        
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        navigate('/');

        setTimeout(() => {
            setLoggingOut(false);
        }, 500);
    }


    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <h2>Admin Panel</h2>
                <nav>
                    <ul>
                        <li><Link to="ManageCategories">Manage Categories</Link></li>
                        <li><Link to="ManageProducts">Manage Products</Link></li>
                        <li><Link to="ManageUsers">Manage Users</Link></li>
                        <li><Link to="TransactionStats">Statistics</Link></li>
                        <li><a onClick={LogOut}>Log Out</a></li>
                    </ul>
                </nav>
            </aside>

            <main className="admin-content">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
