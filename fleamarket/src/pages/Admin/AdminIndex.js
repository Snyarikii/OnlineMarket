import React from 'react';
import './AdminIndex.css';

const AdminIndex = () => {
    return (
        <div className='admin-index-container'>
            <div className='admin-welcome-header'>
                <h1>Welcome to the Admin Dashboard</h1>
                <p>Use the navigation menu on the left to manage your marketplace.</p>
            </div>
    
            <div className='admin-info-grid'>
                <div className='info-card'>
                    <h3>Manage Users</h3>
                    <p>Activate or deactivate user accounts and change user roles between buyer, seller, and admin.</p>
                </div>
                <div className='info-card'>
                    <h3>Manage Products</h3>
                    <p>Review new product submissions from sellers. Approve or reject listings to maintain quality control.</p>
                </div>
                <div className='info-card'>
                    <h3>Manage Categories</h3>
                    <p>Add, edit, or delete product categories. These categories help sellers classify their items.</p>
                </div>
                 <div className='info-card'>
                    <h3>View Statistics</h3>
                    <p>Get an overview of marketplace performance, including total transactions and sales volume.</p>
                </div>
            </div>
        </div>
    );
};

export default AdminIndex;
