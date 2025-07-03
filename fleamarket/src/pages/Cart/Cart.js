import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import './Cart.css';
import ShippingForm from "./ShippingForm";

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
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
        const fetchCart = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                alert("Please log in to view your cart.");
                navigate('/Login');
                return;
            }

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
        fetchCart();
    }, [navigate]);

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

        // clamp 1 … stock
        const clamped = Math.max(1, Math.min(item.stock_quantity, newQuantity));
        if (clamped === item.quantity) return;   // nothing to do

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

        const confirm = window.confirm("Place order for all items in your cart?");
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
        <div className="cart-body">
            <div className="cart-header">
                <h1 className="cart-h1">Flea Market</h1>
                <nav className="cart-nav">
                    <Link to='/Index' className="cart-back-link">Back</Link>
                </nav>
            </div>
            <div className="cart-container">
                <h1>Your Cart</h1>
                {cartItems.length === 0 ? (
                    <p>Your cart is empty.</p>
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
                                        <p>Quantity: {item.quantity}</p>
                                        <button onClick={() => removeItem(item.cartId)}>Remove</button>
                                    </div>
                                    <div className="cart-buttons">
                                        <div className="quantity-controls">
                                            <button 
                                                onClick={() => 
                                                    handleUpdateQuantity(item.cartId, item.quantity - 1)
                                                }
                                                className="subtract-btn"
                                                disabled={item.quantity === 1}
                                                >
                                                    -
                                            </button>
                                            <button 
                                                onClick={() => 
                                                    handleUpdateQuantity(item.cartId, item.quantity + 1)
                                                }
                                                disabled={item.quantity === item.stock_quantity}
                                                >
                                                    +
                                            </button>
                                            <small className="stock-left">
                                                In Stock: {item.stock_quantity}
                                            </small>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="cart-summary">
                            <h2>Total: Ksh {Number(totalPrice).toLocaleString()}</h2>
                            <button className="cart-placeOrder-btn" onClick={handlePlaceOrder}>Place Order</button>
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

                                //Step 1: Place the order
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
                                const orderRes = await axios.post('http://localhost:3001/api/place-order', orderPayload, {
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
                                    console.log("Status", error.response.status);
                                    console.log("Data:", error.response.data);
                                    
                                    if (error.response.status) {
                                        alert(error.response.data.error);                                        
                                    } else {
                                        alert(error.response.data.error || "Order failed. Please try again.");
                                    }
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
            <div className="cart-footer">
                <p>&copy; 2025 FleaMarket. All Rights Reserved.</p>
            </div>
        </div>
    );
};

export default Cart;
