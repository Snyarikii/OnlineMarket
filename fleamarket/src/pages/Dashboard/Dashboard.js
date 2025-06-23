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
                alert("Could not fetch your products. Please try again.");
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
    }, [searchQuery, myProducts, selectedCategory]);

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
                    <a onClick={LogOut} className="dashboard-logout-link">Log Out</a>
                    <Link to='/add-product' className="dashboard-addProduct-link">Add product</Link>
                </nav>
            </header>
            <h1 className="dashboard-h1">My Products</h1>
            <div className="dashboard-container">
                <aside className="dashboard-filters-sidebar">
                    <h3>Filters</h3>
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
                                        <button className="dashboard-update-btn">Update Product</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
};

export default Dashboard;