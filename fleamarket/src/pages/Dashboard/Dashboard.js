import React, {useEffect, useState} from "react";
import { Link, useNavigate } from 'react-router-dom';
import axios from "axios";
import './Dashboard.css';

const Dashboard = ({ setUser, setLoggingOut }) => {
    const [myProducts, setMyProducts] = useState([]);
    const [loading, setLoading ] = useState(true);
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
        const fetchMyProducts = async () => {
            if(!token) {
                alert("Please log in to view your products.")
                navigate('/Login');
                return;
            }

            try {
                const response = await axios.get('http://localhost:3001/api/products/myProducts', {
                    headers: { Authorization: `Bearer ${token}`}
                });
                setMyProducts(response.data);
            } catch (err) {
                console.error("Error fetching products", err);
                setMyProducts([]);
                alert("Your token has expired please log in again to continue.");
                navigate('/Login');
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
                console.error("Error fetching categories", err);
            }
        };

        fetchMyProducts();
        fetchCategories();
    }, [navigate], []);

    useEffect(() => {
        filterMyProducts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery, myProducts, selectedCategory, selectedCondition, selectedPriceRange, selectedStatus]);

    const filterMyProducts = () => {
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

    return(
        <div className="dashboard-body">
            <header className="dashboard-header">
                <h1 className="dashboard-h1">Flea Market</h1>
                <div className="dashboard-header-search-bar">
                    <input 
                        type="text" 
                        placeholder="Search my products..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
                <nav className="dashboard-nav">
                    <Link to='/add-product' className="dashboard-addProduct-link">Add product</Link>
                    <Link to='/dashboard/orders' className="dashboard-orders-link">View Orders</Link>
                    <a onClick={LogOut} className="dashboard-logout-link">Log Out</a>
                </nav>
            </header>
            <h1 className="dashboard-h1">My Products</h1>
            <div className="dashboard-container">
                <aside className="dashboard-filters-sidebar">
                    <h3>Filters</h3>
                    <div className="dashboard-filter-group">
                        <label>Product status</label>
                        <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                            <option value="">Any status</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>                            
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

                    {loading ? (
                        <p>Loading your products...</p>
                    ) : myProducts.length === 0 ? (
                        <p>You currently don't have products. Click Add products to list your product for sale.</p>
                    ) : filteredProducts.length === 0 ? (
                        <p>No products match your search.</p>
                    ) : (
                        <div className="dashboard-items">
                            {filteredProducts.map(item => (
                                <div key={item.id} className="dashboard-item">
                                    <img
                                        src={item.image_url ? `http://localhost:3001/uploads/${item.image_url}` : 'https://via.placeholder.com/100'}
                                        alt={item.title}
                                        className="dashboard-item-image"
                                    />
                                    <div className="dashboard-item-info">
                                        <h3>{item.title}</h3>
                                        <p>Price: Ksh {Number(item.price).toLocaleString()}</p>
                                        <p>Condition: {item.product_condition}</p>
                                        <p>Status: {item.status}</p>
                                        <button className="dashboard-update-btn" onClick={() => navigate(`/updateProduct/${item.id}`)}>Update Product</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <h4 className="status-information">Note: <p>Check your product status. If not approved, wait for admin approval. Approved products will be visible to buyers.</p></h4>
             <footer className="dashboard-footer">
                <p>&copy; 2025 FleaMarket. All Rights Reserved.</p>
            </footer>
        </div>
    );
};

export default Dashboard;