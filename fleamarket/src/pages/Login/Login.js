import React, { useState } from "react";
import axios from "axios";
import styles from './Login.css';
import { Link, useNavigate } from 'react-router-dom';

const Login = ({ setUser }) => {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [showReactivate, setShowReactivate] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setMessage("");
        setShowReactivate(false);

        try {
            const res = await axios.post("http://localhost:3001/api/login", {
                email,
                password,
            });

            if (res.data.success) {
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('user', JSON.stringify(res.data.user));
                setUser(res.data.user);
                setMessage(res.data.message);

                //Navigate according to user role
                const userRole = res.data.user.role;
                setTimeout(() => {
                    if (userRole === 'buyer') {
                        navigate('/Index');
                    } else if (userRole === 'seller') {
                        navigate('/Dashboard');
                    } else if (userRole === 'admin') {
                        navigate('/Admin');
                    } else {
                        navigate('/');
                    }
                }, 1500);
            } else {
                setMessage(res.data.error || "Login failed");
            }

        } catch (err) {
            if (err.response) {
                const status = err.response.status;

                if (status === 403) {
                    setMessage("⚠️ Your account is deactivated.");
                    setShowReactivate(true);
                } else if (err.response.data && err.response.data.error) {
                    setMessage(err.response.data.error);
                } else {
                    setMessage("Login failed. Please try again.");
                }
            } else {
                setMessage("Error connecting to server.");
            }
        }
    };

    //Reactivate user after they click reactivate button
    const handleReactivate = async () => {
        try {
            const res = await axios.put("http://localhost:3001/api/users/reactivate", {
                email
            });

            alert("✅ Account reactivated! You can now log in.");
            setShowReactivate(false);
            setMessage("Your account has been reactivated. Please log in.");
        } catch (err) {
            console.error(err);
            alert("Failed to reactivate account. Try again later.");
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
                        <p className="loginMessage">{message}</p>
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

                    {showReactivate && (
                        <div className="reactivate-container">
                            <button
                                type="button"
                                onClick={handleReactivate}
                                className="reactivate-btn"
                            >
                                Reactivate Account
                            </button>
                        </div>
                    )}

                    <p className="dont-have-account">
                        Don't have an account? <Link to="/SignUp" className="dont-have-account-link">Sign Up here!</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;
