import React, { useState } from "react";
import axios from "axios";
import styles from './Login.css';
import { Link } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();

        try{
            const res = await axios.post("http://localhost:3001/api/login", {
                email,
                password,
            });

            if(res.data.success){
                setMessage("Login successful!");
                
            }else{
                setMessage(res.data.message);
                
            }
        }catch (err)  {
            setMessage("Error logging in.");
        }
    };

    return (

        <div className="login-body">
            <header className="login-header">
                <h1 className="login-h1">Flea Market</h1>
                <nav className="login-nav">
                    <Link to='/' className="login-back-link">Back</Link>
                </nav>
            </header>
            <div className="login-container">
                <form onSubmit={handleLogin} className="loginForm">
                    <h2>Welcome Back</h2>
                    <div className="login-input-fields">
                        <p className="loginMessage"> {message}</p>
                        <input
                            className="login-input"
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        /><br /><br />
                        <input
                            className="login-input"
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        /><br />
                    </div>
                    <Link to='/ResetPassword' className="reset-forgot-pass">Forgot Password?</Link>
                    <button type="submit" className="login-btn">Login</button>                    
                    <p className="dont-have-account">Dont' have an account? <Link to="/SignUp" className="dont-have-account-link" >Sign Up here!</Link></p>
                </form>
            </div>
         </div>
    );
};

export default Login;