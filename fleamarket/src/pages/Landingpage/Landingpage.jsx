import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
const CategoryCard = ({ icon, title, description }) => (
  <div className="category-card">
    <img src={icon} alt={title} className="category-card-icon" />
    <h3 className="category-card-title">{title}</h3>
    <p className="category-card-description">{description}</p>
  </div>
);

const EngagementCard = ({ title, children }) => (
    <div className="engagement-card">
        <h3>{title}</h3>
        <p>{children}</p>
    </div>
);


// --- Main Page Component ---
const LandingPage = () => {
  const navigate = useNavigate();
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
          <button className="btn btn-primary" onClick={() => navigate('/Login')}>Shop now</button>
        </section>

        <section className="section engagement-section">
          <div className="section-title">
            <h2>User Engagement</h2>
          </div>
          <div className="engagement-grid">
            <EngagementCard title="Add to Cart">
                Found something you love? Add it to your cart and check out when you're ready!
            </EngagementCard>
            <EngagementCard title="Place Your Orders">
                Fill your cart with products you would like to purchase and place an order for them.
            </EngagementCard>
            <EngagementCard title="More from Seller">
                View what more sellers have to offer. View details of their product and scroll down to see more from them
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

      </main>

      <footer className="footer">
        <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} Flea Market. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
