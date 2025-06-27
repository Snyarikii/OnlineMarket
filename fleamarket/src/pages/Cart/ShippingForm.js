import React, { useState } from "react";
import './ShippingForm.css';

const ShippingForm = ({ itemToOrder, prefillData, onSubmit, onClose }) => {
    const [phoneError, setPhoneError] = useState('');

    const [formData, setFormData] = useState({
        shipping_name: prefillData?.recipient_name || '',
        shipping_phone: prefillData?.phone_number || '',
        shipping_address: prefillData?.address_line1 || '',
        shipping_city: prefillData?.city || '',
        shipping_postal_code: prefillData?.postal_code || '',
        shipping_country: prefillData?.country || 'Kenya',
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const phoneRegex = /^(07|01)\d{8}$/;
        if (!phoneRegex.test(formData.shipping_phone)) {
            setPhoneError("Phone number must start with 07 or 01 and be 10 digits long.");
            return;
        } else {
            setPhoneError('');
        }

        onSubmit(formData);  // Let parent component handle order placement
    };

    return (
        <div className="shipping-form-modal">
            <h3>Enter Delivery Information</h3>
            <form onSubmit={handleSubmit} className="shipping-form">
                <input
                    type="text"
                    name="recipient_name"
                    placeholder="Recipient Name"
                    value={formData.shipping_name}
                    onChange={handleChange}
                    required
                />
                <input
                    type="text"
                    name="address_line1"
                    placeholder="Address Line 1"
                    value={formData.shipping_address}
                    onChange={handleChange}
                    required
                />
                <input
                    type="text"
                    name="city"
                    placeholder="City"
                    value={formData.shipping_city}
                    onChange={handleChange}
                    required
                />
                <input
                    type="text"
                    name="postal_code"
                    placeholder="Postal Code"
                    value={formData.shipping_postal_code}
                    onChange={handleChange}
                    required
                />
                <input
                    type="text"
                    name="country"
                    placeholder="Country"
                    value={formData.shipping_country}
                    onChange={handleChange}
                    required
                />
                <input
                    type="text"
                    name="phone_number"
                    placeholder="Phone Number"
                    value={formData.shipping_phone}
                    onChange={handleChange}
                    required
                />
                {phoneError && <p className="error-text">{phoneError}</p>}

                <div className="shipping-form-buttons">
                    <button type="submit" className="shipping-save-and-submit">Save & Place Order</button>
                    <button type="button" onClick={onClose} className="shipping-cancel-btn">Cancel</button>
                </div>
            </form>
        </div>
    );
};

export default ShippingForm;
