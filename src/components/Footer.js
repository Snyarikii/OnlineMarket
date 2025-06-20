import React from 'react';

/**
 * Footer component: Displays the footer section of the website.
 * Includes columns for help links (FAQ, Customer service, etc.) and other links (Privacy Policy, Terms of Service).
 */
function Footer() {
  return (
    <footer className="footer">
      <div className="footer-links-column">
        <h4>Help</h4>
        <ul>
          <li><a href="#faq">FAQ</a></li>
          <li><a href="#customer-service">Customer service</a></li>
          <li><a href="#how-to-guides">How to guides</a></li>
          <li><a href="#contact-us">Contact us</a></li>
        </ul>
      </div>
      <div className="footer-links-column">
        <h4>Other</h4>
        <ul>
          <li><a href="#privacy-policy">Privacy Policy</a></li>
          <li><a href="#terms-of-service">Terms of service</a></li>
          <li><a href="#subscriptions">Subscriptions</a></li>
        </ul>
      </div>
    </footer>
  );
}

export default Footer;
