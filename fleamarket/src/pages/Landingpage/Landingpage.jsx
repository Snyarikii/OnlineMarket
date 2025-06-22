import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

// Import assets
import logo from '../../assets/logo2.png';
import fashionIcon from '../../assets/fashion.png';
import electronicsIcon from '../../assets/electronics.png';
import booksIcon from '../../assets/books.png';
import beautyIcon from '../../assets/beauty.png';

// --- Data for mapped components ---
const CATEGORIES = [
  {
    icon: fashionIcon,
    title: 'Fashion',
    description: 'Express your style with trendy outfits, shoes, and accessories for every occasion.',
  },
  {
    icon: electronicsIcon,
    title: 'Electronics',
    description: 'Upgrade your tech game with the latest gadgets and accessories.',
  },
  {
    icon: booksIcon,
    title: 'Books and Stationary',
    description: 'Stay ahead in your studies with essential reads and study tools.',
  },
  {
    icon: beautyIcon,
    title: 'Health & Beauty',
    description: 'Glow up with skincare, wellness products, and beauty essentials.',
  },
];

// --- Sub-components for better organization ---

// A reusable card for the "Shop for best products" section
const CategoryCard = ({ icon, title, description }) => (
  <div className="category-card">
    <img src={icon} alt={title} className="category-card-icon" />
    <h3 className="category-card-title">{title}</h3>
    <p className="category-card-description">{description}</p>
  </div>
);

// A reusable card for the "User Engagement" section
const EngagementCard = ({ title, children }) => (
    <div className="engagement-card">
        <h3>{title}</h3>
        <p>{children}</p>
    </div>
);


// --- Main Page Component ---

const LandingPage = () => {
  return (
    <div className="landing-page">
      <header className="landing-page-header">
        <Link to="/" className="header-logo-link">
          <img src={logo} alt="Flea Market Logo" className="header-logo-img" />
        </Link>
        <div className="header-actions">
          <Link to="/Login" className="btn btn-login">Log In</Link>
          <Link to="/SignUp" className="btn btn-signup">Sign Up</Link>
        </div>
      </header>

      <main>
        <section className="section hero-section">
          <h1 className="hero-title">Flea Market</h1>
          <p className="hero-subtitle">Where you trade smarter</p>
          <button className="btn btn-primary">Shop now</button>
        </section>

        <section className="section engagement-section">
          <div className="section-title">
            <h2>User Engagement</h2>
          </div>
          <div className="engagement-grid">
            <EngagementCard title="Rate Products">
                Give a star rating to the products and help others discover the best products!
            </EngagementCard>
            <EngagementCard title="Add to Cart">
                Found something you love? Add it to your cart and check out when you're ready!
            </EngagementCard>
            <EngagementCard title="Add To Favorites">
                Keep track of your must-have items with a personalized favorites list.
            </EngagementCard>
          </div>
          <div className="cta-container">
            <h3>Buy or Sell Products</h3>
            <div className="cta-buttons">
              <Link to="/Login" className="btn btn-secondary">Buy Products</Link>
              <Link to="/Login" className="btn btn-secondary">Sell Your Products</Link>
            </div>
          </div>
        </section>

        <section className="section categories-section">
          <div className="section-title">
            <h2>Shop for the best products.</h2>
          </div>
          <div className="categories-grid">
            {CATEGORIES.map((category) => (
              <CategoryCard
                key={category.title}
                icon={category.icon}
                title={category.title}
                description={category.description}
              />
            ))}
          </div>
        </section>

        <section className="section offers-section">
            <div className="offers-content">
                <h2>Offers</h2>
                <p>Check out our latest deals and discounts!</p>
            </div>
            <div className="offers-cards">
                <div className="offer-card">
                    <div className="offer-card-img-placeholder"></div>
                    <div className="offer-card-text">
                        <h4>$9</h4>
                        <p>Special Item</p>
                    </div>
                </div>
                <div className="offer-card">
                    <div className="offer-card-img-placeholder"></div>
                    <div className="offer-card-text">
                        <h4>$9</h4>
                        <p>Another Deal</p>
                    </div>
                </div>
            </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-grid">
          <div className="footer-column">
            <img src={logo} alt="Flea Market Logo" className="footer-logo-img" />
            <p>Let's stay in touch! Sign up to our newsletter for exclusive updates.</p>
          </div>
          <div className="footer-column">
            <p>Insert your email address here</p>
            <form className="newsletter-form">
              <input type="email" placeholder="Email address" />
              <button type="submit">Subscribe</button>
            </form>
          </div>
          <div className="footer-column">
            <h4>Help</h4>
            <Link to="#">FAQ</Link>
            <Link to="#">Customer Service</Link>
            <Link to="#">Contact Us</Link>
          </div>
          <div className="footer-column">
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