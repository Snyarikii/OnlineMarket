import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ProductDetails.css';

// --- Reusable Sub-Components ---

// A detailed header
const ProductHeader = () => (
    <header className="details-header">
        <div className="header-main">
            <h1>Flea Market</h1>
            <nav className="details-header-nav">
                <Link to="#">Account</Link>
                <Link to="/orders">Orders</Link>
                <Link to="/Cart">Cart</Link>
                <Link to='/Index'>Back</Link>
            </nav>
        </div>
    </header>
);

// A card for the "More from seller" section
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

// A detailed footer
const ProductFooter = () => (
    <footer className="details-footer">
        <div className="footer-main">
            <div className="footer-column-logo">
                <div className="footer-logo">Logo</div>
                {/* Add social icons here if needed */}
            </div>
            <div className="footer-column">
                <h4>Help</h4>
                <Link to="#">FAQ</Link>
                <Link to="#">Customer service</Link>
                <Link to="#">Contact us</Link>
            </div>
            <div className="footer-column">
                <h4>Other</h4>                
                <Link to="#">Sitemap</Link>
            </div>
        </div>
    </footer>
);


// --- Main Product Details Page Component ---

const ProductDetails = () => {
    const { productId } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [sellerProducts, setSellerProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
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

        fetchProductDetails();
    }, [productId]);

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
                { productId: product.id,
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
            <ProductHeader />
            
            <main className="details-main-content">
                <div className="breadcrumb">
                    <Link to="/Index">Home</Link> &gt; <Link to="#">All products</Link> &gt; {product.title}
                </div>

                <div className="product-display-section">
                    <div className="product-image-gallery">
                        <img src={imageUrl} alt={product.title} />
                    </div>
                    <div className="product-info-panel">
                        <h1 className="product-title">{product.title}</h1>
                        <p className="seller-info">Sold by: <strong>{product.seller_name}</strong></p>
                        <div className="product-reviews-placeholder">
                            <span>★★★★☆</span>
                            <a href="#">481 Reviews</a>
                        </div>
                        <p className="product-description">{product.description}</p>
                        
                        <div className="purchase-controls">
                             <div className="quantity-selector">
                                <label>Quantity</label>
                                <div>
                                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
                                    <span>{quantity}</span>
                                    <button onClick={() => setQuantity(q => q + 1)}>+</button>
                                </div>
                            </div>
                            <p className="product-price">Ksh {Number(product.price).toLocaleString()}</p>
                        </div>

                        <button className="add-to-bag-btn" onClick={handleAddToCart}>Add to Cart</button>
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
