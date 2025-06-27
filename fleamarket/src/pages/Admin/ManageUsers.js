import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ManageUsers.css';

const ManageUsers = () => {
    const [users, setUsers ] = useState([]);
    const [deactivatedUsers, setDeactivatedUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredActiveUsers, setFilteredActiveUsers] = useState('');
    const [filteredDeactivatedUsers, setFilteredDeactivatedUsers] = useState('');

    useEffect(() => {
        fetchUsers();
        fetchDeactivatedUsers();
    }, []);

    const fetchUsers = async () => {
        try{
            const res = await axios.get('http://localhost:3001/api/admin/users');
            setUsers(res.data);
            setFilteredActiveUsers(res.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching users:', error);
            setMessage('Failed to load users.');
            setLoading(false);
        }
    };
    const fetchDeactivatedUsers = async () => {
        try {
            const response = await axios.get('http://localhost:3001/api/admin/deactivated');
            setDeactivatedUsers(response.data);
            setFilteredDeactivatedUsers(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching deactivated users:", error);
            setMessage("Failed to load deactivated users");
            setLoading(false);
        }
    }
    
    const handleSearch = (query) => {
        setSearchQuery(query);
        const activeFiltered = users.filter(user => 
            user.name.toLowerCase().includes(query.trim().toLowerCase()) ||
            user.email.toLowerCase().includes(query.trim().toLowerCase())
        );
        const deactivatedFiltered = deactivatedUsers.filter(user => 
            user.name.toLowerCase().includes(query.trim().toLowerCase()) ||
            user.email.toLowerCase().includes(query.trim().toLowerCase())
        );
        
        setFilteredActiveUsers(activeFiltered);
        setFilteredDeactivatedUsers(deactivatedFiltered);
    }

const handleDeactivation = async (userId) => {
    const confirmDeactivation = window.confirm("Are you sure you want to deactivate this user?");
    if (!confirmDeactivation) return;

    try {
        await axios.put(`http://localhost:3001/api/users/${userId}/deactivate`);        
        setUsers(users.map(user => 
            user.id === userId ? { ...user, is_active: false } : user
        ));
        fetchUsers();
        fetchDeactivatedUsers();
        alert("User successfully deactivated.");
    } catch (error) {
        console.error("Failed to deactivate user:", error);
        alert("An error occurred while deactivating the user.");
    }
};

const handleActivation = async (userId) => {
    const confirmActivate = window.confirm("Reactivate this user?");
    if(!confirmActivate) return;

    try {
        await axios.put(`http://localhost:3001/api/users/${userId}/activate`);
        fetchUsers();
        fetchDeactivatedUsers();
        setMessage("User successfully reactivated");
    } catch (error) {
        console.error("Error reactivating user:", error);
        setMessage("Failed to reactivate user.");
    }
};


    const handleChangeRole = async (userId, newRole) => {
        try{
            await axios.put(`http://localhost:3001/api/admin/users/${userId}/role`, { role: newRole});
            setUsers(users.map(user => user.id === userId ? { ...user, role: newRole } : user));
            setMessage(`User role updated to ${newRole}.`);
            fetchUsers();
        } catch (error) {
            console.error("Error changin role.", error);
            setMessage("Failed to update user role.");
        }
    };

    return (
        <div className='manage-users-container'>
            <h2>Manage Users</h2>
            <div className='User-search'>
                <span className='material-symbols-outlined search-icon'>search</span>
                <input 
                    type='search'
                    className='user-search-input'
                    placeholder='Search Users...'
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                />
            </div>
            {message && <p className='message'>{message}</p>}
            {loading ? (
                <p>Loading users...</p>
            ) : (
                <>
                    <h3>Active users</h3>
                    <table className='users-table'>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredActiveUsers.length > 0 ? (
                                filteredActiveUsers.map(user => (
                                    <tr key={user.id}>
                                        <td>{user.id}</td>
                                        <td>{user.name}</td>
                                        <td>{user.email}</td>
                                        <td>{user.role}</td>
                                        <td>
                                            <select
                                                value={user.role}
                                                onChange={(e) => handleChangeRole(user.id, e.target.value)}
                                            >
                                                <option value='buyer'>Buyer</option>
                                                <option value='seller'>Seller</option>
                                                <option value='admin'>Admin</option>
                                            </select>
                                            <div className='user-manage-btns'>
                                                <button
                                                    className='deactivate-btn'
                                                    onClick={() => handleDeactivation(user.id)}
                                                >
                                                    Deactivate
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan='5' style={{ textAlign: 'center'}}>No users found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    <h3>Deactivated users</h3>
                    <table className='users-table'>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredDeactivatedUsers.length > 0 ? (
                                filteredDeactivatedUsers.map(user => (
                                    <tr key={user.id}>
                                        <td>{user.id}</td>
                                        <td>{user.name}</td>
                                        <td>{user.email}</td>
                                        <td>{user.role}</td>
                                        <td>
                                            <div className='user-manage-btns'>
                                                <button
                                                    className='activate-btn'
                                                    onClick={() => handleActivation(user.id)}
                                                >
                                                    Activate
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan='5' style={{ textAlign: 'center'}}>No users found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </>
            )}
        </div>
    );
};

export default ManageUsers;