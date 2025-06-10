import React, {useState, useEffect, useRef } from "react";
import styles from './ResetPassword.css';
import { Link ,useNavigate } from 'react-router-dom';
import axios from "axios";

const ResetPassword = () => {
    const navigate = useNavigate();

    const [newPassword, setNewPassword] =useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [strength, setStrength ] = useState('');
    const [passwordMatch, setPasswordMatch] = useState(false);
    const msgRef = useRef(null);
    const checkmarkRef = useRef(null);

    // Checks strength of password
    const checkPasswordStrength = (value) =>
    {
        // newPassword = e.target.value;
        setNewPassword(value);

        const msg = msgRef.current;
        let strongRegex = new RegExp("^(?=.*[a-z])(?=.*[0-9])(?=.*[!@#\\$%\\^&\\*])(?=.{8,})");

        if(!msg) return;

        if(strongRegex.test(newPassword)){
            setStrength("Strong password");
            msg.style.color="#26d730"
        }
        else{
            setStrength("Weak password");
            msg.style.color="#ff5925"
        }
        msg.style.display = value.length === 0 ? "none" : "block";
    };

    const handleConfirmPasswordChange = (value) => {
        // const newconfirmPassword = e.target.value;
        setConfirmPassword(value);
        setPasswordMatch(value === newPassword);
    }

    useEffect(() => {
        const checkmark = checkmarkRef.current;
        if(checkmark){
            if(strength === "Strong password" && passwordMatch) {
                checkmark.classList.remove('hidden');
            }else{
                checkmark.classList.add('hidden');
            }
        }
    }, [passwordMatch, strength]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if(newPassword !== confirmPassword) {
            setMessage('Passwords do not match.');
            return;
        }

        try{
            const res = await axios.post('http://localhost:3001/reset-password', {
                email,
                newPassword,
            });

            if(res.data.success) {
                setMessage('Password reset successful!');
                setTimeout(() => navigate('/Login'), 1500);
            } else {
                setMessage(res.data.error || "Password reset failed.");
            }
        } catch (error) {
            if(error.response && error.response.data.error) {
                setMessage(error.response.data.error);
            } else {
                setMessage("An error occurred. Please try again.");
            }
        }
    };



    return (
        <div className="reset-body">
            <header className="reset-header">
                <h1 className="reset-header-h1">Flea Market</h1>
                <nav className="reset-nav">
                    <Link to='/Login' className="reset-back-link">Back</Link>
                </nav>
            </header>
            <div className="reset-container">
                <form className="reset-form" onSubmit={handleSubmit}>
                    <h2>Reset Password</h2>
                    <div className="reset-input-fields">
                       <input
                            className="reset-input"
                            type="email"
                            placeholder="Email"
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        /><br/>
                       <input
                            className="reset-input"
                            type='password'
                            placeholder="New Password"
                            onChange={(e) => checkPasswordStrength(e.target.value)}
                            required
                        /><br />
                        <input
                            className="reset-input"
                            type="password"
                            placeholder="Confirm New Password"
                            onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                            required
                         /><br/>
                        <div className="reset-info">
                            <p ref={msgRef} style={{ display: 'none', fontFamily: 'Inter'}}>
                                {strength}
                            </p>
                            <span ref={checkmarkRef} className="hidden">&#10004;</span>
                            {message && <p className="reset-message">{message}</p>}
                        </div>
                    </div>
                    <button className="reset-btn">Change Password</button>
                </form>
            </div>
        </div>
    );
};
export default ResetPassword;