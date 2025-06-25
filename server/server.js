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
const formatPhoneNumberServer = require('./utils/FormatPhoneNumber');
const stkPush = require('./functions/stkpush');

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
app.use((req, res, next) => {
    console.log(`📩 Incoming request: ${req.method} ${req.url}`);
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

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
        // console.log(user);
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

//Seller Get my products endpoint
app.get('/api/products/myProducts', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const sql = "SELECT * FROM products WHERE seller_id = ?";
    try {
        const [rows] = await con.promise().query(sql, [userId]);
        res.json(rows);
    } catch (error) {
        console.error("Error fetching seller products:", error);
        res.status(500).json({ error: "Failed to fetch seller products"});
    }
});
//Seller update order status
app.put('/api/orders/:orderId/status', authenticateToken, async (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;

    if(!['approved', 'rejected'].includes(status)) {
        return res.status(400).send("Invalid status");
    }

    try {
        await con.promise().query(
            "UPDATE orders SET order_status = ?, updated_at = NOW() WHERE id = ?",
            [status, orderId]
        );
        res.status(200).send("Order status updated");
    } catch (err) {
        console.error(err);
        res.status(500).send("Failed to update order status");
    }
});

//Buyer view product endpoint
app.get('/api/products/approved',authenticateToken, async (req, res) => {
    try {
        const [rows] = await con.promise().query(
            "SELECT id, category_id, seller_id, title, price, product_condition, image_url FROM products WHERE status = 'approved'"
        );
        res.json(rows);
    } catch (error) {
        console.error("Error fetching approved products:",error );
        res.status(500).json({ error: "Failed to fetch products"});
    }
});
//Buyer Add to card endpoint
app.post('/api/products/addToCart', authenticateToken, (req, res) => {
    const {productId, quantity} = req.body;
    const userId = req.user.id;

    if(!productId || !quantity) {
        return res.status(400).send("ProductID and quantity are required");
    }

    const sql = "INSERT INTO cart (user_id, product_id, quantity) VALUES (?,?,?) ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)";
    con.query(sql, [userId, productId, quantity], (err, result) => {
        if(err) {
            console.error(err);
            return res.status(500).send("Error adding to cart");
        }
        res.status(200).send("Product added to cart");
    });
});

//Get Buyer cart endpoint
app.get('/api/cart', authenticateToken, async (req, res) => {
    const userId = req.user.id;

    const sql = `
        SELECT products.*, cart.id AS cartId, cart.quantity
        FROM cart
        INNER JOIN products ON cart.product_id = products.id
        WHERE cart.user_id = ?
    `;

    try {
        const [rows] = await con.promise().query(sql, [userId]);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.json(500).send("Failed to fetch cart items.");
    }
});

//Buyer Remove from cart enpoint
app.delete('/api/cart/:cartId', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const { cartId } = req.params;

    const sql = `DELETE FROM cart WHERE id = ? AND user_id = ?`;
    con.query( sql, [cartId, userId ], (err, result) => {
        if(err) {
            console.error(err);
            return res.status(500).send("Error removing item from cart");
        }
        res.status(200).send("Item removed from cart");
    });
});

//Buyer update product quantity
app.put('/api/cart/:cartId', authenticateToken, async (req, res) => {
    const { quantity } = req.body;
    const userId = req.user.id;
    const cartId = req.params.cartId;

    if (quantity < 1) {
        return res.status(400).send("Quantity must be at least 1.");
    }

    try {
        const sql = "UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?";
        await con.promise().query(sql, [quantity, cartId, userId]);
        res.status(200).send("Cart item quantity updated successfully");
    } catch (err) {
        console.error(err);
        res.status(500).send("Failed to update cart item quantity.");
    }
});

//Buyer place order endpoint
app.post('/api/orders', authenticateToken, async(req, res) => {
    const buyerId = req.user.id;
    const { item_id, quantity, total_price } = req.body;
    // console.log(req.body);

    const sql = `
        INSERT INTO orders (buyer_id, item_id, quantity, total_price, order_status, order_date) 
        VALUES (?,?,?,?, 'pending', NOW())
    `;

    con.query(sql, [buyerId, item_id, quantity, total_price], (err, result) => {
        if(err) {
            console.error(err);
            return res.status(500).send("Error placing order.");
        }
        
        res.status(201).json({
            message: "Order placed successfully!",
            order_id: result.insertId
        });
        console.log(result.insertId);
    });
});
//Buyer get shipping info
app.get('/api/shipping/user/:userId', async (req, res) => {
    const userId = req.params.userId;
    const [rows] = await con.promise().query("SELECT * FROM shipping WHERE user_id = ?", [userId]);

    if(rows.length > 0) {
        return res.json(rows[0]);
    } else {
        return res.status(404).json({ message: "No shipping information found."});
    }
});

//Buyer place shipping info
app.post('/api/shipping', authenticateToken, async (req, res) => {
    const {
        order_id,
        recipient_name,
        address_line1,
        city,
        postal_code,
        country,
        phone_number,
        shipping_method,
    } = req.body;

    const user_id = req.user.id;
    
    try {
        const estimatedDeliveryDays = shipping_method === 'Delivery' ? 2 : 5;
        const [result] = await con.promise().execute(
            `INSERT INTO shipping 
            (user_id, order_id, recipient_name, address_line1, city, postal_code, country, phone_number, shipping_method, estimated_delivery_date, status)
            VALUES (?,?,?,?,?,?,?,?,?,DATE_ADD(NOW(), INTERVAL ? DAY),'Processing')
            `,
            [user_id, order_id, recipient_name, address_line1, city, postal_code, country, phone_number, shipping_method, estimatedDeliveryDays]

        );
        res.status(201).json({ message: "Shipping info added successfully.", shipping_id: result.insertId});
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to add shipping info."});
    }
});
//Buyer get orders with shipping
app.get('/api/orders/with-shipping', authenticateToken, async (req, res) => {
    const buyerId = req.user.id;

    try {
        const [rows] = await con.promise().query(`
            SELECT 
                o.id AS order_id,
                o.total_price,
                o.order_status,
                o.quantity,
                o.order_date,
                p.title,
                p.image_url,
                s.phone_number
            FROM orders o
            JOIN shipping s ON o.id = s.order_id
            JOIN products p on o.item_id = p.id
            WHERE o.buyer_id = ?
            `, [buyerId]);

            res.json(rows);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching orders with shipping data"});
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


// ENDPOINT: To get a single product's details ---
app.get('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        // This SQL query joins the products, users, and categories tables
        // to get all the info we need for the details page in one call.
        const sql = `
            SELECT p.*, u.name as seller_name, c.name as category_name 
            FROM products p
            LEFT JOIN users u ON p.seller_id = u.id
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.id = ? AND p.status = 'approved'
        `;
        const [rows] = await con.promise().query(sql, [id]);

        if (rows.length === 0) {
            // This happens if the product ID doesn't exist or isn't approved
            return res.status(404).json({ message: "Product not found or not available." });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error("Error fetching single product:", error);
        res.status(500).json({ error: "Failed to fetch product details." });
    }
});

//Seller update product endpoint
app.put('/api/products/:productId', authenticateToken, upload.single('image'), async (req, res) => {
    const { productId } = req.params;
    const { title, description, category_id, price, condition } = req.body;
    const imageFile = req.file;

    const updates = [category_id, title, description, price, condition];
    let sql = `UPDATE products SET category_id = ?, title = ?, description = ?, price = ?, product_condition = ?`;

    if(imageFile) {
        sql += `, image_url = ?`;
        updates.push(imageFile.filename);
    }

    sql += `WHERE id = ?`;
    updates.push(productId);

    try {
        await con.promise().query(sql, updates);
        res.send({ message: "Product updated successfully"});
    } catch (error) {
        console.error(error);
        res.status(500).send("Failed to update product");
    }
});


// --- endpoint To get other products from the same seller ---
app.get('/api/sellers/:sellerId/products', async (req, res) => {
    try {
        const { sellerId } = req.params;
        const { exclude: excludeProductId } = req.query; // This is used to exclude the current product

        const sql = `
            SELECT id, title, price, product_condition, image_url 
            FROM products 
            WHERE seller_id = ? AND status = 'approved' AND id != ?
            LIMIT 4
        `;
        const [rows] = await con.promise().query(sql, [sellerId, excludeProductId || 0]);
        res.json(rows);
    } catch (error) {
        console.error("Error fetching seller's products:", error);
        res.status(500).json({ error: "Failed to fetch seller's products." });
    }
});

// --- NEW ENDPOINT: Get a logged-in user's order history ---
app.get('/api/orders', authenticateToken, async (req, res) => {
    try {
        const buyerId = req.user.id; // Get the user's ID from the JWT token

        // This single query joins orders with products to get all info at once.
        const sql = `
            SELECT 
                o.id, 
                o.quantity, 
                o.total_price, 
                o.order_status, 
                o.order_date, 
                p.id as product_id, 
                p.title, 
                p.image_url 
            FROM orders o
            JOIN products p ON o.item_id = p.id
            WHERE o.buyer_id = ? 
            ORDER BY o.order_date DESC
        `;
        const [orders] = await con.promise().query(sql, [buyerId]);

        res.json(orders);

    } catch (error) {
        console.error("Error fetching user orders:", error);
        res.status(500).json({ error: "Failed to fetch order history." });
    }
});

// --- NEW ENDPOINT: Get all orders for a logged-in seller's products ---
app.get('/api/seller/orders', authenticateToken, async (req, res) => {
    try {
        const sellerId = req.user.id; // Get the seller's ID from the JWT token

        // This query joins the orders and products tables, filtering by the seller's ID
        // and retrieving the buyer's name from the users table.
        const sql = `
            SELECT 
                o.id as order_id, 
                o.quantity, 
                o.total_price, 
                o.order_status, 
                o.order_date, 
                p.title as product_title,
                u.name as buyer_name
            FROM orders o
            JOIN products p ON o.item_id = p.id
            JOIN users u ON o.buyer_id = u.id
            WHERE p.seller_id = ?
            ORDER BY o.order_date DESC
        `;
        const [orders] = await con.promise().query(sql, [sellerId]);

        res.json(orders);

    } catch (error) {
        console.error("Error fetching seller orders:", error);
        res.status(500).json({ error: "Failed to fetch your orders." });
    }
});

//Mpesa enpoints
app.post('/api/stk-push', async (req, res) => {
    const { phone, amount } = req.body;

    const formattedNumber = formatPhoneNumberServer(phone);
    try {
        const response = await stkPush(formattedNumber, amount);
        return res.json(response);
    } catch (error) {
        return res.status(500).json({ message: "Error processing STK push", error});
    }
});

app.post('/api/query-transaction', async (req, res) => {
    const {checkoutRequestID} = req.body;

    try{
        const response = await queryTransaction(checkoutRequestID);
        res.json(response);
    }catch(error){
        res.status(500).json({ message: 'Error querying transaction', error});
    }
});

//Mpesa Callback endpoint
app.post('/api/mpesa-callback', async (req, res) => {
    console.log("✅ Callback received:", req.body);

    const stkCallback = req.body?.Body?.stkCallback;

    if (!stkCallback) {
        console.error("❌ Invalid callback format.");
        return res.status(400).send("Invalid callback format.");
    }

    // Only process successful transactions
    if (stkCallback.ResultCode === 0) {
        const metadata = stkCallback.CallbackMetadata?.Item;

        const amount = metadata.find(item => item.Name === 'Amount')?.Value;
        const phoneNumber = String(metadata.find(item => item.Name === 'PhoneNumber')?.Value);

        if (!phoneNumber || !amount) {
            console.error("❌ Missing phone number or amount in callback.");
            return res.status(400).send("Missing required transaction data.");
        }

        console.log("📞 Phone:", phoneNumber, "| 💰 Amount:", amount);

        try {
            // Find order and user info by phone number
            const [shippingRow] = await con.promise().query(
                `SELECT s.user_id AS buyer_id, o.item_id, o.buyer_id, i.seller_id
                 FROM shipping s
                 JOIN orders o ON s.order_id = o.id
                 JOIN products i ON o.item_id = i.id
                 WHERE s.phone_number = ?
                 ORDER BY s.shipping_id DESC LIMIT 1`,
                [phoneNumber]
            );

            if (!shippingRow.length) {
                console.warn("⚠️ No matching shipping/order data for phone:", phoneNumber);
                return res.status(404).send("Matching order not found.");
            }

            const { item_id, buyer_id, seller_id } = shippingRow[0];

            // Insert transaction into DB
            await con.promise().execute(`
                INSERT INTO transactions 
                    (item_id, buyer_id, seller_id, amount, transaction_date, payment_method, status)
                VALUES (?, ?, ?, ?, NOW(), ?, ?)`,
                [item_id, buyer_id, seller_id, amount, 'Mpesa', 'Completed']
            );

            console.log(`✅ Transaction recorded for buyer ID: ${buyer_id}`);
            res.status(200).json({ message: 'Transaction saved successfully.' });

        } catch (err) {
            console.error("❌ Error saving transaction:", err);
            res.status(500).json({ error: "Failed to save transaction." });
        }
    } else {
        console.log("❌ Payment failed or cancelled");
        res.status(200).send("Transaction not successful.");
    }
});
