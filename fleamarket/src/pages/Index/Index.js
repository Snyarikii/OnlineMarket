import React, { useEffect, useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import './Index.css';
import axios from "axios";


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
                <Link to={`/product/${product.id}`} className="btn-view-product">View Details</Link>
            </div>
        </div>
    );
};

// Main Marketplace Page Component 
const Index = ({ setUser, setLoggingOut }) => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [categories, setCategories] = useState([]);


    const [searchQuery, setSearchQuery] = useState('');
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    

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

        const fetchCategories = async () => {
            try {
                const response = await axios.get('http://localhost:3001/api/categories', {
                    headers: {
                        'Authorization' : `Bearer ${token}`
                    }
                });
                setCategories(response.data);
            } catch (err) {
                console.error('Error fetching categories', err);
            }
        };
        fetchApprovedProducts();
        fetchCategories();
    }, [navigate], []);

    useEffect(() => {
        filterProducts();
    }, [searchQuery, products, selectedCategory]);


    const filterProducts = () => {
        let filtered = [...products];
        // console.log('Products:', products);

        if (searchQuery.trim() !== '') {
            filtered = filtered.filter(product => 
                product.title.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        
        if(selectedCategory.trim() !== '') {
            filtered = filtered.filter(product => 
                product.category_id === Number(selectedCategory)
            );
        }
        setFilteredProducts(filtered);
    };
    
    function LogOut() {
        const confirmLogout = window.confirm("Are you sure you want to log out?");
        if(!confirmLogout) return;

        setLoggingOut(true);
        
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        navigate('/');

        setTimeout(() => {
            setLoggingOut(false);
        }, 500);
    };

    return (
        <div className="marketplace-body">
            <header className="marketplace-header">
                <h1 className="index-header-logo">Flea Market</h1>
                <div className="index-header-search-bar">
                    <input 
                        type="text" 
                        placeholder="Search for products..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
                <nav className="index-header-nav-links">
                    <Link to="/orders">My Orders</Link>
                    <Link to="/Cart">Cart</Link>
                    <a onClick={LogOut}>Log out</a>
                </nav>
            </header>

            <main className="marketplace-main">
                <aside className="filters-sidebar">
                    <h3>Filters</h3>
                    <div className="filter-group">
                        <label>Category</label>
                        <select onChange={(e) => setSelectedCategory(e.target.value)}>
                            <option value="">All Categories</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
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
                            {filteredProducts.length > 0 ? (
                                filteredProducts.map(product => (
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