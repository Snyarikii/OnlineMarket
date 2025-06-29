import React, { useState } from "react";
import './ShippingForm.css';

const ShippingForm = ({ itemToOrder, prefillData, onSubmit, onClose }) => {
    const [phoneError, setPhoneError] = useState('');

    const [formData, setFormData] = useState({
        delivery_method: 'delivery', // default option
        shipping_name: prefillData?.recipient_name || '',
        shipping_phone: prefillData?.phone_number || '',
        shipping_address: prefillData?.address_line1 || '',
        shipping_city: prefillData?.city || '',
        shipping_postal_code: prefillData?.postal_code || '',
        shipping_country: prefillData?.country || 'Kenya',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validate phone number
        const phoneRegex = /^(07|01)\d{8}$/;
        if (!phoneRegex.test(formData.shipping_phone)) {
            setPhoneError("Phone number must start with 07 or 01 and be 10 digits long.");
            return;
        } else {
            setPhoneError('');
        }

        // If delivery method is delivery, ensure all address fields are filled
        if (formData.delivery_method === 'delivery') {
            const requiredFields = ['shipping_address', 'shipping_city', 'shipping_postal_code', 'shipping_country'];
            const missing = requiredFields.find(field => !formData[field]);
            if (missing) {
                setPhoneError("Please fill in all delivery address fields.");
                return;
            }
        }

        onSubmit(formData); // Send back to parent for processing
    };

    return (
        <div className="shipping-form-modal">
            <h3>{formData.delivery_method === 'pickup' ? 'Pickup Details' : 'Enter Delivery Information'}</h3>

            <form onSubmit={handleSubmit} className="shipping-form">

                <div className="shipping-form-group">
                    <label className="shipping-radio-option">
                        <input
                            type="radio"
                            name="delivery_method"
                            value="delivery"
                            checked={formData.delivery_method === 'delivery'}
                            onChange={handleChange}
                        />
                        <span className="shipping-custom-radio"></span>
                        Delivery
                    </label>
                    <label className="shipping-radio-option">
                        <input
                            type="radio"
                            name="delivery_method"
                            value="pickup"
                            checked={formData.delivery_method === 'pickup'}
                            onChange={handleChange}
                        />
                        <span className="shipping-custom-radio"></span>
                        Pickup
                    </label>
                </div>

                <input
                    type="text"
                    name="shipping_name"
                    placeholder="Recipient Name"
                    value={formData.shipping_name}
                    onChange={handleChange}
                    required
                />
                <input
                    type="text"
                    name="shipping_phone"
                    placeholder="Phone Number"
                    value={formData.shipping_phone}
                    onChange={handleChange}
                    required
                />

                {formData.delivery_method === 'delivery' && (
                    <>
                        <input
                            type="text"
                            name="shipping_address"
                            placeholder="Address Line 1"
                            value={formData.shipping_address}
                            onChange={handleChange}
                            required
                        />
                        <input
                            type="text"
                            name="shipping_city"
                            placeholder="City"
                            value={formData.shipping_city}
                            onChange={handleChange}
                            required
                        />
                        <input
                            type="text"
                            name="shipping_postal_code"
                            placeholder="Postal Code"
                            value={formData.shipping_postal_code}
                            onChange={handleChange}
                            required
                        />
                        <input
                            type="text"
                            name="shipping_country"
                            placeholder="Country"
                            value={formData.shipping_country}
                            onChange={handleChange}
                            required
                        />
                    </>
                )}

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
