import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './BuyerOrders.css';

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
                const response = await axios.get('http://localhost:3001/api/orders/with-products', {
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
    // Group orders by order_id
    const groupedOrders = orders.reduce((acc, item) => {
        if (!acc[item.order_id]) {
            acc[item.order_id] = {
                order_id: item.order_id,
                order_date: item.order_date,
                order_status: item.order_status,
                phone_number: item.phone_number,
                items: [],
                total_price: 0
            };
        }
        acc[item.order_id].items.push(item);
        acc[item.order_id].total_price += Number(item.total_price); // Sum total for grouped items
        return acc;
    }, {});


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
                    {Object.values(groupedOrders).map(orderGroup => (
                    <div key={orderGroup.order_id} className="order-group">
                        <h3>Order #{orderGroup.order_id}</h3>
                        <p>Order Date: {new Date(orderGroup.order_date).toLocaleDateString()}</p>

                        <div className="group-items">
                        {orderGroup.items.map(item => (
                            <div key={`${orderGroup.order_id}_${item.product_id}`} className="order-item-card">
                            <img
                                src={item.image_url ? `http://localhost:3001/uploads/${item.image_url}` : 'https://via.placeholder.com/100'}
                                alt={item.title}
                                className="item-image"
                            />
                            <div className="item-details">
                                <Link to={`/product/${item.product_id}`} className="item-title">{item.title}</Link>
                                <p className="item-info">Quantity: {item.quantity}</p>
                                <p className="item-info">Price: Ksh {Number(item.total_price).toLocaleString()}</p>
                            </div>
                            </div>
                        ))}
                        </div>

                        <div className="group-summary">
                        <p><strong>Total:</strong> Ksh {Number(orderGroup.total_price).toLocaleString()}</p>
                        <p className={`status-badge status-${orderGroup.order_status.toLowerCase()}`}>
                            {orderGroup.order_status}
                        </p>
                        {orderGroup.order_status.toLowerCase() === "pending" && (
                            <button
                            className="mpesa-pay-btn"
                            onClick={() =>
                                navigate('/MpesaPayment', {
                                state: {
                                    phoneNumber: orderGroup.phone_number,
                                    amount: orderGroup.total_price,
                                    title: `Order #${orderGroup.order_id}`
                                }
                                })
                            }
                            >
                            Pay for Order #{orderGroup.order_id}
                            </button>
                        )}
                        </div>
                    </div>
                    ))}

                    </div>

                )}
            </main>

            <footer className='buyer-order-footer'>
                <p>&copy; 2025 FleaMarket. All Rights Reserved.</p>
            </footer>
        </div>
    );
};

export default BuyerOrders;
