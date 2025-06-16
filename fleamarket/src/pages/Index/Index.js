import React, {useEffect, useState} from "react";
import { Link, useNavigate } from 'react-router-dom';
import styles from './Index.css';

const Index = () => {
    const navigate = useNavigate();

    const onLoad = () => {
        const token = localStorage.getItem('token');

        if(!token) {
            alert("You are not logged in. Redirect to Login page.");
            navigate('/Login');
        } else {
            fetch('http://localhost:3001/Index', {
                method: "GET",
                headers:{
                    'Authorization': `Bearer ${token}`
                }
            })
            .then(response => {
                if(response.status === 401 || response.status === 403) {
                    alert(" You are not logged in. Redirect to Login page.");
                    navigate('/Login');
                }
                return response.json();
            })
            .then(data => {
                console.log(data);
            })
            .catch(error => console.error("Error loading homepage: ", error));
        }
    };

    useEffect(()=>{
        onLoad()
    },[]);

    function LogOut(){
        // eslint-disable-next-line no-alert
        const confirmLogout = window.confirm("Are you sure you want to log out?");
        if(!confirmLogout){
            return;
        }
        const token = localStorage.getItem('token');
        if(token){
            fetch('http://localhost:3001/logout', {
                method: 'POST',
                headers: {
                    "Authorization" : `Bearer ${token}`
                }
            })
            .then(response => {
                if(response.ok){
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    navigate('/');
                } else {
                    console.error("Failed to log out on the server");
                }
            })
            .catch(error => console.error("Logout error", error));
        } else {
            console.log("No token found. redirecting to Login");
            navigate("/Login");
        }
    };

    return(
        <div className="index-body">
            <header className="index-header">
                <h1 className="index-h1">Flea Market</h1>
                <nav className="index-nav">
                    <Link to='/LandingPage' className="index-logout-link" onClick={LogOut}>Logout</Link>
                </nav>
            </header>

        </div>
    )
}

export default Index;