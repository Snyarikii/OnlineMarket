import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './SellerOrder.css';

const SellerOrder = () => {
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!token) {
            navigate('/Login');
            return;
        }

        const fetchSellerOrders = async () => {
            try {
                const response = await axios.get('http://localhost:3001/api/seller/orders', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setItems(response.data);
            } catch (err) {
                console.error("Error fetching seller orders:", err);
                setError("Could not retrieve your orders. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchSellerOrders();
    }, [navigate, token]);

    // Group items by order_id
    const groupedOrders = items.reduce((acc, item) => {
        if (!acc[item.order_id]) {
            acc[item.order_id] = {
                order_id: item.order_id,
                order_date: item.order_date,
                delivery_method: item.delivery_method,
                shipping_name: item.shipping_name,
                shipping_phone: item.shipping_phone,
                shipping_address: item.shipping_address,
                shipping_city: item.shipping_city,
                shipping_postal_code: item.shipping_postal_code,
                shipping_country: item.shipping_country,
                items: []
            };
        }
        acc[item.order_id].items.push(item);
        return acc;
    }, {});

    const sortedOrders = Object.values(groupedOrders).sort(
        (a, b) => new Date(a.order_date) - new Date(b.order_date))
        .map((order, index) => ({
            ...order,
            displayId: `FM-ORD-${String(index + 1).padStart(3, '0')}`
        }))
        .reverse();

    return (
        <div className="seller-order-body">
            <div className="seller-order-header">
                <h1>Flea Market</h1>
                <nav className="seller-order-nav">
                    <Link to="/Dashboard" className="seller-order-back-link">Back</Link>
                </nav>
            </div>

            <div className="seller-orders-container">
                <div className="seller-orders-header">
                    <h2>Customer Orders</h2>
                    <p>Review orders and monitor delivery progress for products you've sold.</p>
                </div>

                {loading ? (
                    <p>Loading your sold products...</p>
                ) : error ? (
                    <p className="error-message">{error}</p>
                ) : sortedOrders.length === 0 ? (
                    <p className="no-orders-cell">You have no sold items yet.</p>
                ) : (
                    sortedOrders.map(order => {
                        return (
                            <div key={order.order_id} className="order-group-box">
                                <h3>Order {order.displayId}</h3>
                                <p>Order Date: {new Date(order.order_date).toLocaleDateString()}</p>
                                <p><strong>Delivery Method: </strong> {order.delivery_method === 'pickup' ? 'Pickup' : 'Delivery'}</p>
                                
                                <div className="shipping-info">
                                    <strong>{order.delivery_method === 'pickup' ? 'Pickup Info' : 'Delivery Info'}</strong><br />
                                    {order.shipping_name}<br />
                                    {order.shipping_phone}<br />
                                    {order.delivery_method ==='delivery' && (
                                        <>
                                            {order.shipping_address}, {order.shipping_city}, {order.shipping_postal_code}, {order.shipping_country}                                            
                                        </>
                                    )}
                                </div>
                                

                                <table className="orders-table">
                                    <thead>
                                        <tr>
                                            <th>Product</th>
                                            <th>Image</th>
                                            <th>Quantity</th>
                                            <th>Total</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {order.items.map(item => (
                                            <tr key={item.order_item_id}>
                                                <td>{item.product_title}</td>
                                                <td>
                                                    <img
                                                        src={`http://localhost:3001/uploads/${item.image_url}`}
                                                        alt={item.product_title}
                                                        className="sellers-product-image"
                                                    />
                                                </td>
                                                <td>{item.quantity}</td>
                                                <td>Ksh {Number(item.total_price).toLocaleString()}</td>
                                                <td>
                                                    <span className={`status-badge status-${item.item_status.toLowerCase()}`}>
                                                        {item.item_status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        );
                    })
                )}
            </div>

            <footer className="seller-order-footer">
                <p>&copy; 2025 FleaMarket. All Rights Reserved.</p>
            </footer>
        </div>
    );
};

export default SellerOrder;
