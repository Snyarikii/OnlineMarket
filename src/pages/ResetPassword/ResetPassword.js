import React, {useState, useEffect, useRef } from "react";
import styles from './ResetPassword.css';
import { Link ,useNavigate } from 'react-router-dom';

const ResetPassword = () => {
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [strength, setStrength ] = useState('');
    const [passwordMatch, setPasswordMatch] = useState(false);
    const msgRef = useRef(null);
    const checkmarkRef = useRef(null);

    // Checks strength of password
    const checkPasswordStrength = (e) =>
    {
        const newPassword = e.target.value;
        setPassword(newPassword);

        const msg = msgRef.current;
        let strongRegex = new RegExp("^(?=.*[a-z])(?=.*[0-9])(?=.*[!@#\\$%\\^&\\*])(?=.{8,})");

        if(!msg) return;

        if(strongRegex.test(password)){
            setStrength("Strong password");
            msg.style.color="#26d730"
        }
        else{
            setStrength("Weak password");
            msg.style.color="#ff5925"
        }
        msg.style.display = newPassword.length === 0 ? "none" : "block";
    };

    const handleConfirmPasswordChange = (e) => {
        const newconfirmPassword = e.target.value;
        setConfirmPassword(newconfirmPassword);
        setPasswordMatch(newconfirmPassword === password);
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



    return (
        <div className="reset-body">
            <header className="reset-header">
                <h1 className="reset-header-h1">Flea Market</h1>
                <nav className="reset-nav">
                    <Link to='/Login' className="reset-back-link">Back</Link>
                </nav>
            </header>
            <div className="reset-container">
                <form className="reset-form">
                    <h2>Reset Password</h2>
                    <div className="reset-input-fields">
                       <input
                            className="reset-input"
                            type="text"
                            placeholder="Email"
                            required
                        /><br/>
                       <input
                            className="reset-input"
                            type='password'
                            placeholder="New Password"
                            onKeyUp={checkPasswordStrength}
                            required
                        /><br />
                        <input
                            className="reset-input"
                            type="password"
                            placeholder="Confirm New Password"
                            onChange={handleConfirmPasswordChange}
                            required
                         /><br/>
                        <div className="reset-info">
                            <p ref={msgRef} style={{ display: 'none', fontFamily: 'Inter'}}>
                                {strength}
                            </p>
                            <span ref={checkmarkRef} className="hidden">&#10004;</span>
                        </div>
                    </div>
                    <button className="reset-btn">Change Password</button>
                </form>
            </div>
        </div>
    );
};
export default ResetPassword;