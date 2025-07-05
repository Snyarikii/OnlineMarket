import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios'; // Using axios for consistency
import './AddProduct.css'; 
import logo from '../../assets/logo2.png'; // Import the logo

const AddProduct = ({ setUser, setLoggingOut }) => {
    const navigate = useNavigate();

    // State for the form fields
    const [product, setProduct] = useState({
        title: '',
        description: '',
        price: '',
        stock_quantity: '',
        category_id: '',
        condition: 'New',
    });
    const [imageFile, setImageFile] = useState(null);
    const [categories, setCategories] = useState([]);
    const [userName, setUserName] = useState(''); // State for user's name

    // State for UI feedback
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert("You must be logged in to add a product.");
            navigate('/Login');
            return;
        }

        const fetchInitialData = async () => {
            try {
                // Fetch user's name
                const userRes = await axios.get('http://localhost:3001/api/user/me', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUserName(userRes.data.name);

                // Fetch categories
                const categoriesRes = await axios.get('http://localhost:3001/api/categories', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setCategories(categoriesRes.data);
                if (categoriesRes.data.length > 0) {
                    setProduct(p => ({ ...p, category_id: categoriesRes.data[0].id }));
                }
            } catch (err) {
                console.error("Error fetching initial data:", err);
                setError('Failed to load page data. Please try refreshing.');
            }
        };

        fetchInitialData();
    }, [navigate]);

    const handleInputChange = (e) => {
        setProduct({ ...product, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setImageFile(e.target.files[0]);
    };
    
    // Logout function
    function LogOut() {
        const confirmLogout = window.confirm("Are you sure you want to log out?");
        if (!confirmLogout) return;

        // This function will work even if props are not passed from App.js
        if (setLoggingOut && setUser) {
            setLoggingOut(true);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
            setTimeout(() => setLoggingOut(false), 500);
        } else {
            localStorage.clear();
        }
        navigate('/');
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');

        if (!imageFile) {
            setError('Please upload an image for the product.');
            setIsLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append('title', product.title);
        formData.append('description', product.description);
        formData.append('price', product.price);
        formData.append('stock_quantity', product.stock_quantity);
        formData.append('category_id', product.category_id);
        formData.append('condition', product.condition);
        formData.append('productImage', imageFile);
        
        const token = localStorage.getItem('token');

        try {
            const response = await axios.post('http://localhost:3001/api/products', formData, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                },
            });

            setSuccess('Product created successfully! It is now pending admin approval.');
            e.target.reset(); // Clear form inputs
            setProduct({ title: '', description: '', price: '', stock_quantity: '', category_id: categories[0]?.id || '', condition: 'New' });
            setImageFile(null);
            // Optionally navigate away after a delay
            setTimeout(() => navigate('/Dashboard'), 2000);

        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create product.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="add-product-page-body">
            {/* Updated Header */}
            <header className="marketplace-header">
                <Link to="/Dashboard" className="header-logo-link">
                    <img src={logo} alt="Flea Market Logo" className="header-logo-img" />
                    <span className="header-logo-text">Flea Market</span>
                </Link>
                <nav className="header-nav-links">
                    {userName && <span className="user-greeting">Hi, {userName.split(' ')[0]}</span>}
                    <Link to="/Dashboard">My Dashboard</Link>
                    <Link to="/dashboard/orders">View Orders</Link>
                    <a onClick={LogOut} className="logout-link">Log Out</a>
                </nav>
            </header>
            <main className="page-main">
                <div className="form-container">
                    <h2 className="form-title">Create a New Listing</h2>
                    <p className="form-subtitle">Fill out the details below to put your product up for sale.</p>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="title">Product Title</label>
                            <input type="text" id="title" name="title" value={product.title} onChange={handleInputChange} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="description">Description</label>
                            <textarea id="description" name="description" value={product.description} onChange={handleInputChange} rows="4" required></textarea>
                        </div>
                        
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="price">Price (Ksh)</label>
                                <input type="number" id="price" name="price" value={product.price} onChange={handleInputChange} min="1" step="any" required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="stock_quantity">Stock Quantity</label>
                                <input type="number" id="stock_quantity" name="stock_quantity" value={product.stock_quantity} onChange={handleInputChange} min="1" required />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="condition">Condition</label>
                                <select id="condition" name="condition" value={product.condition} onChange={handleInputChange}>
                                    <option>New</option>
                                    <option>Used - Like New</option>
                                    <option>Used - Good</option>
                                    <option>Used - Fair</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="category_id">Category</label>
                                <select id="category_id" name="category_id" value={product.category_id} onChange={handleInputChange} required>
                                    <option value="" disabled>Select a category</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="productImage">Product Image</label>
                            <input type="file" id="productImage" name="productImage" onChange={handleFileChange} accept="image/png, image/jpeg" required />
                        </div>
                        
                        {error && <p className="form-message error">{error}</p>}
                        {success && <p className="form-message success">{success}</p>}
                        
                        <button type="submit" className="btn-submit" disabled={isLoading}>
                            {isLoading ? 'Listing Product...' : 'List My Product'}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default AddProduct;
