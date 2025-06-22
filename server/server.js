require('dotenv').config({ path:__dirname + '/.env'});
//console.log("ACCESS_TOKEN_SECRET: ", process.env.ACCESS_TOKEN_SECRET);
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'uploads/'));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
})

const upload = multer({ storage: storage});

const app = express()
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
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



// const adminPassword = 'Admin12#';
// const saltRounds = 10;
// bcrypt.hash(adminPassword, saltRounds, (err, hash) => {
//     if(err) throw err;
//     console.log("Hashed password:", hash);
// });

// Login API
app.post("/api/login", (req, res) => {
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
app.get('/Index', authenticateToken, (req, res) => {
    res.json({ message: 'Welcome to the homepage!', user: req.user});
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

//Seller get categories endpoint
app.get('/api/categories', authenticateToken, async (req, res) => {
    try {
        const [categories] = await con.promise().query('SELECT id, name FROM categories');
        res.json(categories);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching categories'});
    }
});
//Seller Add product endpoint
app.post('/api/products', authenticateToken, upload.single('productImage'), async (req, res) => {
  try {
        const sellerId = req.user.id; // from your authentication middleware
        const { title, description, price, category_id, condition } = req.body;
        const imageUrl = req.file ? req.file.filename : null;
        const status = 'pending'; // New listings start as pending approval

        const [result] = await con.promise().query(
            `INSERT INTO products (seller_id, category_id, title, description, price, product_condition, status, image_url)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [sellerId, category_id, title, description, price, condition, status, imageUrl]
        );

        res.status(201).json({ message: 'Product created successfully.', productId: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error creating product.' });
    }
});

//Buyer view product endpoint
app.get('/api/products/approved', async (req, res) => {
    try {
        const [rows] = await con.promise().query(
            "SELECT id, title, price, product_condition, image_url FROM products WHERE status = 'approved'"
        );
        res.json(rows);
    } catch (error) {
        console.error("Error fetching approved products:",error );
        res.status(500).json({ error: "Failed to fetch products"});
    }
});

// Admin APIs
// Get all categories
app.get('/api/admin/categories', authenticateToken, (req, res) => {
    if(req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

    con.query("SELECT * FROM categories", (err, results) => {
        if(err) return res.status(500).json({ error: 'Database error'});
        res.json(results);
    });
});

// Add new category
app.post('/api/admin/categories', authenticateToken, (req, res) => {
    if(req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden'});

    const { name } = req.body;
    con.query("INSERT INTO categories (name) VALUES (?)", [name], (err, results) => {
        if(err) return res.status(500).json({ error: 'Database error'});
        res.json({ success : true, message: 'Category added successfully'});
    });
});

// Delete category
app.delete('/api/admin/categories/:id', authenticateToken, (req, res) => {
    if(req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden'});

    con.query("DELETE FROM categories WHERE id = ?", [req.params.id], (err, result) => {
        if(err) return res.status(500).json({ error: 'Database error'});
        res.json({ success: true, message: 'Category deleted successfully'});
    });
});

//Update category name by ID
app.put('/api/admin/categories/:id', authenticateToken, (req, res) => {
    if(req.user.role !=='admin') return res.status(403).json({ error: "Forbidden"});

    const { name } = req.body;
    const { id } = req.params;

    con.query("UPDATE categories SET name = ? WHERE id = ?", [name, id], (err, result) => {
        if(err) return res.status(500).json({ error: 'Database error'});
        res.json({ success: true, message: 'Category updated successfully'});
    });
});

//Get all users
app.get('/api/admin/users', (req, res) => {
    const sql = 'SELECT id, name, email, role FROM users';
    con.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err});
        res.json(results);
    });
});

//Delete user by ID
app.delete('/api/admin/users/:id', (req, res) => {
    const userId = req.params.id;
    const sql = "DELETE FROM users WHERE id = ?";
    con.query(sql, [userId], (err, result) => {
        if (err) return res.status(500).json({ error: err});
        res.json({ message: "User deleted successfully."});
    });
});

//Update user role
app.put('/api/admin/users/:id/role', (req, res) => {
    const userId = req.params.id;
    const { role } = req.body;

    if(!['buyer', 'seller', 'admin'].includes(role)) {
        return res.status(400).json({ error: "Invalid role."});
    }

    const sql = "UPDATE users SET role = ? WHERE id = ?";
    con.query(sql, [role, userId], (err, result) => {
        if (err) return res.status(500).json({ error: err});
        res.json({ message: 'User role updated successfully'});
    });
});

//Get all products
app.get('/api/admin/products', authenticateToken, async (req, res) => {
    try {
        const [rows] = await con.promise().query('SELECT * FROM products');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error fetching products"});
    }
});

//Admin approve product
app.put('/api/admin/products/:productId/approve', authenticateToken, async (req, res) => {
    const { productId } = req.params;
    try {
        await con.promise().query('UPDATE products SET status = ? WHERE id = ?', ['approved', productId]);
        res.json({ message: "Product approved successfully"});
    } catch (error) {
        console.error(err);
        res.status(500).json({ message: "Failed to approve product"});
    }
});

//Admin reject product
app.put('/api/admin/products/:productId/reject', authenticateToken, async (req, res) => {
    const { productId } = req.params;
    try {
        await con.promise().query('UPDATE products SET status = ? WHERE id = ?', ['rejected', productId]);
        res.json({ message: "Product rejected successfully"});
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to reject product"});
    }
});