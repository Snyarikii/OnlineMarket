require('dotenv').config({ path:__dirname + '/.env'});
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
// app.use((req, res, next) => {
//     console.log(`📩 Incoming request: ${req.method} ${req.url}`);
//     console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
//     next();
// });

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
    const { email, password } = req.body;

    const query = "SELECT * FROM users WHERE email = ?";
    con.query(query, [email], async (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (results.length === 0) return res.status(401).json({ error: 'Invalid email or password' });

        const user = results[0];
        const match = await bcrypt.compare(password, user.password_hash);

        // ✅ FIRST check if account is active
        if (!user.is_active) {
            return res.status(403).json({ message: "This account is deactivated." });
        }

        if (match) {
            const payload = {
                id: user.id,
                email: user.email,
                role: user.role
            };
            const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });

            return res.json({
                success: true,
                message: 'Login successful!',
                token: accessToken,
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role
                }
            });
        } else {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
    });
});
// User my account
app.get('/api/user/me', authenticateToken, async (req, res) => {
    const userId = req.user.id;

    try {
        const [rows] = await con.promise().query('SELECT name, email FROM users WHERE id = ?', [userId]);
        if(rows.length === 0) {
            return res.status(404).json({ error: "User not found"});
        }
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error"});
    }
});


// Logout
app.post('/logout', (req, res) => {
    res.status(200).send("Logged out successfully");
});

// Sign Up API
app.post('/register', async (req, res) => {
    const { fullName, Email, Password, role } = req.body;

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
                res.status(200).json({message: "User created successfully!"});
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
        const { title, description, price, stock_quantity, category_id, condition } = req.body;
        const imageUrl = req.file ? req.file.filename : null;
        const status = 'pending'; // New listings start as pending approval

        const [result] = await con.promise().query(
            `INSERT INTO products (seller_id, category_id, title, description, price, product_condition, status, image_url, stock_quantity)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [sellerId, category_id, title, description, price, condition, status, imageUrl, stock_quantity]
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

    if(!['delivered'].includes(status)) {
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

// //Seller statistics endpoint
// app.get('/api/seller/statistics', authenticateToken, async (req, res) => {
//     const sellerId = req.user.id;

//     const sql = `
//         SELECT 
//             SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) AS approved,
//             SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending,
//             SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) AS rejected,
//             COUNT(*) AS total
//         FROM products
//         WHERE seller_id = ?
//     `;

//     try {
//         const [rows] = await con.promise().query(sql, [sellerId]);

//         if (rows.length === 0) {
//             return res.status(404).json({ error: "No products found for seller." });
//         }

//         res.json(rows[0]); // return the statistics
//     } catch (err) {
//         console.error("Error fetching seller statistics:", err);
//         res.status(500).json({ error: "Internal server error" });
//     }
// });

// Seller statistics endpoint (Enhanced)
app.get('/api/seller/statistics', authenticateToken, async (req, res) => {
    const sellerId = req.user.id;

    try {
        // Query 1: Get product status counts from 'products' table
        const productStatsSql = `
            SELECT
                SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) AS approved,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending,
                SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) AS rejected,
                COUNT(id) AS total
            FROM products
            WHERE seller_id = ?
        `;
        const [productStatsRows] = await con.promise().query(productStatsSql, [sellerId]);

        // Query 2: Get sales stats from 'order_items' table
        const salesStatsSql = `
            SELECT
                SUM(total_price) AS totalRevenue,
                COUNT(DISTINCT order_id) AS totalOrders
            FROM order_items
            WHERE seller_id = ?
        `;
        const [salesStatsRows] = await con.promise().query(salesStatsSql, [sellerId]);

        // Query 3: Get top 5 best-selling products
        const topProductsSql = `
            SELECT
                p.title,
                SUM(oi.quantity) AS total_sold,
                SUM(oi.total_price) AS revenue
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.seller_id = ?
            GROUP BY p.title
            ORDER BY total_sold DESC
            LIMIT 5;
        `;
        const [topProducts] = await con.promise().query(topProductsSql, [sellerId]);

        // Combine all stats into the correct nested response object
        const response = {
            products: productStatsRows[0] || { approved: 0, pending: 0, rejected: 0, total: 0 },
            sales: {
                totalRevenue: salesStatsRows[0]?.totalRevenue || 0,
                totalOrders: salesStatsRows[0]?.totalOrders || 0,
            },
            topProducts: topProducts
        };

        res.json(response);

    } catch (err) {
        console.error("Error fetching seller statistics:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});
// Buyer view product endpoint (only approved + seller is active)
app.get('/api/products/approved', authenticateToken, async (req, res) => {
    try {
        const [rows] = await con.promise().query(
            `SELECT 
                p.id, p.category_id, p.seller_id, p.title, 
                p.price, p.product_condition, p.image_url
            FROM products p
            JOIN users u ON p.seller_id = u.id
            WHERE p.status = 'approved' AND u.is_active = true`
        );
        res.json(rows);
    } catch (error) {
        console.error("Error fetching approved products:", error);
        res.status(500).json({ error: "Failed to fetch products" });
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

// Buyer place order (creates order header only)
app.post('/api/place-order', authenticateToken, async (req, res) => {
    const buyerId = req.user.id;
    const {
        total_price,
        delivery_method,
        shipping_name,
        shipping_phone,
        shipping_address,
        shipping_city,
        shipping_postal_code,
        shipping_country,
        items
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "Order must contain at least one item." });
    }

    try {
        // Validate stock for all products
        for (const item of items) {
            const [rows] = await con.promise().query(
                'SELECT stock_quantity, title FROM products WHERE id = ?',
                [item.product_id]
            );

            if (!rows.length || rows[0].stock_quantity < item.quantity) {
                return res.status(400).json({
                    error: `Only ${rows[0].stock_quantity} of "${rows[0].title}" available, but you requested ${item.quantity}.`
                });
            }
        }

        // Insert into orders table
        const orderSql = `
            INSERT INTO orders
            (buyer_id, total_price, order_status, order_date, delivery_method,
             shipping_name, shipping_phone, shipping_address, shipping_city, shipping_postal_code, shipping_country)
            VALUES (?, ?, 'pending', NOW(), ?, ?, ?, ?, ?, ?, ?)
        `;

        const orderValues = [
            buyerId,
            total_price,
            delivery_method,
            shipping_name,
            shipping_phone,
            delivery_method === 'pickup' ? null : shipping_address,
            delivery_method === 'pickup' ? null : shipping_city,
            delivery_method === 'pickup' ? null : shipping_postal_code,
            delivery_method === 'pickup' ? null : shipping_country,
        ];

        const [orderResult] = await con.promise().query(orderSql, orderValues);
        const orderId = orderResult.insertId;

        // Insert into order_items
        const orderItemsValues = items.map(item => [
            orderId,
            item.product_id,
            item.seller_id,
            item.quantity,
            item.price,
            item.quantity * item.price,
            'pending'
        ]);

        const orderItemsSql = `
            INSERT INTO order_items (order_id, product_id, seller_id, quantity, price, total_price, status)
            VALUES ?
        `;

        await con.promise().query(orderItemsSql, [orderItemsValues]);

        // Update stock
        for (const item of items) {
            const updateStockSql = `
                UPDATE products
                SET stock_quantity = stock_quantity - ?
                WHERE id = ? AND stock_quantity >= ?
            `;
            await con.promise().query(updateStockSql, [item.quantity, item.product_id, item.quantity]);
        }

        res.status(201).json({ message: "Order placed successfully", order_id: orderId });
    } catch (error) {
        console.error("Order placement failed", error);
        res.status(500).json({ error: "Failed to place order" });
    }
});


//Buyer get shipping info
app.get('/api/shipping/user/:userId', authenticateToken, async (req, res) => {
    const userId = req.params.userId;

    // Only allow users to access their own shipping info
    if (parseInt(userId) !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized access to shipping info." });
    }


    try {
        const [rows] = await con.promise().query("SELECT * FROM shipping WHERE user_id = ? LIMIT 1", [userId]);

        if(rows.length === 0) {
            return res.status(400).json({ message: ""})
        }

        if (rows.length > 0) {
            return res.json(rows[0]);
        } else {
            return res.status(404).json({ message: "No shipping information found." });
        }
    } catch (err) {
        console.error("Error fetching shipping info:", err);
        return res.status(500).json({ message: "Server error while retrieving shipping info." });
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
// Get all orders for buyer, with products and shipping info
app.get('/api/orders/with-products', authenticateToken, async (req, res) => {
    const buyerId = req.user.id;

    try {
        const [rows] = await con.promise().query(`
             SELECT
                o.id AS order_id,
                o.order_date,
                o.order_status,
                o.is_paid,
                s.phone_number,
                oi.product_id,
                oi.quantity,
                oi.total_price,
                oi.status AS item_status,
                p.title,
                p.image_url
            FROM orders o
            JOIN order_items oi ON o.id = oi.order_id
            JOIN products p ON oi.product_id = p.id
            LEFT JOIN shipping s ON o.buyer_id = s.user_id
            WHERE o.buyer_id = ?
            ORDER BY o.order_date DESC;
        `, [buyerId]);

        res.json(rows);
    } catch (error) {
        console.error("Error fetching order history:", error);
        res.status(500).json({ message: "Error fetching order history with products." });
    }
});


//Buyer update shipping info
app.put('/api/shipping/user/:userId', authenticateToken, async (req, res) => {
    const userId = parseInt(req.params.userId);

    
    if (userId !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized access to update shipping info." });
    }

    const {
        recipient_name,
        address_line1,
        city,
        postal_code,
        country,
        phone_number
    } = req.body;

    try {
        // Check if a shipping record already exists for the user
        const [rows] = await con.promise().query("SELECT * FROM shipping WHERE user_id = ?", [userId]);

        if (rows.length > 0) {
            // Update existing record
            await con.promise().query(
                `UPDATE shipping SET recipient_name = ?, address_line1 = ?, city = ?, postal_code = ?, country = ?, phone_number = ? WHERE user_id = ?`,
                [recipient_name, address_line1, city, postal_code, country, phone_number, userId]
            );
        } else {
            // Insert new shipping info if it doesn't exist
            await con.promise().query(
                `INSERT INTO shipping (user_id, recipient_name, address_line1, city, postal_code, country, phone_number)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [userId, recipient_name, address_line1, city, postal_code, country, phone_number]
            );
        }

        res.json({ message: "Shipping information updated successfully." });
    } catch (err) {
        console.error("Error updating shipping info:", err);
        res.status(500).json({ message: "Server error while updating shipping info." });
    }
});

//Buyer update item status
app.put('/api/orders/:orderId/products/:productId/deliver', authenticateToken, async (req, res) => {
    const { orderId, productId } = req.params;

    try {
        // 1. Update the item status to 'Delivered'
        const [updateResult] = await con.promise().query(
            `UPDATE order_items
             SET status = 'Delivered'
             WHERE order_id = ? AND product_id = ?`,
            [orderId, productId]
        );

        if (updateResult.affectedRows === 0) {
            return res.status(404).json({ message: "Order item not found." });
        }

        // 2. Check if all items in the order are now delivered
        const [undeliveredItems] = await con.promise().query(
            `SELECT * FROM order_items WHERE order_id = ? AND status != 'Delivered'`,
            [orderId]
        );

        // 3. If none left, update the order_status
        if (undeliveredItems.length === 0) {
            await con.promise().query(
                `UPDATE orders SET order_status = 'Delivered' WHERE id = ?`,
                [orderId]
            );
        }

        res.json({ message: "Product marked as delivered." });
    } catch (error) {
        console.error("Error updating delivery status:", error);
        res.status(500).json({ message: "Failed to mark product as delivered." });
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

//Admin get active users
app.get('/api/admin/users', (req, res) => {
    const sql = 'SELECT id, name, email, role FROM users WHERE is_active = true';
    con.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err});
        res.json(results);
    });
});

//Admin fetch deactivated accounts
app.get('/api/admin/deactivated', async (req, res) => {
    try {
        const [results] = await con.promise().query(
            'SELECT id, name, email, role FROM users WHERE is_active = false'
        );
        res.json(results);
    } catch (err) {
        console.error("Error fetching deactivated users:", err);
        res.status(500).json({ error: "Failed to fetch deactivated users." });
    }
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
//Admin deactivate user account
app.put('/api/users/:id/deactivate', async (req, res) => {
    const userId = req.params.id;

    try {
        await con.promise().execute(
            'UPDATE users SET is_active = ? WHERE id = ?',
            [false, userId]
        );
        res.json({ message: "User deactivated successfully" });
    } catch (error) {
        console.error("Error deactivating user:", error);
        res.status(500).json({ error: "Failed to deactivate user" });
    }
});

//Admin reactivate user account
app.put('/api/users/:id/activate', async (req, res) => {
    const userId = req.params.id;

    try {
        await con.promise().execute(
            'UPDATE users SET is_active = ? WHERE id = ?',
            [true, userId]
        );
        res.json({ message: "User reactivated successfully" });
    } catch (error) {
        console.error("Error reactivating user:", error);
        res.status(500).json({ error: "Failed to reactivate user" });
    }
});

//User self reactivation
app.put('/api/users/reactivate', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: "Email is required." });
    }

    try {
        // Check if user exists and is deactivated
        const [users] = await con.promise().query(
            'SELECT id, is_active FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(404).json({ error: "User not found." });
        }

        const user = users[0];

        if (user.is_active === 1) {
            return res.status(400).json({ error: "Account is already active." });
        }

        // Reactivate account
        await con.promise().query(
            'UPDATE users SET is_active = 1 WHERE email = ?',
            [email]
        );

        res.status(200).json({ message: "Account reactivated successfully." });
    } catch (err) {
        console.error("Error reactivating account:", err);
        res.status(500).json({ error: "Failed to reactivate account. Try again later." });
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
            WHERE p.id = ? AND p.status = 'approved' || p.status = 'pending'
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
    const { title, description, category_id, price, condition, stock_quantity } = req.body;
    const imageFile = req.file;

    const updates = [category_id, title, description, price, condition, stock_quantity];
    let sql = `UPDATE products SET category_id = ?, title = ?, description = ?, price = ?, product_condition = ?, stock_quantity = ?`;

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
    const sellerId = req.user.id;

    try {
        const [rows] = await con.promise().query(`
            SELECT
                oi.id AS order_item_id,
                o.id AS order_id,
                o.order_date,
                o.order_status,
                o.delivery_method,
                o.buyer_id,
                o.shipping_name,
                o.shipping_phone,
                o.shipping_address,
                o.shipping_city,
                o.shipping_postal_code,
                o.shipping_country,
                oi.product_id,
                p.title AS product_title,
                p.image_url,
                oi.quantity,
                oi.price,
                oi.total_price,
                oi.status AS item_status
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.id
            JOIN products p ON oi.product_id = p.id
            WHERE oi.seller_id = ?
            ORDER BY o.order_date DESC;

        `, [sellerId]);

        res.json(rows);
    } catch (error) {
        console.error("Error fetching seller orders:", error);
        res.status(500).json({ message: "Error fetching seller order items." });
    }
});

//Mpesa enpoints
app.post('/api/stk-push', async (req, res) => {
    const { phone, amount, order_id } = req.body;

    const formattedNumber = formatPhoneNumberServer(phone);
    try {
        const response = await stkPush(formattedNumber, amount);

        await con.promise().query(
            `INSERT INTO stk_sessions (order_id, checkout_request_id, phone, amount)
            VALUES (?, ?, ?, ?)
            `,
            [order_id, response.CheckoutRequestID, formattedNumber, amount]
        );

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
    const stkCallback = req.body?.Body?.stkCallback;

    if (!stkCallback) {
        console.error("❌ Invalid callback format.");
        return res.status(400).send("Invalid callback format.");
    }

    const checkoutRequestId = stkCallback.CheckoutRequestID;
    const resultCode = stkCallback.ResultCode;

    if (resultCode === 0) {
        const metadata = stkCallback.CallbackMetadata?.Item;

        const amount = metadata.find(item => item.Name === 'Amount')?.Value;
        let phoneNumber = String(metadata.find(item => item.Name === 'PhoneNumber')?.Value);

        if (!phoneNumber || !amount) {
            console.error("❌ Missing phone number or amount in callback.");
            return res.status(400).send("Missing required transaction data.");
        }

        if (phoneNumber.startsWith('2547')) {
            phoneNumber = phoneNumber.replace(/^254/, '0');
        }

        console.log("📞 Phone:", phoneNumber, "| 💰 Amount:", amount);

        try {
            // 🔍 1. Find order ID via the session
            const [rows] = await con.promise().query(
                `SELECT order_id FROM stk_sessions WHERE checkout_request_id = ?`,
                [checkoutRequestId]
            );

            if (!rows.length) { // 🔴 FIXED: typo was `lenth`
                console.warn("⚠️ No matching STK session found.");
                return res.status(404).json({ error: "Order not found for this transaction" });
            }

            const orderId = rows[0].order_id;

            // 🔍 2. Get items for that order
            const [items] = await con.promise().query(
                `SELECT 
                    oi.product_id,
                    oi.seller_id, 
                    oi.quantity,
                    oi.total_price,
                    o.buyer_id
                FROM 
                    order_items oi
                JOIN 
                    orders o ON oi.order_id = o.id
                WHERE 
                    oi.order_id = ?`,
                [orderId]
            );

            // 💾 3. Insert transactions per item
            for (const item of items) {
                await con.promise().query(
                    `INSERT INTO transactions (
                        order_id, 
                        item_id, 
                        buyer_id, 
                        seller_id, 
                        quantity, 
                        amount, 
                        transaction_date, 
                        payment_method, 
                        status
                    ) VALUES (?, ?, ?, ?, ?, ?, NOW(), 'Mpesa', 'Completed')`,
                    [
                        orderId,
                        item.product_id,
                        item.buyer_id,
                        item.seller_id,
                        item.quantity,
                        item.total_price
                    ]
                );
            }

            await con.promise().query(
                `UPDATE orders SET is_paid = 1 WHERE id = ?`,
                [orderId]
            )

            console.log(`✅ Transactions saved for order ${orderId}`);
            return res.status(200).json({ message: 'Transaction saved successfully.' });

        } catch (err) {
            console.error("❌ Error saving transaction:", err);
            return res.status(500).json({ error: "Failed to save transaction." });
        }
    } else {
        console.log("❌ Payment failed or cancelled.");
        return res.status(200).send("Transaction not successful.");
    }
});

