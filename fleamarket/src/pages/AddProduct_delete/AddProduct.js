import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './AddProduct.css'; // Import the stylesheet

const AddProduct = () => {
    const navigate = useNavigate();

    // State for the form fields
    const [product, setProduct] = useState({
        title: '',
        description: '',
        price: '',
        category_id: '',
        condition: 'New',
    });
    const [imageFile, setImageFile] = useState(null);
    const [categories, setCategories] = useState([]);

    // State for UI feedback
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert("You must be logged in to add a product.");
            navigate('/Login');
            return;
        }

        const fetchCategories = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/categories', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) throw new Error('Could not fetch categories.');
                const data = await response.json();
                setCategories(data);
                if (data.length > 0) {
                    setProduct(p => ({ ...p, category_id: data[0].id }));
                }
            } catch (err) {
                setError('Failed to load categories. Please try again later.');
            }
        };

        fetchCategories();
    }, [navigate]);

    const handleInputChange = (e) => {
        setProduct({ ...product, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setImageFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');

        if (!imageFile) {
            setError('Please upload an image for the product.');
            setIsLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append('title', product.title);
        formData.append('description', product.description);
        formData.append('price', product.price);
        formData.append('category_id', product.category_id);
        formData.append('condition', product.condition);
        formData.append('productImage', imageFile);
        
        const token = localStorage.getItem('token');

        try {
            const response = await fetch('http://localhost:3001/api/products', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData,
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Failed to create product.');

            setSuccess('Product created successfully!');
            e.target.reset(); // Clear form inputs
            setProduct({ title: '', description: '', price: '', category_id: categories[0]?.id || '', condition: 'New' });
            setImageFile(null);

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="add-product-page">
            <header className="page-header">
                <h1 onClick={() => navigate('/Dashboard')}>Flea Market</h1>
                <nav>
                    <Link to="/Dashboard">My Dashboard</Link>
                </nav>
            </header>
            <main className="page-main">
                <div className="form-container">
                    <h2 className="form-title">Create a New Listing</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="title">Product Title</label>
                            <input type="text" id="title" name="title" value={product.title} onChange={handleInputChange} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="description">Description</label>
                            <textarea id="description" name="description" value={product.description} onChange={handleInputChange} rows="4" required></textarea>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="price">Price ($)</label>
                                <input type="number" id="price" name="price" value={product.price} onChange={handleInputChange} min="0.01" step="0.01" required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="condition">Condition</label>
                                <select id="condition" name="condition" value={product.condition} onChange={handleInputChange}>
                                    <option>New</option>
                                    <option>Used - Like New</option>
                                    <option>Used - Good</option>
                                    <option>Used - Fair</option>
                                </select>
                            </div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="category_id">Category</label>
                            <select id="category_id" name="category_id" value={product.category_id} onChange={handleInputChange} required>
                                <option value="" disabled>Select a category</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="productImage">Product Image</label>
                            <input type="file" id="productImage" name="productImage" onChange={handleFileChange} accept="image/png, image/jpeg" required />
                        </div>
                        {error && <p className="form-message error">{error}</p>}
                        {success && <p className="form-message success">{success}</p>}
                        <button type="submit" className="btn-submit" disabled={isLoading}>
                            {isLoading ? 'Listing Product...' : 'List My Product'}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default AddProduct;