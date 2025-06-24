import React, { useEffect, useState , useRef} from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import './Cart.css';
import ShippingForm from "./ShippingForm";

const Cart = () => {
    const [ cartItems, setCartItems ] = useState([]);
    const [loading, setLoading ]= useState(true);
    const navigate = useNavigate();

    const [showShippingForm, setShowShippingForm] = useState(false);
    const [itemToOrder, setItemToOrder] = useState(null);
    const shippingFormRef = useRef(null);

    useEffect(() => {
        if(showShippingForm && shippingFormRef.current) {
            shippingFormRef.current.scrollIntoView({ behavior: "smooth"});
        }
    }, [showShippingForm]);

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

    const handlePlaceOrder = async (item) => {
        const confirmOrder = window.confirm(`Place order for ${item.title}?`);
        if(!confirmOrder) return;

        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));
        
        try {
            console.log("Placing order...");
            const orderRes = await axios.post('http://localhost:3001/api/orders', {
                item_id: item.id,
                quantity:item.quantity,
                total_price: item.price * item.quantity,
            }, {
                headers: { Authorization: `Bearer ${token}`}
            });
            console.log("Order placed:", orderRes.data);

            const newOrderId = orderRes.data.order_id;

            console.log("Fetching shipping info...");
            let prevShipping = null;
            try {
                const shippingRes = await axios.get(`http://localhost:3001/api/shipping/user/${user.id}`, {
                    headers: { Authorization: `Bearer ${token}`}
                });
                prevShipping = shippingRes.data;
                console.log("Shipping info found:", prevShipping);
            } catch (err) {
                if(err.response && err.response.status === 404) {
                    console.log("No previous shipping info found, showing form...");
                    setItemToOrder({ ...item, order_id: newOrderId, cartId: item.cartId});
                    setShowShippingForm(true);
                    return;
                } else {
                    throw err;
                }
            }
            


            console.log("saving new shipping info...");
            await axios.post('http://localhost:3001/api/shipping', {
                order_id: newOrderId,
                recipient_name: prevShipping.recipient_name,
                address_line1: prevShipping.address_line1,
                city: prevShipping.city,
                postal_code: prevShipping.postal_code,
                country: prevShipping.country,
                phone_number: prevShipping.phone_number,
                shipping_method: prevShipping.shipping_method,
             }, {
                headers: { Authorization: `Bearer ${token}`}
            });

            console.log("Deleting item from cart...");
            await axios.delete(`http://localhost:3001/api/cart/${item.cartId}`, {
                headers: { Authorization: `Bearer ${token}`}
            });

            setCartItems(prev => prev.filter(cartItem => cartItem.cartId !== item.cartId));
            alert("Order placed successfully! Shipping info used from your previous order.");

        } catch (err) {
            console.error("Error placing order:", err);
            alert("could not place order. Please try again.");
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
                                    <div className="cart-buttons">
                                        <div className="quantity-controls">
                                            <button onClick={() => handleUpdateQuantity(item.cartId, item.quantity - 1)} className="subtract-btn">-</button>
                                            <button onClick={() => handleUpdateQuantity(item.cartId, item.quantity + 1)}>+</button>
                                        </div>
                                        <button className="cart-placeOrder-btn" onClick={() => handlePlaceOrder(item)}>Place order</button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="cart-summary">
                            <h2>Total: Ksh {Number(totalPrice).toLocaleString()}</h2>
                        </div>
                    </>
                )}
            </div>
            {showShippingForm && (
                <div ref={shippingFormRef}>
                    <ShippingForm
                        itemToOrder={itemToOrder}
                        onSubmit={async () => {
                            const token = localStorage.getItem('token');
                            try {
                                await axios.delete(`http://localhost:3001/api/cart/${itemToOrder.cartId}`, {
                                    headers: {Authorization: `Bearer ${token}`}
                                });
                                setCartItems(prev => prev.filter(cartItem => cartItem.cartId !== itemToOrder.cartId));
                                alert("Order placed successfully! Shipping details saved.");
                            } catch (error) {
                                console.error("Error deleting cart item:", error);
                                alert("Order placed, but failed to remove item from cart. Please refresh manually.");
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