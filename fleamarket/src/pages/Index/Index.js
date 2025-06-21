import React, {useEffect, useState} from "react";
import { Link, useNavigate } from 'react-router-dom';
import './Index.css';
import axios from "axios";

const Index = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await axios.get('http://localhost:3001/api/products/approved');
            setProducts(response.data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching products:", err);
            setError("Failed to load products.");
            setLoading(false);
        }
    };

    const onLoad = () => {
        const token = localStorage.getItem('token');

        if(!token) {
            alert("You are not logged in. Redirect to Login page.");
            navigate('/Login');
        } else {
            fetch('http://localhost:3001/Index', {
                method: "GET",
                headers:{
                    'Authorization': `Bearer ${token}`
                }
            })
            .then(response => {
                if(response.status === 401 || response.status === 403) {
                    alert(" You are not logged in. Redirect to Login page.");
                    navigate('/Login');
                }
                return response.json();
            })
            .then(data => {
                console.log(data);
            })
            .catch(error => console.error("Error loading homepage: ", error));
        }
    };

    useEffect(()=>{
        onLoad()
    },[]);

    function LogOut(){
        // eslint-disable-next-line no-alert
        const confirmLogout = window.confirm("Are you sure you want to log out?");
        if(!confirmLogout){
            return;
        }
        const token = localStorage.getItem('token');
        if(token){
            fetch('http://localhost:3001/logout', {
                method: 'POST',
                headers: {
                    "Authorization" : `Bearer ${token}`
                }
            })
            .then(response => {
                if(response.ok){
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    navigate('/');
                } else {
                    console.error("Failed to log out on the server");
                }
            })
            .catch(error => console.error("Logout error", error));
        } else {
            console.log("No token found. redirecting to Login");
            navigate("/Login");
        }
    };

    return(
        <div className="index-body">
           {/* Header/Nav */}
           <header className="index-navbar">
            <div className="index-logo">FleaMarket</div>
            <nav className="index-nav-links">
                <a href='#'>Orders</a>
                <a href='#'>Cart</a>
                <Link to='/Login' onClick={LogOut}>Log out</Link>
            </nav>
            <div className="index-search-bar">
                <input type="text" placeholder="Search product" />
            </div>
           </header>

           {/* Hero section */}

            <section className="index-hero-section">
                <h2>Welcome to the Marketplace!</h2>
                <p>Discover great deals today.</p>
            </section>

            {/* Main content */}
            <div className="index-main-content">
                {/* Filter Sidebar */}
                <aside className="index-filters">
                    <h3>Filter</h3>
                    <select><option>Category</option></select>
                    <select><option>Price Range</option></select>
                    <select><option>Condition</option></select>
                </aside>

                {/* Products Grid */}
                <section className="index-products-grid">
                    {loading ? (
                        <p>Loading products...</p>
                    ) : error ? (
                        <p className="index-error">{error}</p>
                    ) : (
                        products.map(product => (
                            <div key={product.id} className="index-product-card">
                                <img src={`http://localhost:3001/uploads/${product.image_url}`} alt={product.title} />
                                <h4>{product.title}</h4>
                                <p className="index-price"> Ksh {product.price}</p>
                                <p className="index-condition">{product.product_condition}</p>
                            </div>
                        ))
                    )}
                </section>
            </div>
            {/* Footer */}
            <footer className="index-footer">
                <div className="index-footer-top">
                    <p>Let's keep in touch! join our newsletter</p>
                    <input type='email' placeholder="Enter your email" />
                    <button>Subscribe</button>
                </div>
                <div className="index-fotter-links">
                    <div>About us</div>
                    <div>Privacy policy</div>
                    <div>Terms</div>
                </div>
            </footer>
        </div>
    );
};

export default Index;