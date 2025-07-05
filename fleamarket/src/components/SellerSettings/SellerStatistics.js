import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import './SellerStatistics.css';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const SellerStatistics = () => {

    const [stats, setStats] = useState({
        products: { approved: 0, pending: 0, rejected: 0, total: 0 },
        sales: { totalRevenue: 0, paidOrders: 0 },
        topProducts: [],
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
            
            console.log('API Response:', res.data); 
            
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

 
    const renderChart = () => {
        if (!stats.topProducts || stats.topProducts.length === 0) {
            return <p>No sales data available to display a chart.</p>;
        }

        const topProductsChartData = {
            labels: stats.topProducts.map(p => p.title),
            datasets: [
                {
                    label: 'Total Units Sold',
                    data: stats.topProducts.map(p => p.total_sold),
                    backgroundColor: 'rgba(59, 130, 246, 0.7)',
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 1,
                },
            ],
        };

        return <Bar data={topProductsChartData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />;
    };


    return (
        <div className="seller-stats-container">
            <h2 className="seller-stats-title">Seller Dashboard</h2>
            <p className="seller-stats-subtitle">Your comprehensive sales and product performance</p>

            {loading ? (
                <p>Loading statistics...</p>
            ) : error ? (
                <p className="error-text">{error}</p>
            ) : (
                <>
                    {/* Sales Overview */}
                    <div className="stats-grid">
                        <div className="stat-card stat-revenue">
                            <h3>KES {parseFloat(stats.sales.totalRevenue).toFixed(2)}</h3>
                            <p>Total Revenue</p>
                        </div>
                        <div className="stat-card stat-orders">
                            <h3>{stats.sales.paidOrders}</h3>
                            <p>Total Paid Orders</p>
                        </div>
                    </div>

                    {/* Product Listings Overview */}
                    <h3 className="section-title">Product Listings</h3>
                    <div className="stats-grid">
                        <div className="stat-card stat-approved">
                            <h3>{stats.products.approved || 0}</h3>
                            <p>Approved Products</p>
                        </div>
                        <div className="stat-card stat-pending">
                            <h3>{stats.products.pending || 0}</h3>
                            <p>Pending Approval</p>
                        </div>
                        <div className="stat-card stat-rejected">
                            <h3>{stats.products.rejected || 0}</h3>
                            <p>Rejected Products</p>
                        </div>
                        <div className="stat-card stat-total">
                            <h3>{stats.products.total || 0}</h3>
                            <p>Total Products</p>
                        </div>
                    </div>

                    {/* Top Selling Products */}
                    <div className="chart-container">
                        <h3 className="section-title">Top 5 Best-Selling Products</h3>
                        {renderChart()}
                    </div>
                </>
            )}
        </div>
    );
};

export default SellerStatistics;