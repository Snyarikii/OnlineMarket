require('dotenv').config({ path:__dirname + '/.env'});
console.log("ACCESS_TOKEN_SECRET: ", process.env.ACCESS_TOKEN_SECRET);
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express()
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Stevey-boy12$",
    database: "marketplace",
});
con.connect((err) =>{
    if(err){
        console.error("Mysql connection error", err);
    }else{
        console.log("Connected to the database");
    }
});

function authenticateToken(req, res, next){
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if(!token){
        return res.status(401).json({ message: 'No token provided'});
    }
    // if(!process.env.ACCESS_TOKEN_SECRET){
    //     throw new Error("ACCESS_TOKEN_SECRET is not defined in .env file");
    // }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if(err) {
            console.error("Token verification failed: ", err);
            return res.status(403).json({ message: "Invalid or expired token"});
        }
        req.user = user;
        next();
    });
};

// Login API
app.post("/api/login", (req, res) => {
    console.log("Login API hit");
    const {email, password } = req.body;

    const query = "SELECT * FROM users WHERE email = ?";
    con.query(query, [email], async (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error'});
        if(results.length === 0) return res.status(401).json({ error: 'Invalid email or password'});

        const user = results[0];
        const match = await bcrypt.compare( password, user.password_hash);

        if(match) {
           const payload = {
            id: user.id,
            email: user.email,
            role: user.role
           };
           const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h'});

           res.json({
            success: true,
            message: 'Login successful!',
            token: accessToken,
            user: {
                id: user.id,
                email: user.email,
                role:user.role
            }
           });
        } else {
            res.status(401).json({ error: 'Invalid email or password'});
        }
    });
});

// Logout
app.post('/logout', (req, res) => {
    res.status(200).send("Logged out successfully");
});

// Sign Up API
app.post('/register', async (req, res) => {
    const { fullName, Email, Password, role } = req.body;
    console.log('Received Information', req.body);

    try{
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(Password, saltRounds);
        const sql = "INSERT INTO users (name, email, password_hash, role) VALUES ( ?, ?, ?, ?)";
        const values = [ fullName, Email, hashedPassword, role ];
    
        con.query(sql,values, (err, result) => {
            if(err) {
                console.error(err);
                res.status(500).json("Error inserting user information!");
            } else {
                res.status(200).json({message: "User information inserted successfully!"});
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Reset Password API
app.post('/reset-password', async (req, res) => {
    const { email, newPassword } = req.body;   
    console.log('New password request:', req.body);

    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        const sql = "Update users SET password_hash = ? WHERE email = ?";
        con.query(sql, [hashedPassword, email], (err, result) =>{
            if(err) return res.status(500).json({ error: 'Database error' });
            if(result.affectedRows === 0) return res.status(404).json({ error: 'User not found' });

            res.json({ success: true, message: 'Password reset successfully!' });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error'});
    }
});

app.get('/posts', authenticateToken, (req, res) =>{
    const userPosts = posts.filter(post => post.email === req.user.email);
    res.json(userPosts);
});
app.post('/Index', authenticateToken, (req, res) => {
    res.json({ message: 'Welcome to the homepage!', user: req.user});
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});