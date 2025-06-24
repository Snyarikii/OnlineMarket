import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import axios from "axios";
import './UpdateProduct.css';

const UpdateProduct = () => {
    const { productId } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [condition, setCondition] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [categories, setCategories] = useState([]);
    const [image, setImage] = useState(null);
    

    useEffect(() => {
        const token = localStorage.getItem('token');
        const fetchProduct = async () => {
            try {
                const response = await axios.get(`http://localhost:3001/api/products/${productId}`, {
                    headers: {Authorization: `Bearer ${token}`},
                });
                setProduct(response.data);
                setTitle(response.data.title);
                setDescription(response.data.description);
                setPrice(response.data.price);
                setCondition(response.data.product_condition);
                setCategoryId(response.data.category_id);
            } catch (error) {
                console.error("Error fetching product:", error);
                alert("Could not load product.");
                navigate(-1);
            }
        };

        const fetchCategories = async () => {
            try {
                const response = await axios.get('http://localhost:3001/api/categories', {
                    headers: {
                        'Authorization' : `Bearer ${token}`
                    }
                });
                // setCategoryId(response.data.category_id);
                setCategories(response.data);
            } catch (err) {
                console.error("Error fetching categories", err);
            }
        };
        fetchProduct();
        fetchCategories();
    }, [productId, navigate]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("title", title);
        formData.append('description', description);
        formData.append('category_id', categoryId);
        formData.append('price', price);
        formData.append('condition', condition);
        if(image) formData.append('image', image);

        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:3001/api/products/${productId}`, formData, {
                headers: {Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data'},
            });
            alert('Product updated successfully.');
            navigate('/Dashboard');
        } catch (err) {
            console.error("Error updating product:" , err);
            alert("Failed to update product.");
        }
    };

    if(!product) return <p>Loading</p>

    return (
        <div className="update-product-body">
            <div className="update-product-header">
                <h1>FleaMarket</h1>
                <nav className="update-product-link">
                    <Link to='/Dashboard' className="update-product-back-link">Back</Link>
                </nav>
            </div>

            <div className="edit-product-container">
                <h2>Update product</h2>
                <form onSubmit={handleUpdate} className="edit-product-form">
                    <label>Title</label>
                    <input type="text" value={title} onChange={(e) => setDescription(e.target.value)} required />

                    <label>Description</label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
                    
                    <label>Category</label>
                    <select 
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                    >
                        <option value="">Select category</option>
                        {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>

                    <label>Price</label>
                    <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />

                    <label>Condition</label>
                    <select value={condition} onChange={(e) => setCondition(e.target.value)} required>
                        <option value="">Select Condition</option>
                        <option value="New">New</option>
                        <option value="Used">Used</option>
                    </select>

                    <label>Update Image (optional)</label>
                    <input type="file" onChange={(e) => setImage(e.target.files[0])} />

                    <button type="submit" className="update-product-btn">Update Product</button>
                </form>
            </div>
        </div>
    );
};
export default UpdateProduct;