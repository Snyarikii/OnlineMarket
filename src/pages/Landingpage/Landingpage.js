import React from "react";
import axios from "axios";
import styles from './LandingPage.css';
import { Link, useNavigate } from "react-router-dom";

const LandingPage = () => {
    return(
        <div className="landingPage-body">
            <header className="landingPage-header">
                <h1 className="landingPage-h1">Flea Market</h1>
                <nav className="landingPage-nav">
                    <Link to="/Login" className="landingPage-sign-in-link">Sign In</Link>
                </nav>
            </header>
            <section className="landingPage-section1">
                <div className="landingPage-motto">
                    <h2>Where You Trade Smarter</h2>
                    <p>A reliable campus marketplace where quality meets convenience. From books to fashion, find what you need.</p>
                </div>
            </section>
            <section className="landingPage-section2">
                <h3>Shop for the best products.</h3>
                <div className="landingPage-card-container">
                    <div className="landingPage-card">
                        <img src={""} alt="fashion"></img>
                        <h4>Fashion</h4>
                        <p>Express your style with trendy outfits, shoes, and accessories for every occasion.</p>
                    </div>
                    <div className="landingPage-card">
                        <img src={""} alt="Electronics"></img>
                        <h4>Electronics</h4>
                        <p>Upgrade your tech game with the latest gadgets and accessories</p>
                    </div>
                    <div className="landingPage-card">
                        <img src={""} alt="Books and Stationary"></img>
                        <h4>Books and Stationary</h4>
                        <p>Stay ahead in your studies with essential reads and study tools.</p>
                    </div>
                    <div className="landingPage-card">
                        <img src={""} alt="Health & Beauty"></img>
                        <h4>Health & Beauty</h4>
                        <p>Glow up with skincare, wellness products, and beauty essentials.</p>
                    </div>
                </div>
                <div className="landingPage-engagement-section">
                    <h2>User Engagement</h2>
                    <div className="landingPage-services">
                        <div className="landingPage-service">
                            <h3>Rate Products</h3>
                            <p>Give a star rating to the products and help others discover the best products!</p>
                        </div>
                        <div className="landingPage-service">
                            <h3>Add to Cart</h3>
                            <p>Found something you love? Add it to your cart and check out when you're ready!</p>
                        </div>
                        <div className="landingPage-service">
                            <h3>Add To Favorites</h3>
                            <p>Keep track of your must-have items wiht a personalized favorites list.</p>
                        </div>
                        {/*<div className="landingPage-service">
                            <h3>Order Tracking</h3>
                            <p>Know exactly where your order is and when it'll arrive - stay updated!</p>
                        </div>*/}
                    </div>
                </div>
            </section>
            <section className="landingPage-get-started">
                <h3>Buy or Sell Products</h3>
                <div className="landingPage-buttons">
                    <Link to="/Login">
                        <button className="landingPage-buy-btn">Buy Products</button>
                    </Link>
                    <Link to="/Login">
                        <button className="landingPage-sell-btn">Sell Your Products</button>
                    </Link>
                </div>
            </section>
            <footer className="landingPage-footer">
                <p>&copy; 2025 Flea Market. All rights Reserved</p>
            </footer>
        </div>
    )
}
export default LandingPage;