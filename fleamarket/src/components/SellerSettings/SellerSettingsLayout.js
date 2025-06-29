import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import '../BuyerSettings/BuyerSettings.css';

const SellerSettingsLayout = () => {
    const { pathname } = useLocation();

    return (
        <div className="settings-layout">
            <header className="settings-header">
                <h1 className="settings-logo">Account Settings</h1>
                <nav className="settings-nav">
                    <ul>
                        <li className={pathname.includes('MyAccount') ? 'active' : ''}>
                            <Link to="/SellerSettings">My Account</Link>
                        </li>
                        <li className={pathname === '/SellerSettings' ? 'active' : '' }>
                            <Link to="SellerStatistics" className={pathname === '/SellerStatistics' ? 'active' : ''}>My Statistics</Link>
                        </li>
                        <li>
                            <Link to="/Dashboard">My Dashboard</Link>
                        </li>
                    </ul>
                </nav>
            </header>

            <main className="settings-content">
                <Outlet />
            </main>
        </div>
    );
};

export default SellerSettingsLayout;
