import React, {useEffect, useState} from "react";
import { Link, useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = ({ setUser, setLoggingOut }) => {
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
    };

    return(
        <div className="dashboard-body">
            <header className="dashboard-header">
                <h1 className="dashboard-h1">Flea Market</h1>
                <nav className="dashboard-nav">
                    <Link to='/' className="dashboard-logout-link" onClick={LogOut}>Logout</Link>
                    <Link to='/add-product' className="dashboard-addProduct-link"onClick={navigate('/add-product')}>Add product</Link>
                </nav>
            </header>
            <div className="dashboard-section">
                <p>You have no products listed yet</p>
            </div>
        </div>
    )
}

export default Dashboard;