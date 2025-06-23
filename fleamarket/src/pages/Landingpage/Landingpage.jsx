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

      </main>

      <footer className="footer">
        <div className="footer-grid">
          <div className="footer-column">
            <p>Your go-to marketplace for quality second-hand goods on campus.</p>
            <div className="social-icons">
                <Link to="/" className="social-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.85s-.011 3.584-.069 4.85c-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.069-4.85.069s-3.584-.011-4.85-.069c-3.225-.148-4.771-1.664-4.919-4.919-.058-1.265-.069-1.644-.069-4.85s.011-3.584.069-4.85c.149-3.225 1.664-4.771 4.919-4.919C8.416 2.175 8.796 2.163 12 2.163zm0 1.441c-3.2 0-3.556.012-4.786.069-2.913.132-4.225 1.433-4.356 4.356-.057 1.23-.068 1.585-.068 4.786s.011 3.556.068 4.786c.132 2.913 1.442 4.225 4.356 4.356 1.23.057 1.585.068 4.786.068s3.556-.011 4.786-.068c2.913-.132 4.225-1.442 4.356-4.356.057-1.23.068-1.585.068-4.786s-.011-3.556-.068-4.786c-.132-2.913-1.442-4.225-4.356-4.356C15.556 3.614 15.2 3.604 12 3.604zm0 4.865a3.532 3.532 0 100 7.064 3.532 3.532 0 000-7.064zm0 5.622a2.088 2.088 0 110-4.176 2.088 2.088 0 010 4.176zm4.965-7.854a.825.825 0 100 1.65.825.825 0 000-1.65z"/></svg>
                </Link>
                <Link to="/" className="social-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M13.397 20.997v-8.196h2.765l.411-3.209h-3.176V7.548c0-.926.258-1.56 1.587-1.56h1.684V3.127A22.336 22.336 0 0015.103 3c-2.422 0-4.085 1.47-4.085 4.179v2.37h-2.769v3.209h2.769v8.196h3.425z"/></svg>
                </Link>
            </div>
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
        <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} Flea Market. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
