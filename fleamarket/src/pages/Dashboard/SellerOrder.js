import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './SellerOrder.css';

// --- Main Seller Orders Page Component ---

const SellerOrder = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            // This is a protected route, so redirect if not logged in
            navigate('/Login');
            return;
        }

        const fetchSellerOrders = async () => {
            try {
                const response = await axios.get('http://localhost:3001/api/seller/orders', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setOrders(response.data);
            } catch (err) {
                console.error("Error fetching seller orders:", err);
                setError("Could not retrieve your orders. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchSellerOrders();
    }, [navigate]);

    return (
        <div className="seller-orders-container">
            <div className="seller-orders-header">
                <h2>Incoming Orders</h2>
                <p>Review and manage all orders for your products.</p>
            </div>

            {loading ? (
                <p>Loading your orders...</p>
            ) : error ? (
                <p className="error-message">{error}</p>
            ) : (
                <div className="orders-table-container">
                    <table className="orders-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Date</th>
                                <th>Product</th>
                                <th>Buyer</th>
                                <th>Quantity</th>
                                <th>Total Price</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.length > 0 ? (
                                orders.map(order => (
                                    <tr key={order.order_id}>
                                        <td>#{order.order_id}</td>
                                        <td>{new Date(order.order_date).toLocaleDateString()}</td>
                                        <td>{order.product_title}</td>
                                        <td>{order.buyer_name}</td>
                                        <td>{order.quantity}</td>
                                        <td>Ksh {Number(order.total_price).toLocaleString()}</td>
                                        <td>
                                            <span className={`status-badge status-${order.order_status.toLowerCase()}`}>
                                                {order.order_status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="no-orders-cell">
                                        You have no incoming orders yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default SellerOrder;
