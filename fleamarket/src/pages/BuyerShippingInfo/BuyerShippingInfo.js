import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './BuyerShippingInfo.css';

const BuyerShippingInfo = () => {
    const [shippingInfo, setShippingInfo] = useState({
        recipient_name: '',
        address_line1: '',
        city: '',
        postal_code: '',
        country: '',
        phone_number: ''
    });
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [isNewUser, setIsNewUser]  = useState(false);

    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchShippingInfo = async () => {
            try {
                const response = await axios.get(`http://localhost:3001/api/shipping/user/${user.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setShippingInfo(response.data);
                setIsNewUser(false);
            } catch (err) {
                if (err.response && err.response.status === 404) {
                console.log("No shipping info yet — user is new.");
                setShippingInfo({
                    recipient_name: '',
                    address_line1: '',
                    city: '',
                    postal_code: '',
                    country: '',
                    phone_number: ''
                    });
                    setIsNewUser(true);

                } else {
                    console.error("Error fetching shipping info:", err);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchShippingInfo();
    }, [user.id, token]);

    const handleChange = (e) => {
        setShippingInfo({
            ...shippingInfo,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`http://localhost:3001/api/shipping/user/${user.id}`, shippingInfo, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage("Shipping info updated successfully.");
        } catch (err) {
            console.error("Error updating shipping info:", err);
            setMessage("Failed to update shipping info.");
        }
    };

    if (loading) return <p>Loading...</p>;

    return (
        <div className="shipping-info-container">
            <h2>Your Delivery Information</h2>
            <form onSubmit={handleSubmit} className="shipping-info-form">
                <label>Recipeint Name:</label>
                <input type="text" name="recipient_name" placeholder="Recipient Name" value={shippingInfo.recipient_name} onChange={handleChange} required />
                <label>Address Line 1</label>
                <input type="text" name="address_line1" placeholder="Address Line 1" value={shippingInfo.address_line1} onChange={handleChange} required />
                <label>City</label>
                <input type="text" name="city" placeholder="City" value={shippingInfo.city} onChange={handleChange} required />
                <label>Postal Code</label>
                <input type="text" name="postal_code" placeholder="Postal Code" value={shippingInfo.postal_code} onChange={handleChange} required />
                <label>Country</label>
                <input type="text" name="country" placeholder="Country" value={shippingInfo.country} onChange={handleChange} required />
                <label>Phone Number</label>
                <input type="text" name="phone_number" placeholder="Phone Number" value={shippingInfo.phone_number} onChange={handleChange} required />
                {message && <p className="info-message">{message}</p>}
                <button type="submit">
                    {isNewUser ? "Enter delivery info" : "Update info"}
                </button>
            </form>
        </div>
    );
};

export default BuyerShippingInfo;
