import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ProductDetails.css';
import logo from '../../assets/logo2.png';

//More from seller 
const MiniProductCard = ({ product }) => {
    const imageUrl = product.image_url ? `http://localhost:3001/uploads/${product.image_url}` : `https://via.placeholder.com/200?text=${product.title}`;
    return (
        <Link to={`/product/${product.id}`} className="mini-product-card">
            <div className="mini-card-img-container">
                <img src={imageUrl} alt={product.title} />
            </div>
            <div className="mini-card-content">
                <p className="mini-card-price">Ksh {Number(product.price).toLocaleString()}</p>
                <p className="mini-card-title">{product.title}</p>
                <p className="mini-card-condition">{product.product_condition}</p>
            </div>
        </Link>
    );
};

//ProductDetails footer
const ProductFooter = () => (
    <footer className="details-footer">
        <div className="footer-main">
             <p>&copy; {new Date().getFullYear()} FleaMarket. All Rights Reserved.</p>            
        </div>
    </footer>
);

//Main Product Details Page
const ProductDetails = ({ setUser, setLoggingOut }) => {
    const { productId } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [sellerProducts, setSellerProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [userName, setUserName] = useState(''); 

    useEffect(() => {
        const token = localStorage.getItem('token');

        const fetchUserData = async () => {
            if (!token) return;
            try {
                const res = await axios.get('http://localhost:3001/api/user/me', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUserName(res.data.name);
            } catch (err) {
                console.error("Failed to fetch user name", err);
            }
        };

        const fetchProductDetails = async () => {
            setLoading(true);
            setError('');
            window.scrollTo(0, 0);

            try {
                const productRes = await axios.get(`http://localhost:3001/api/products/${productId}`);
                const mainProduct = productRes.data;
                setProduct(mainProduct);

                if (mainProduct && mainProduct.seller_id) {
                    const sellerProductsRes = await axios.get(`http://localhost:3001/api/sellers/${mainProduct.seller_id}/products`, {
                        params: { exclude: productId }
                    });
                    setSellerProducts(sellerProductsRes.data);
                }
            } catch (err) {
                console.error("Error fetching product details:", err);
                setError("Could not load product details. It may have been removed or is unavailable.");
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
        fetchProductDetails();
    }, [productId]);
    
    // Logout function
    function LogOut() {
        const confirmLogout = window.confirm("Are you sure you want to log out?");
        if (!confirmLogout) return;

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
    }

    //Buyer adding to cart
    const handleAddToCart = async () => {
        try {
            const token = localStorage.getItem('token');
            if(!token) {
                alert("Please log in to add items to your cart.");
                navigate('/Login');
                return;
            }

            await axios.post(
                'http://localhost:3001/api/products/addToCart',
                { 
                    productId: product.id,
                    quantity: quantity,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            alert("Product added to cart!");
        } catch (err) {
            console.error("Error adding product to cart:", err);
            alert("Failed to add product to cart. Please try again.");
        }
    };

    if (loading) return <p className="loading-message">Loading Product...</p>;
    if (error) return <p className="error-message">{error}</p>;
    if (!product) return <p className="info-message">Product not found.</p>;

    const imageUrl = product.image_url ? `http://localhost:3001/uploads/${product.image_url}` : 'https://via.placeholder.com/600x600';

    return (
        <div className="product-details-page">
            <header className="marketplace-header">
                <Link to="/Index" className="header-logo-link">
                    <img src={logo} alt="Flea Market Logo" className="header-logo-img" />
                    <span className="header-logo-text">Flea Market</span>
                </Link>
                <nav className="header-nav-links">
                    {userName && <span className="user-greeting">Hi, {userName.split(' ')[0]}</span>}
                    <Link to="/orders">My Orders</Link>
                    <Link to="/BuyerSettings">Account</Link>
                    <Link to="/Cart">Cart</Link>
                    <a onClick={LogOut} className="logout-link">Log out</a>
                </nav>
            </header>
            
            <main className="details-main-content">
                <div className="breadcrumb">
                   <Link to="/Index">All products</Link> &gt; {product.title}
                </div>

                <div className="product-display-section">
                    <div className="product-image-gallery">
                        <img src={imageUrl} alt={product.title} />
                    </div>
                    <div className="product-info-panel">
                        <h1 className="product-title">{product.title}</h1>
                        <p className="seller-info">Sold by: <strong>{product.seller_name}</strong></p>
                        
                        <p className="product-description">Contact: {product.seller_phone}</p>
                        <p className="product-description">Description: {product.description}</p>
                        
                        <div className="purchase-controls">
                            <div className="quantity-selector">
                                <label>Quantity</label>
                                <div>
                                    <button 
                                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                    >
                                        -
                                    </button>
                                    <span>{quantity}</span>
                                    <button 
                                        onClick={() => 
                                            setQuantity(q => Math.min(product.stock_quantity, q + 1))
                                        }
                                        disabled={quantity >= product.stock_quantity}
                                    >
                                        +
                                    </button>
                                </div>
                                <small className='stock-note'>
                                    In Stock: {product.stock_quantity}
                                </small>
                            </div>
                            <p className="product-price">Ksh {Number(product.price).toLocaleString()}</p>
                        </div>
                        {product.stock_quantity === 0 ? (
                            <div className='out-of-stock-overlay'>Out of Stock</div>
                        ) : (
                            <button className="add-to-bag-btn" onClick={handleAddToCart}>Add to Cart</button>                                    
                        )}
                    </div>
                </div>

                <section className="more-from-seller-section">
                    <h2>More from this Seller</h2>
                    <div className="more-products-grid">
                        {sellerProducts.length > 0 ? (
                            sellerProducts.map(p => <MiniProductCard key={p.id} product={p} />)
                        ) : (
                            <p className="info-message">This seller has no other products available.</p>
                        )}
                    </div>
                </section>
            </main>

            <ProductFooter />
        </div>
    );
};

export default ProductDetails;
