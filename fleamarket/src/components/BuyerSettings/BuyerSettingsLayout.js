import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import './BuyerSettings.css';

const BuyerSettingsLayout = () => {
    const { pathname } = useLocation();

    return (
        <div className="settings-layout">
            <header className="settings-header">
                <h1 className="settings-logo">Account Settings</h1>
                <nav className="settings-nav">
                    <ul>
                        <li className={pathname === '/BuyerSettings' ? 'active' : ''}>
                            <Link to="/BuyerSettings">My Account</Link>
                        </li>
                        <li className={pathname.includes('shipping') ? 'active' : ''}>
                            <Link to="BuyerShippingInfo" className={pathname === '/BuyerSettings' ? 'active' : ''}>My Delivery Info</Link>
                        </li>
                        <li>
                            <Link to="/Index">Continue shopping</Link>
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

export default BuyerSettingsLayout;
