import React, {useState, useEffect, useRef} from "react";
import axios from "axios";
import styles from './SignUp.css';
import { Link, useNavigate } from "react-router-dom";

const SignUp = () => {
    const [fullName, setfullName] = useState("");
    const [Email, setEmail] = useState("");
    const [Password, setPassword] = useState("");
    const [role, setRole] = useState('');

    const RegisterUser = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('http://localhost:3001/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ fullName, Email, Password, role }),
            });

            const data = await response.json();

            if(response.ok) {
                alert(data.message);
                console.log(data);
            } else {
                alert('Signup failed!');
            }
        } catch (error) {
            console.log("An error occured. Please try again");
        }
      
    }  

    return (
        <div className="signup-body">
            <header className="signup-header">
                <h1 className="signup-h1">Flea Market</h1>
                <nav className="signup-nav"> 
                    <Link to='/Login' className="signup-back-link">Back</Link>
                </nav>
            </header>
            <div className="signup-container">
                <form onSubmit={RegisterUser} className="signup-form">
                    <h2>Sign Up</h2>
                    <div className="signup-input-fields">
                        <input
                            className="signup-input"
                            type="text"
                            placeholder="Full Name"
                            onChange={(e) => setfullName(e.target.value)}
                            required
                        /><br/>
                        <input
                            className="signup-input"
                            type="email"
                            placeholder="Email"
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        /><br/>
                        <input
                            className="signup-input"
                            type="password"
                            placeholder="Password"
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        /><br/>
                        <select className="signup-role" onChange={(e) => setRole(e.target.value)} required>
                            <option value={''}>Select your role</option>
                            <option value={'Buyer'}>Buyer</option>
                            <option value={'Seller'}>Seller</option>
                        </select>                        
                    </div><br/>
                    <button className="signup-btn">Register</button>
                </form>
            </div>
        </div>
    )
}
export default SignUp;