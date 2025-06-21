import React, {useState, useEffect} from "react";
import axios from "axios";
import './ManageProducts.css';

const ManageProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchPendingProducts();
    }, []);

    const fetchPendingProducts = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:3001/api/admin/products', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            //Filter products that are pending
            const pending = res.data.filter(p => p.status === 'pending');
            setProducts(pending);
        } catch (error) {
            console.error('Error fetching products:', error);
            setMessage('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const approveProduct = async (productId) => {
        try {
            const token = localStorage.get('token');
            await axios.put(`http://localhost:3001/api/admin/products/${productId}/approve`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setProducts(products.filter(p => p.id !== productId));
            setMessage('Product approved successfully.');
        } catch (error) {
            console.error('Error approving product:', error);
            setMessage('Failed to approve product.');
        }
    };

    const rejectProduct = async (productId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:3001/api/admin/product/${productId}/reject`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setProducts(products.filter(p => p.id !== productId));
            setMessage('Product has been rejected!');
        } catch (error) {
            console.error('Error rejecting product', error);
            setMessage('Failed to reject product');
        }
    };

    return (
        <div className="manage-products-container">
            <h2>Manage Products</h2>
            {message && <p className="message">{message}</p>}
            {loading ? (
                <p>Loading products...</p>
            ) : products.length === 0 ? (
                <p>No pending products to review</p>
            ) : (
                <div className="products-grid">
                    {products.map(product => (
                        <div key={product.id} className="product-card">
                            <img
                                src={`http://localhost:3001/uploads/${product.image_url}`}
                                alt={product.title}
                                className="product-image"
                            />
                            <div className="product-details">
                                <h3>{product.title}</h3>
                                <p>{product.description}</p>
                                <p><strong>Price:</strong> Ksh {product.price}</p>
                                <p><strong>Condition: </strong> {product.product_condition}</p>
                                <div className="action-buttons">
                                    <button className="approve-btn" onClick={() => approveProduct(product.id)}>Approve</button>
                                    <button className="reject-btn" onClick={() => rejectProduct(product.id)}>Reject</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ManageProducts;