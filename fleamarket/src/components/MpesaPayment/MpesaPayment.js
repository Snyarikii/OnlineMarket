import React, { useEffect, useState } from "react";
import axios from "axios";
import './MpesaPayment.css';
import { useLocation, useNavigate } from "react-router";

const MpesaPayment = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { orderId, phoneNumber, amount, title } = location.state || {};
    const [phone, setPhone] = useState('');
    const [paymentAmount, setPaymentAmount] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if(phoneNumber) setPhone(phoneNumber);
        if(amount) setPaymentAmount(amount);
    }, [phoneNumber, amount]);

    const handlePayment = async (e) => {
        e.preventDefault();

        if(!phone || !amount) {
            alert("Please fill in both number and amount");
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post('http://localhost:3001/api/stk-push', {
                phone,
                amount: paymentAmount,
                order_id: orderId
            });

            console.log(response.data);
            alert("Payment prompt sent to your phone. Please complete the transaction.");
            navigate("/orders");           
        } catch (error) {
            console.error("Error sending STK push:", error);
            alert("Failed to send payment request. Try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mpesa-form-container">
            <h2>Pay with M-pesa</h2>
            <p>You are paying for <strong>{title}</strong></p>
            <form onSubmit={handlePayment} className="mpesa-form">
                <input 
                    type="text"
                    placeholder="Phone number (e.g., 2547XXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                />

                <input
                    type="number"
                    placeholder="Enter amount"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    required
                />
                <button type="submit" disabled={loading}>
                    {loading ? "Sending..." : "Send Request"}
                </button>
            </form>
        </div>
    );
};

export default MpesaPayment;