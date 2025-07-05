import React, { useEffect, useState } from 'react';
import './MyAccount.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const MyAccount = () => { // Renamed component for clarity
    const [userInfo, setUserInfo] = useState({ name: '', email: '' });
    const [confirming, setConfirming] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        const fetchUserDetails = async () => {
            if (!token) {
                navigate('/Login');
                return;
            }
            try {
                const res = await axios.get('http://localhost:3001/api/user/me', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUserInfo({
                    name: res.data.name,
                    email: res.data.email
                });
            } catch (error) {
                console.error("Failed to fetch user info: ", error);
                setMessage("Could not load user info.");
            }
        };
        fetchUserDetails();
    }, [token, navigate]);

    const handleDeactivate = async () => {
        if (!token) {
            alert("You need to be logged in.");
            navigate('/Login');
            return;
        }

        setLoading(true);
        try {
            await axios.put(`http://localhost:3001/api/users/${user.id}/deactivate`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Clear token and redirect
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            alert("Your account has been deactivated.");
            navigate('/Login');
        } catch (err) {
            console.error('Deactivation failed:', err);
            alert("Failed to deactivate your account. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='my-account-page'>
            <div className='my-account-section'>
                <h2>My Account Information</h2>
                <div className='my-info-card'>
                    <div className='info-item'>
                        <span className='info-label'>Name:</span>
                        <span className='info-value'>{userInfo.name || 'Loading...'}</span>
                    </div>
                    <div className='info-item'>
                        <span className='info-label'>Email:</span>
                        <span className='info-value'>{userInfo.email || 'Loading...'}</span>
                    </div>
                </div>
                {message && <p className="error-message">{message}</p>}
            </div>

            <div className="deactivate-section">
                <h2>Deactivate Account</h2>
                <p className="warning-text">
                    Deactivating your account will temporarily remove your profile and you will not be able to log in again. The admin can reactivate it.
                </p>

                {!confirming ? (
                    <button className="deactivate-btn" onClick={() => setConfirming(true)}>
                        Deactivate My Account
                    </button>
                ) : (
                    <div className="confirm-box">
                        <p>Are you sure you want to deactivate your account?</p>
                        <div className="confirm-buttons">
                            <button className="confirm-btn-yes" onClick={handleDeactivate} disabled={loading}>
                                {loading ? 'Deactivating...' : 'Yes, Deactivate'}
                            </button>
                            <button className="confirm-btn-cancel" onClick={() => setConfirming(false)}>
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyAccount;
