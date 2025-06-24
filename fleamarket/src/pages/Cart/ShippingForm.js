import React, {useState} from "react";
import axios from "axios";
import './ShippingForm.css';

const ShippingForm = ({ itemToOrder, onSubmit, onClose }) => {
    const [formData, setFormData] = useState({
        recipient_name:'',
        address_line1:'',
        city:'',
        postal_code:'',
        country:'',
        phone_number:'',
        shipping_method:'Delivery',
    });

    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        try {
            const response = await axios.post('http://localhost:3001/api/shipping', {
                order_id: itemToOrder.order_id,
                ...formData
            }, {
                headers: { Authorization: `Bearer ${token}`}
            });

            alert("Shipping info added successfully");
            onSubmit();
        } catch (err) {
            console.error("Error submitting shipping info:", err);
            alert("Could not save shipping info.");
        }
        // const response = await axios.post('http://localhost:3001/api/shipping', {
        //     ...formData,
        //     user_id: user.id
        // }, {
        //     headers: {Authorization: `Bearer ${token}`}
        // });
        // onSubmit(response.data.shipping_id);
    };

    return (
        <div className="shipping-form-modal">
            <h3>Enter Shipping Information</h3>
            <form onSubmit={handleSubmit} className="shipping-form">
                <input type="text" name="recipient_name" placeholder="Recipeint Name" value={formData.recipient_name} onChange={handleChange} required />
                <input type="text" name="address_line1" placeholder="Address Line 1" value={formData.address_line1} onChange={handleChange} required />
                <input type="text" name="city" placeholder="City" value={formData.city} onChange={handleChange} required />
                <input type="text" name="postal_code" placeholder="Postal Code" value={formData.postal_code} onChange={handleChange} required />
                <input type="text" name="country" placeholder="Country" value={formData.country} onChange={handleChange} required />
                <input type="text" name="phone_number" placeholder="Phone Number" value={formData.phone_number} onChange={handleChange} required />

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