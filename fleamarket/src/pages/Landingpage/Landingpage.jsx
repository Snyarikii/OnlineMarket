import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css'; // Corrected import for standard CSS
import logo from '../../assets/logo2.png'; // 1. IMPORT YOUR LOGO HERE

const LandingPage = () => {
    return (
        <div className="lp-container">
            {/* Header */}
            <header className="lp-header">
                <div className="lp-logo">
                     <Link to="/">
                        <img src={logo} alt="Flea Market Logo" className="lp-logo-img" />
                    </Link>
                </div>
                <nav className="lp-nav-center">
                    <Link to="#">[Account]</Link>
                    <Link to="#">[Orders]</Link>
                    <Link to="#">[Cart]</Link>
                </nav>
                <div className="lp-nav-right">
                    <Link to="/Login" className="lp-nav-btn lp-login-btn">Log In</Link>
                    <Link to="/SignUp" className="lp-nav-btn lp-signup-btn">Sign Up</Link>
                </div>
            </header>

            <main>
                {/* Hero Section */}
                <section className="lp-section lp-hero">
                    <h1>Flea Market</h1>
                    <p>Where you trade smarter</p>
                    <button className="lp-shop-now-btn">Shop now</button>
                </section>

                {/* Features Section */}
                <section className="lp-section lp-features-bg">
                    <div className="lp-features-grid">
                        <div className="lp-feature-item">Fashion</div>
                        <div className="lp-feature-item">Electronics</div>
                        <div className="lp-feature-item">Books and stationery</div>
                    </div>
                </section>

                {/* New Products Section */}
                <section className="lp-section lp-new-products-bg">
                    <div className="lp-section-title">
                        <h2>[text]</h2>
                        <p>[text]</p>
                    </div>
                    <div className="lp-products-grid">
                        {/* Product Card 1 */}
                        <div className="lp-product-card">
                            <div className="lp-product-badge">NEW PRODUCT</div>
                            <div className="lp-product-image-placeholder"></div>
                            <h3>[text]</h3>
                            <p>[text]</p>
                            <button className="lp-buy-now-btn">Buy now</button>
                        </div>
                        {/* Product Card 2 */}
                        <div className="lp-product-card">
                            <div className="lp-product-badge">NEW PRODUCT</div>
                            <div className="lp-product-image-placeholder"></div>
                            <h3>[text]</h3>
                            <p>[text]</p>
                            <button className="lp-buy-now-btn">Buy now</button>
                        </div>
                        {/* Product Card 3 */}
                        <div className="lp-product-card">
                            <div className="lp-product-badge">NEW PRODUCT</div>
                            <div className="lp-product-image-placeholder"></div>
                            <h3>[text]</h3>
                            <p>[text]</p>
                            <button className="lp-buy-now-btn">Buy now</button>
                        </div>
                    </div>
                </section>

                {/* Split Content Section */}
                <section className="lp-section lp-split-section">
                    <div className="lp-split-left">
                        <h2>[text]</h2>
                        <p>[text]</p>
                    </div>
                    <div className="lp-split-right">
                        <div className="lp-small-card">
                            <div className="lp-small-card-img"></div>
                            <div className="lp-small-card-text">
                                <h4>$9</h4>
                                <p>[text]</p>
                            </div>
                        </div>
                        <div className="lp-small-card">
                            <div className="lp-small-card-img"></div>
                            <div className="lp-small-card-text">
                                <h4>$9</h4>
                                <p>[text]</p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="lp-footer">
                <div className="lp-footer-grid">
                    <div className="lp-footer-col">
                        <div className="lp-logo">[Logo]</div>
                        <p>Let's stay in touch! Sign up to our newsletter for exclusive updates.</p>
                        <div className="lp-social-icons">
                            {/* In a real app, these would be icons */}
                            <Link to="#">F</Link>
                            <Link to="#">I</Link>
                        </div>
                    </div>
                    <div className="lp-footer-col">
                        <p>Insert your email address here</p>
                        <div className="lp-newsletter-form">
                            <input type="email" placeholder="Email address" />
                            <button>Subscribe now</button>
                        </div>
                    </div>
                    <div className="lp-footer-col">
                        <h4>Help</h4>
                        <Link to="#">FAQ</Link>
                        <Link to="#">Customer service</Link>
                        <Link to="#">How to guides</Link>
                        <Link to="#">Contact us</Link>
                    </div>
                    <div className="lp-footer-col">
                        <h4>Other</h4>
                        <Link to="#">Privacy Policy</Link>
                        <Link to="#">Terms of Service</Link>
                        <Link to="#">Subscriptions</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;