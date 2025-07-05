import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import './Cart.css';
import ShippingForm from "./ShippingForm";
import logo from '../../assets/logo2.png'; // Import the logo

const Cart = ({ setUser, setLoggingOut }) => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState(''); // State for the user's name
    const navigate = useNavigate();

    const [showShippingForm, setShowShippingForm] = useState(false);
    const [itemToOrder, setItemToOrder] = useState(null);
    const shippingFormRef = useRef(null);

    useEffect(() => {
        if (showShippingForm && shippingFormRef.current) {
            shippingFormRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [showShippingForm]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert("Please log in to view your cart.");
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

        const fetchCart = async () => {
            try {
                const response = await axios.get('http://localhost:3001/api/cart', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setCartItems(response.data);
            } catch (err) {
                console.error("Error fetching cart:", err);
                setCartItems([]);
                alert("Could not fetch your cart. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
        fetchCart();
    }, [navigate]);
    
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
            // Fallback for safety if props aren't passed
            localStorage.clear();
            navigate('/');
        }
    }

    const removeItem = async (cartId) => {
        const confirmDelete = window.confirm("Remove this item from your cart?");
        if (!confirmDelete) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:3001/api/cart/${cartId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCartItems((prev) => prev.filter((item) => item.cartId !== cartId));
        } catch (err) {
            console.error("Error removing item:", err);
            alert("Could not remove item. Try again.");
        }
    };

    const handleUpdateQuantity = async (cartId, newQuantity) => {
        const item = cartItems.find(i => i.cartId === cartId);
        if (!item) return;

        const clamped = Math.max(1, Math.min(item.stock_quantity, newQuantity));
        if (clamped === item.quantity) return;

        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `http://localhost:3001/api/cart/${cartId}`,
                { quantity: clamped },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setCartItems(prev =>
                prev.map(i =>
                    i.cartId === cartId ? { ...i, quantity: clamped } : i
                )
            );
        } catch (err) {
            console.error('Error updating quantity:', err);
            alert('Could not update item quantity. Please try again.');
        }
    };

    const handlePlaceOrder = async () => {
        if (cartItems.length === 0) return alert("Your cart is empty.");

        const confirm = window.confirm("Proceed to checkout for all items in your cart?");
        if (!confirm) return;

        const token = localStorage.getItem("token");
        const user = JSON.parse(localStorage.getItem("user"));

        try {
            const shippingRes = await axios.get(`http://localhost:3001/api/shipping/user/${user.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const shippingData = shippingRes.data;
            setItemToOrder({ cartItems, shippingPrefill: shippingData });
            setShowShippingForm(true);
        } catch (err) {
            if (err.response?.status === 404) {
                setItemToOrder({ cartItems, shippingPrefill: null });
                setShowShippingForm(true);
            } else {
                console.error("Error getting shipping info:", err);
                alert("Failed to fetch shipping info.");
            }
        }
    };

    const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    if (loading) return <p>Loading cart...</p>;

    return (
        <div className="cart-page-body">
            {/* Updated Header */}
            <header className="marketplace-header">
                <Link to="/Index" className="header-logo-link">
                    <img src={logo} alt="Flea Market Logo" className="header-logo-img" />
                    <span className="header-logo-text">Flea Market</span>
                </Link>
                <nav className="header-nav-links">
                    {userName && <span className="user-greeting">Hi, {userName.split(' ')[0]}</span>}
                    <Link to="/Index">Shop</Link>
                    <Link to="/orders">My Orders</Link>
                    <Link to="/BuyerSettings">Account</Link>
                    <a onClick={LogOut} className="logout-link">Log out</a>
                </nav>
            </header>

            <div className="cart-container">
                <h1>Your Cart</h1>
                {cartItems.length === 0 ? (
                    <p>Your cart is empty. <Link to="/Index">Continue shopping</Link>.</p>
                ) : (
                    <>
                        <div className="cart-items">
                            {cartItems.map(item => (
                                <div key={item.cartId} className="cart-item">
                                    <img
                                        src={item.image_url ? `http://localhost:3001/uploads/${item.image_url}` : 'https://via.placeholder.com/100'}
                                        alt={item.title}
                                        className="cart-item-image"
                                    />
                                    <div className="cart-item-info">
                                        <h3>{item.title}</h3>
                                        <p>Price: Ksh {Number(item.price).toLocaleString()}</p>
                                        <div className="quantity-controls">
                                            <button 
                                                onClick={() => handleUpdateQuantity(item.cartId, item.quantity - 1)}
                                                disabled={item.quantity === 1}
                                            >
                                                -
                                            </button>
                                            <span>{item.quantity}</span>
                                            <button 
                                                onClick={() => handleUpdateQuantity(item.cartId, item.quantity + 1)}
                                                disabled={item.quantity >= item.stock_quantity}
                                            >
                                                +
                                            </button>
                                        </div>
                                        <small className="stock-left">
                                            In Stock: {item.stock_quantity}
                                        </small>
                                    </div>
                                    <div className="cart-item-actions">
                                        <p className="item-total">Subtotal: Ksh {(item.price * item.quantity).toLocaleString()}</p>
                                        <button className="remove-btn" onClick={() => removeItem(item.cartId)}>Remove</button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="cart-summary">
                            <h2>Total: Ksh {Number(totalPrice).toLocaleString()}</h2>
                            <button className="cart-placeOrder-btn" onClick={handlePlaceOrder}>Proceed to Checkout</button>
                        </div>
                    </>
                )}
            </div>
            {showShippingForm && (
                <div ref={shippingFormRef}>
                    <ShippingForm
                        itemToOrder={itemToOrder}
                        prefillData={itemToOrder?.shippingPrefill || null}
                        onSubmit={async (filledShippingData) => {
                            const token = localStorage.getItem('token');
                            try {
                                const {
                                    delivery_method,
                                    shipping_name,
                                    shipping_phone,
                                    shipping_address,
                                    shipping_city,
                                    shipping_postal_code,
                                    shipping_country,
                                } = filledShippingData;

                                const orderPayload = {
                                    total_price: totalPrice,
                                    delivery_method,
                                    shipping_name,
                                    shipping_phone,
                                    shipping_address: delivery_method === 'delivery' ? shipping_address : null,
                                    shipping_city: delivery_method === 'delivery' ? shipping_city : null,
                                    shipping_postal_code: delivery_method === 'delivery' ? shipping_postal_code : null,
                                    shipping_country: delivery_method === 'delivery' ? shipping_country : null,
                                    items: itemToOrder.cartItems.map(item => ({
                                        product_id: item.id,
                                        seller_id: item.seller_id,
                                        quantity: item.quantity,
                                        price: item.price,
                                        total_price: (item.price * item.quantity).toFixed(2)
                                    }))
                                };
                                await axios.post('http://localhost:3001/api/place-order', orderPayload, {
                                    headers: { Authorization: `Bearer ${token}` }
                                });
                        
                                for (const item of itemToOrder.cartItems) {
                                    await axios.delete(`http://localhost:3001/api/cart/${item.cartId}`, {
                                        headers: { Authorization: `Bearer ${token}` }
                                    });
                                }

                                setCartItems([]);
                                alert("Order placed successfully!");
                                navigate('/orders');
                            } catch (error) {
                                console.error("Order failed:", error);
                                if(error.response) {
                                    alert(error.response.data.error || "Order failed. Please try again.");
                                } else {
                                    alert("Network error. Please try again");
                                }
                            } finally {
                                setShowShippingForm(false);
                                setItemToOrder(null);
                            }
                        }}
                        onClose={() => {
                            setShowShippingForm(false);
                            setItemToOrder(null);
                        }}
                    />
                </div>
            )}
            <footer className="cart-footer">
                <p>&copy; {new Date().getFullYear()} FleaMarket. All Rights Reserved.</p>
            </footer>
        </div>
    );
};

export default Cart;
