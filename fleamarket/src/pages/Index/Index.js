import React, { useEffect, useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import './Index.css';
import axios from "axios";

// --- Reusable Product Card Component ---
// This makes the main code cleaner and is a standard React practice.
const ProductCard = ({ product }) => {
    // Correctly construct the image URL based on your server setup
    const imageUrl = product.image_url ? `http://localhost:3001/uploads/${product.image_url}` : 'https://via.placeholder.com/300';

    return (
        <div className="product-card">
            <div className="product-card-image-container">
                <img src={imageUrl} alt={product.title} className="product-card-image" />
            </div>
            <div className="product-card-content">
                <h4 className="product-card-title">{product.title}</h4>
                <p className="product-card-price">Ksh {Number(product.price).toLocaleString()}</p>
                <p className="product-card-condition">{product.product_condition}</p>
                <button className="btn-view-product">View Details</button>
            </div>
        </div>
    );
};

// --- Main Marketplace Page Component ---
const Index = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // This hook runs once when the component loads
    useEffect(() => {
        // We still check for a token to ensure only logged-in users can browse
        const token = localStorage.getItem('token');
        if (!token) {
            alert("Please log in to browse the marketplace.");
            navigate('/Login');
            return;
        }

        const fetchApprovedProducts = async () => {
            try {
                // Fetching from the correct buyer-facing endpoint
                const response = await axios.get('http://localhost:3001/api/products/approved');
                setProducts(response.data);
            } catch (err) {
                console.error("Error fetching products:", err);
                setError("Failed to load products. The server might be down.");
            } finally {
                setLoading(false);
            }
        };

        fetchApprovedProducts();
    }, [navigate]);

    const handleLogout = () => {
        if (window.confirm("Are you sure you want to log out?")) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/');
        }
    };

    return (
        <div className="marketplace-body">
            <header className="marketplace-header">
                <div className="header-logo" onClick={() => navigate('/Index')}>FleaMarket</div>
                <div className="header-search-bar">
                    <input type="text" placeholder="Search for products..." />
                    <button>Search</button>
                </div>
                <nav className="header-nav-links">
                    <Link to="/add-product">Sell</Link>
                    <Link to="/orders">My Orders</Link>
                    <Link to="/cart">Cart</Link>
                    <button onClick={handleLogout} className="btn-logout">Logout</button>
                </nav>
            </header>

            <main className="marketplace-main">
                <aside className="filters-sidebar">
                    <h3>Filters</h3>
                    <div className="filter-group">
                        <label>Category</label>
                        <select><option>All Categories</option></select>
                    </div>
                    <div className="filter-group">
                        <label>Price Range</label>
                        <select><option>Any Price</option></select>
                    </div>
                    <div className="filter-group">
                        <label>Condition</label>
                        <select><option>Any Condition</option></select>
                    </div>
                </aside>

                <section className="products-grid-container">
                    {loading ? (
                        <p className="loading-text">Loading products...</p>
                    ) : error ? (
                        <p className="error-message">{error}</p>
                    ) : (
                        <div className="products-grid">
                            {products.length > 0 ? (
                                products.map(product => (
                                    <ProductCard key={product.id} product={product} />
                                ))
                            ) : (
                                <p>No products are currently available. Check back later!</p>
                            )}
                        </div>
                    )}
                </section>
            </main>
            
            <footer className="marketplace-footer">
                <p>&copy; 2025 FleaMarket. All Rights Reserved.</p>
            </footer>
        </div>
    );
};

export default Index;