import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

    const handleUpdateStatus = async (orderId, newStatus) => {
        const token = localStorage.getItem('token');
        if(!token) {
            alert("Please log in again.");
            navigate('/Login');
            return;
        }

        try {
            await axios.put(`http://localhost:3001/api/orders/${orderId}/status`, 
                {status: newStatus},
                { headers: {Authorization: `Bearer ${token}` } }
            );

            setOrders(prevOrders => prevOrders.map(order => 
                order.order_id === orderId ? { ...order, order_status: newStatus} : order
            ));
        } catch (err) {
            console.error("Error updating order status:", err);
            alert("Failed to update order status. Please try again.");
        }
    };

    return (
        <div className='seller-order-body'>
            <div className='seller-order-header'>
                <h1>Flea Market</h1>
                <nav className='seller-order-nav'>
                    <Link to='/Dashboard' className='seller-order-back-link'>Back</Link>
                </nav>
            </div>
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
                                                {order.order_status === 'pending' && (
                                                    <div className='order-actions'>
                                                        <button onClick={() => handleUpdateStatus(order.order_id, 'delivered')} className='sellerOrder-approve-btn'>Mark as delivered</button>
                                                    </div>
                                                )}
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
             <footer className="seller-order-footer">
                <p>&copy; 2025 FleaMarket. All Rights Reserved.</p>
            </footer>
        </div>
    );
};

export default SellerOrder;
