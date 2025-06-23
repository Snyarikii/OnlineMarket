import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import './Cart.css';

const Cart = () => {
    const [ cartItems, setCartItems ] = useState([]);
    const [loading, setLoading ]= useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCart = async () => {
            const token = localStorage.getItem('token');
            if(!token) {
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
        if(!confirmDelete) return;

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
        if(newQuantity < 1) return;

        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:3001/api/cart/${cartId}`, 
                { quantity: newQuantity },
                { headers: {Authorization: `Bearer ${token}`}}
            );

            setCartItems(prevItems => prevItems.map(item => 
                item.cartId === cartId ? { ...item, quantity: newQuantity } : item
            ));
        } catch (err) {
            console.error("Error updating quantity:", err);
            alert("Could not update item quantity. Please try again.");
        }
    };

    const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    if(loading) return <p>Loading cart...</p>;

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
                                    <div className="quantity-controls">
                                        <button onClick={() => handleUpdateQuantity(item.cartId, item.quantity - 1)}>-</button>
                                        <button onClick={() => handleUpdateQuantity(item.cartId, item.quantity + 1)}>+</button>

                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="cart-summary">
                            <h2>Total: Ksh {Number(totalPrice).toLocaleString()}</h2>
                            <button className="checkout-btn">Proceed to Checkout</button>
                        </div>
                    </>
                )}
            </div>
        </div> 
    );
};

export default Cart;