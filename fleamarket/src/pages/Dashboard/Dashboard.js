import React, {useEffect, useState} from "react";
import { Link, useNavigate } from 'react-router-dom';
import axios from "axios";
import './Dashboard.css';
import logo from '../../assets/logo2.png'; 

const Dashboard = ({ setUser, setLoggingOut }) => {
    const [myProducts, setMyProducts] = useState([]);
    const [loading, setLoading ] = useState(true);
    const [userName, setUserName] = useState(''); 
    const navigate = useNavigate();

    const [searchQuery, setSearchQuery] = useState('');
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedPriceRange, setSelectedPriceRange] = useState('');
    const [selectedCondition, setSelectedCondition] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');

    
    useEffect(() => {
        const token = localStorage.getItem('token');
        if(!token) {
            alert("Please log in to view your dashboard.")
            navigate('/Login');
            return;
        }
        
        // Fetch user
        const fetchUserData = async () => {
            try {
                const res = await axios.get('http://localhost:3001/api/user/me', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUserName(res.data.name);
            } catch (err) {
                console.error("Failed to fetch user name", err);
            }
        };

        //Fetch seller's own products
        const fetchMyProducts = async () => {
            try {
                const response = await axios.get('http://localhost:3001/api/products/myProducts', {
                    headers: { Authorization: `Bearer ${token}`}
                });
                setMyProducts(response.data);
            } catch (err) {
                console.error("Error fetching products", err);
                setMyProducts([]);
                alert("Your session may have expired. Please log in again.");
                navigate('/Login');
            } finally {
                setLoading(false);
            }
        };
        
        //Fetch currently available categories in the marketplace
        const fetchCategories = async () => {
            try {
                const response = await axios.get('http://localhost:3001/api/categories', {
                    headers: { 'Authorization' : `Bearer ${token}` }
                });
                setCategories(response.data);
            } catch (err) {
                console.error("Error fetching categories", err);
            }
        };

        fetchUserData();
        fetchMyProducts();
        fetchCategories();
    }, [navigate]);

    //Filtering by search, category, condition, Price range, and status
    useEffect(() => {
        let filtered = [...myProducts];
        
        if(searchQuery.trim() !== '') {
            filtered = filtered.filter(product => 
                product.title.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        if(selectedCategory.trim() !== '') {
            filtered = filtered.filter(product =>
                product.category_id === Number(selectedCategory)
            );
        }
        if(selectedCondition.trim() !== '') {
            filtered = filtered.filter(product => 
                product.product_condition === selectedCondition
            );
        }
        if(selectedPriceRange.trim() !== '') {
            const [minStr, maxStr] = selectedPriceRange.split('-');
            const min = Number(minStr);
            const max = maxStr ? Number(maxStr) : Infinity;

            filtered = filtered.filter(product => {
                const price = Number(product.price);
                return price >= min && price <= max;
            });
        }
        if(selectedStatus.trim() !== '') {
            filtered = filtered.filter(product => 
                product.status === selectedStatus
            );
        }
        setFilteredProducts(filtered);
    }, [searchQuery, myProducts, selectedCategory, selectedCondition, selectedPriceRange, selectedStatus]);

    //Logout function
    function LogOut() {
        const confirmLogout = window.confirm("Are you sure you want to log out?");
        if(!confirmLogout) return;

        if (setLoggingOut && setUser) {
            setLoggingOut(true);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
            navigate('/');
            setTimeout(() => setLoggingOut(false), 500);
        } else {
            localStorage.clear();
            navigate('/');
        }
    };

    return(
        // Header
        <div className="dashboard-page-body">
            <header className="marketplace-header">
                <Link to="/Dashboard" className="header-logo-link">
                    <img src={logo} alt="Flea Market Logo" className="header-logo-img" />
                    <span className="header-logo-text">Flea Market</span>
                </Link>
                <div className="header-search-bar">
                    <input 
                        type="text" 
                        placeholder="Search my products..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
                <nav className="header-nav-links">
                    {userName && <span className="user-greeting">Hi, {userName.split(' ')[0]}</span>}
                    <Link to='/add-product'>Add Product</Link>
                    <Link to='/dashboard/orders'>View Orders</Link>
                    <Link to='/SellerSettings'>My Account</Link>
                    <a onClick={LogOut} className="logout-link">Log Out</a>
                </nav>
            </header>

            {/*Side Bar*/}
            <main className="dashboard-main-content">
                <aside className="dashboard-filters-sidebar">
                    <h3>Filters</h3>
                    <div className="dashboard-filter-group">
                        <label>Product status</label>
                        <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                            <option value="">Any status</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                    
                    <div className="dashboard-filter-group">
                        <label>Category</label>
                        <select onChange={(e) => setSelectedCategory(e.target.value)}>
                            <option value=''>All categories</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="dashboard-filter-group">
                        <label>Price Range</label>
                        <select value={selectedPriceRange} onChange={(e) => setSelectedPriceRange(e.target.value)}>
                            <option value="">Any Price</option>
                            <option value="0-1000">Below Ksh 1,000</option>
                            <option value="1000-5000">Ksh 1,000 - Ksh 5,000</option>
                            <option value="5000-10000">Ksh 5,000 - Ksh 10,000</option>
                            <option value="10000-"> Above Ksh 10,000</option>
                        </select>
                    </div>
                    <div className="dashboard-filter-group">
                        <label>Condition</label>
                        <select  onChange={(e) => setSelectedCondition(e.target.value)}>
                            <option value="">Any Condition</option>
                            <option value="New">New</option>
                            <option value="Used - Like New">Used - Like New</option>
                            <option value="Used - Good">Used - Good</option>
                            <option value="Used - Fair">Used - Fair</option>
                        </select>
                    </div>
                </aside>
                
                <div className="dashboard-grid-container">
                    <h1 className="dashboard-main-title">My Products</h1>
                    {loading ? (
                        <p>Loading your products...</p>
                    ) : myProducts.length === 0 ? (
                        <p>You currently don't have products. Click Add products to list your product for sale.</p>
                    ) : filteredProducts.length === 0 ? (
                        <p>No products match your search.</p>
                    ) : (
                        <div className="dashboard-items-grid">
                            {filteredProducts.map(item => (
                                <div key={item.id} className="dashboard-item-card">
                                    <img
                                        src={item.image_url ? `http://localhost:3001/uploads/${item.image_url}` : 'https://via.placeholder.com/150'}
                                        alt={item.title}
                                        className="dashboard-item-image"
                                    />
                                    <div className="dashboard-item-info">
                                        <h3>{item.title}</h3>
                                        <p>Price: Ksh {Number(item.price).toLocaleString()}</p>
                                        <p>Condition: {item.product_condition}</p>
                                        <p>Status: <span className={`status-pill status-${item.status}`}>{item.status}</span></p>
                                        <p>Stock: {item.stock_quantity}</p>
                                        <button className="dashboard-update-btn" onClick={() => navigate(`/UpdateProduct/${item.id}`)}>Update Product</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
            <footer className="dashboard-footer">
                <p>&copy; {new Date().getFullYear()} FleaMarket. All Rights Reserved.</p>
            </footer>
        </div>
    );
};

export default Dashboard;
