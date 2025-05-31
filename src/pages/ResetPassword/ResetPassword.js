import React from "react";
import styles from './ResetPassword.css';
import { Link ,useNavigate } from 'react-router-dom';

const ResetPassword = () => {
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
                            type='password'
                            placeholder="New Password"
                            required
                        /><br /><br/>
                        <input
                            className="reset-input"
                            type="password"
                            placeholder="Confirm New Password"
                            required
                         /><br/>
                    </div>
                    <button className="reset-btn">Change Password</button>
                </form>
            </div>
        </div>
    );
};
export default ResetPassword;