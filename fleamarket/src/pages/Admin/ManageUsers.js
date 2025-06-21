import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ManageUsers.css';

const ManageUsers = () => {
    const [users, setUsers ] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredUsers, setFilteredUsers] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try{
            const res = await axios.get('http://localhost:3001/api/admin/users');
            setUsers(res.data);
            setFilteredUsers(res.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching users:', error);
            setMessage('Failed to load users.');
            setLoading(false);
        }
    };
    
    const handleSearch = (query) => {
        setSearchQuery(query);
        const filtered = users.filter(user => 
            user.name.toLowerCase().includes(query.trim().toLowerCase()) ||
            user.email.toLowerCase().includes(query.trim().toLowerCase())
        );
        setFilteredUsers(filtered);
    }
  
    const handleDelete = async (userId) => {
        const confirmDelete = window.confirm("Are you sure you want to delte this user");
        if(!confirmDelete) return;

        try {
            await axios.delete(`http://localhost:3001/api/admin/users/${userId}`);
            setUsers(users.filter(user => user.id !== userId));
            setMessage('User deleted successfully.');
        } catch (error) {
            console.error("Error deleting user:" , error);
            setMessage("Failed to delete user.");
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
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map(user => (
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
                                        <button
                                            className='delete-btn'
                                            onClick={() => handleDelete(user.id)}
                                        >
                                            Delete
                                        </button>
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
            )}
        </div>
    );
};

export default ManageUsers;