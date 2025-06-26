import React, {use, useState} from "react";
import axios from "axios";
import './ShippingForm.css';

const ShippingForm = ({ itemToOrder, prefillData, onSubmit, onClose }) => {
    const [phoneError, setPhoneError] = useState('');
    const [formData, setFormData] = useState({
        recipient_name: prefillData?.recipient_name || '',
        address_line1: prefillData?.address_line1 || '',
        city: prefillData?.city || '',
        postal_code: prefillData?.postal_code || '',
        country: prefillData?.country || '',
        phone_number: prefillData?.phone_number || '',
        shipping_method: prefillData?.shipping_method || 'Delivery',
    });

    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');


        const phoneRegex = /^(07|01)\d{8}$/;
        if (!phoneRegex.test(formData.phone_number)) {
            setPhoneError("Phone number must start with 07 or 01 and be 10 digits long.");
            return;
        } else {
            setPhoneError('');
        }
        onSubmit(formData);
    };

    return (
        <div className="shipping-form-modal">
            <h3>Enter Delivery Information</h3>
            <form onSubmit={handleSubmit} className="shipping-form">
                <input type="text" name="recipient_name" placeholder="Recipient Name" value={formData.recipient_name} onChange={handleChange} required />
                <input type="text" name="address_line1" placeholder="Address Line 1" value={formData.address_line1} onChange={handleChange} required />
                <input type="text" name="city" placeholder="City" value={formData.city} onChange={handleChange} required />
                <input type="text" name="postal_code" placeholder="Postal Code" value={formData.postal_code} onChange={handleChange} required />
                <input type="text" name="country" placeholder="Country" value={formData.country} onChange={handleChange} required />
                <input type="text" name="phone_number" placeholder="Phone Number" value={formData.phone_number} onChange={handleChange} required />
                {phoneError && <p className="error-text">{phoneError}</p>}

                <select name="shipping_method" value={formData.shipping_method} onChange={handleChange}>
                    <option value="Delivery">Delivery</option>
                    <option value="Pick Up">Pick Up</option>
                </select>

                <div className="shipping-form-buttons">
                    <button type="submit" className="shipping-save-and-submit">Save & Place Order</button>
                    <button type="button" onClick={onClose} className="shippint-cancel-btn">Cancel</button>
                </div>
            </form>
        </div>
    );
};

export default ShippingForm;