import React, { useState } from "react";
import axios from "axios";

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

        <div style={{ maxWidth: "400px", margin: "auto", padding: "1em" }}>
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            /><br /><br />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            /><br /><br />
            <button type="submit">Login</button>
            </form>
            <p>{message}</p>
        </div> 
    );
};

export default Login;