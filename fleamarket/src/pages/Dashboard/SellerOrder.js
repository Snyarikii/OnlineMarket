import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './SellerOrder.css';
import logo from '../../assets/logo2.png'; // Import the logo

const SellerOrder = ({ setUser, setLoggingOut }) => {
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [userName, setUserName] = useState(''); // State for the user's name

    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!token) {
            navigate('/Login');
            return;
        }
        
        // Fetch user's name for the greeting
        const fetchUserData = async () => {
            try {
                const res = await axios.get('http://localhost:3001/api/user/me', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUserName(res.data.name);
            } catch (err) {
                console.error("Failed to fetch user name", err);
            }
        };

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

        fetchUserData();
        fetchSellerOrders();
    }, [navigate, token]);
    
    // Logout function
    function LogOut() {
        const confirmLogout = window.confirm("Are you sure you want to log out?");
        if (!confirmLogout) return;

        if (setLoggingOut && setUser) {
            setLoggingOut(true);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
            navigate('/');
            setTimeout(() => setLoggingOut(false), 500);
        } else {
            localStorage.clear();
            navigate('/');
        }
    }

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
        (a, b) => new Date(b.order_date) - new Date(a.order_date)
    ).map((order, index, arr) => ({
        ...order,
        displayId: `FM-ORD-${String(arr.length - index).padStart(3, '0')}`
    }));

    return (
        <div className="seller-order-page-body">
            {/* Updated Header */}
            <header className="marketplace-header">
                <Link to="/Dashboard" className="header-logo-link">
                    <img src={logo} alt="Flea Market Logo" className="header-logo-img" />
                    <span className="header-logo-text">Flea Market</span>
                </Link>
                <nav className="header-nav-links">
                    {userName && <span className="user-greeting">Hi, {userName.split(' ')[0]}</span>}
                    <Link to="/Dashboard">My Products</Link>
                    <Link to="/add-product">Add Product</Link>
                    <Link to="/SellerSettings">My Account</Link>
                    <a onClick={LogOut} className="logout-link">Log Out</a>
                </nav>
            </header>

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
                    <div className="no-orders-box">
                        <p>You have no customer orders yet.</p>
                        <Link to="/Dashboard" className="btn-primary">Go to Dashboard</Link>
                    </div>
                ) : (
                    sortedOrders.map(order => (
                        <div key={order.order_id} className="order-group-box">
                            <div className='order-group-box-header'>
                                <h3>Order {order.displayId}</h3>
                                <p><strong>Date:</strong> {new Date(order.order_date).toLocaleDateString()}</p>
                            </div>
                            
                            <div className="shipping-info">
                                <strong>{order.delivery_method === 'pickup' ? 'Pickup Info' : 'Delivery Info'}</strong>
                                <p>
                                    {order.shipping_name}, {order.shipping_phone}
                                    {order.delivery_method ==='delivery' && (
                                        <>, {order.shipping_address}, {order.shipping_city}, {order.shipping_postal_code}, {order.shipping_country}</>
                                    )}
                                </p>
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
                    ))
                )}
            </div>

            <footer className="seller-order-footer">
                <p>&copy; {new Date().getFullYear()} FleaMarket. All Rights Reserved.</p>
            </footer>
        </div>
    );
};

export default SellerOrder;
