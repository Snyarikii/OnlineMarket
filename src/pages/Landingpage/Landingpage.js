import React from "react";
import axios from "axios";
import styles from './LandingPage.css';
import { Link, useNavigate } from "react-router-dom";

const LandingPage = () => {
    return(
        <div className="body">
            <header>
                <h1>Flea Market</h1>
                <nav>
                    <Link to="/Login" className="sign-in-link">Sign In</Link>
                </nav>
            </header>
            <section className="section1">
                <div className="motto">
                    <h2>Where You Trade Smarter</h2>
                    <p>A reliable campus marketplace where quality meets convenience. From books to fashion, find what you need.</p>
                </div>
            </section>
            <section className="section2">
                <h3>Shop for the best products.</h3>
                <div className="card-container">
                    <div className="card">
                        <img src={""} alt="fashion"></img>
                        <h4>Fashion</h4>
                        <p>Express your style with trendy outfits, shoes, and accessories for every occasion.</p>
                    </div>
                    <div className="card">
                        <img src={""} alt="Electronics"></img>
                        <h4>Electronics</h4>
                        <p>Upgrade your tech game with the latest gadgets and accessories</p>
                    </div>
                    <div className="card">
                        <img src={""} alt="Books and Stationary"></img>
                        <h4>Books and Stationary</h4>
                        <p>Stay ahead in your studies with essential reads and study tools.</p>
                    </div>
                    <div className="card">
                        <img src={""} alt="Health & Beauty"></img>
                        <h4>Health & Beauty</h4>
                        <p>Glow up with skincare, wellness products, and beauty essentials.</p>
                    </div>
                </div>
                <div className="engagement-section">
                    <h2>User Engagement</h2>
                    <div className="services">
                        <div className="service">
                            <h3>Rate Products</h3>
                            <p>Give a star rating to the products and help others discover the best products!</p>
                        </div>
                        <div className="service">
                            <h3>Add to Cart</h3>
                            <p>Found something you love? Add it to your cart and check out when you're ready!</p>
                        </div>
                        <div className="service">
                            <h3>Add To Favorites</h3>
                            <p>Keep track of your must-have items wiht a personalized favorites list.</p>
                        </div>
                        {/*<div className="service">
                            <h3>Order Tracking</h3>
                            <p>Know exactly where your order is and when it'll arrive - stay updated!</p>
                        </div>*/}
                    </div>
                </div>
            </section>
            <section className="get-started">
                <h3>Buy or Sell Products</h3>
                <div className="buttons">
                    <Link to="/Login">
                        <button className="buy-btn">Buy Products</button>
                    </Link>
                    <Link to="/Login">
                        <button className="sell-btn">Sell Your Products</button>
                    </Link>
                </div>
            </section>
            <footer>
                <p>&copy; 2025 Flea Market. All rights Reserved</p>
            </footer>
        </div>
    )
}
export default LandingPage;