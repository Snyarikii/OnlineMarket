import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './SellerStatistics.css';

const SellerStatistics = () => {
    const [stats, setStats] = useState({
        approved: 0,
        pending: 0,
        rejected: 0,
        total: 0,
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get('http://localhost:3001/api/seller/statistics', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setStats(res.data);
            } catch (err) {
                console.error('Error fetching seller statistics:', err);
                setError('Failed to load statistics.');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [token]);

    return (
        <div className="seller-stats-container">
            <h2 className="seller-stats-title">Seller Dashboard</h2>
            <p className="seller-stats-subtitle">Quick overview of your product performance</p>

            {loading ? (
                <p>Loading statistics...</p>
            ) : error ? (
                <p className="error-text">{error}</p>
            ) : (
                <div className="stats-grid">
                    <div className="stat-card stat-approved">
                        <h3>{stats.approved}</h3>
                        <p>Approved Products</p>
                    </div>
                    <div className="stat-card stat-pending">
                        <h3>{stats.pending}</h3>
                        <p>Pending Approval</p>
                    </div>
                    <div className="stat-card stat-rejected">
                        <h3>{stats.rejected}</h3>
                        <p>Rejected Products</p>
                    </div>
                    <div className="stat-card stat-total">
                        <h3>{stats.total}</h3>
                        <p>Total Products</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SellerStatistics;
