import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Header component: Represents the top navigation bar of the application.
 * It includes the logo, navigation links (Account, Orders, Cart),
 * and authentication links (Log In, Sign Up).
 */
function Header() {
  return (
    <header className="header">
      <div className="header-left">
        {/* The Link component is used for client-side routing without full page reloads */}
        <Link to="/" className="logo">Logo</Link>
      </div>
      <nav className="header-nav">
        <ul>
          <li><Link to="/account">[Account]</Link></li>
          <li><Link to="/orders">[Orders]</Link></li>
          <li><Link to="/cart">[Cart]</Link></li>
        </ul>
      </nav>
      <div className="header-auth">
        <Link to="/Login">Log In</Link> {/* Matches your App.js route for Login */}
        <Link to="/SignUp">Sign Up</Link> {/* Matches your App.js route for SignUp */}
      </div>
    </header>
  );
}

export default Header;
