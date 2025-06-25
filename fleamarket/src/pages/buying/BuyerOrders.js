import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './BuyerOrders.css';

// --- Main Buyer Orders Page Component (Updated for new schema) ---

const BuyerOrders = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert("Please log in to view your orders.");
            navigate('/Login');
            return;
        }

        const fetchOrders = async () => {
            try {
                // The endpoint remains the same, but the data it returns is different.
                const response = await axios.get('http://localhost:3001/api/orders/with-shipping', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setOrders(response.data);
            } catch (err) {
                console.error("Error fetching orders:", err);
                setError("Could not retrieve your order history. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [navigate]);

    return (
        <div className="orders-page">
            <header className="orders-header">
                <h1>FleaMarket</h1>
                <nav className="orders-nav">
                    <Link to="/Index">Continue Shopping</Link>
                </nav>
            </header>

            <main className="orders-main-content">
                <div className="orders-title-container">
                    <h2>My Orders</h2>
                    <p>View your complete purchase history.</p>
                </div>

                {loading ? (
                    <p className="loading-text">Loading your orders...</p>
                ) : error ? (
                    <p className="error-message">{error}</p>
                ) : orders.length === 0 ? (
                    <div className="no-orders-card">
                        <h3>You have no orders yet.</h3>
                        <p>All your purchased items will appear here.</p>
                        <Link to="/Index" className="btn-shop-now">Start Shopping</Link>
                    </div>
                ) : (
                    <div className="orders-list">
                        {/* Each "order" is now a single purchased item */}
                        {orders.map(order => (
                            <div key={order.id} className="order-item-card">
                                <img 
                                    src={order.image_url ? `http://localhost:3001/uploads/${order.image_url}` : 'https://via.placeholder.com/100'} 
                                    alt={order.title} 
                                    className="item-image"
                                />
                                <div className="item-details">
                                    <Link to={`/product/${order.product_id}`} className="item-title">{order.title}</Link>
                                    <p className="item-info">Order Date: {new Date(order.order_date).toLocaleDateString()}</p>
                                    <p className="item-info">Quantity: {order.quantity}</p>
                                </div>
                                <div className="order-price">
                                    <p>Ksh {Number(order.total_price).toLocaleString()}</p>
                                </div>
                                <div className="order-status">
                                    <p className={`status-badge status-${order.order_status.toLowerCase()}`}>{order.order_status}</p>
                                </div>
                                {order.order_status.toLowerCase() === "pending" && (
                                    <button 
                                        className='mpesa-pay-btn'
                                        onClick={() => 
                                            navigate('/MpesaPayment', {
                                                state: {
                                                    phoneNumber: order.phone_number,
                                                    amount: order.total_price,
                                                    title: order.title
                                                }
                                            })
                                        }
                                    >
                                        Pay with Mpesa
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>
            <div className='buyer-order-footer'>
                <p>&copy; 2025 FleaMarket. All Rights Reserved.</p>
            </div>
        </div>
    );
};

export default BuyerOrders;
