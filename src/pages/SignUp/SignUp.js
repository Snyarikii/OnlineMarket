import React, {useState, useEffect, useRef} from "react";
import styles from './SignUp.css';
import { Link, useNavigate } from "react-router-dom";

const SignUp = () => {
    return (
        <div className="signup-body">
            <header className="signup-header">
                <h1 className="signup-h1">Flea Market</h1>
                <nav className="signup-nav"> 
                    <Link to='/Login' className="signup-back-link">Back</Link>
                </nav>
            </header>
            <div className="signup-container">
                <div className="signup-form">
                    <h2>Sign Up</h2>
                    <div className="signup-input-fields">
                        <input
                            className="signup-input"
                            type="text"
                            placeholder="First Name"
                            required
                        /><br/>
                        <input
                            className="signup-input"
                            type="text"
                            placeholder="Last Name"
                            required
                        /><br/>
                        <input
                            className="signup-input"
                            type="email"
                            placeholder="Email"
                            required
                        /><br/>
                        <input
                            className="signup-input"
                            type="password"
                            placeholder="Password"
                            required
                        /><br/>
                        <select className="signup-role">
                            <option value={''}>Select your role</option>
                            <option value={'Buyer'}>Buyer</option>
                            <option value={'Seller'}>Seller</option>
                        </select>                        
                    </div><br/>
                    <button className="signup-btn">Register</button>
                </div>
            </div>
        </div>
    )
}
export default SignUp;