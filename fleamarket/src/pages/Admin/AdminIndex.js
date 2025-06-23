import React from 'react';
import './AdminIndex.css';

const AdminIndex = () => {
    return (
        <div className='admin-index-body'>
            <div className='admin-index'>
                <h1>Welcome to the Admin panel</h1>
                <p>Select an option from the sidebar to get started</p>
            </div>
    
            <div className='admin-information'>
                <p>Manage Users: Delete users from the market place or update their role.</p>
                <p>Manage Products: Accept or reject products from sellers. Accepted products will be viewed by buyers in the homepage.</p>
                <p>Manage Categories: Add or remove categories. These categories are what the sellers use to upload their products.</p>
            </div>
        </div>
    );
};

export default AdminIndex;