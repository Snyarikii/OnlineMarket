import React, {useEffect, useState} from "react";
import axios from "axios";
import './ManageCategories.css'

const ManageCategories = () => {
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [editingName, setEditingName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = () => {
        setLoading(true);
        axios.get('http://localhost:3001/api/admin/categories', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        .then(res => {
            setCategories(res.data);
            setLoading(false);
        })
        .catch(err => {
            console.error(err);
            setError('Failed to fetch categories.');
            setLoading(false);
        });
    };

    const addCategory = (e) => {
        e.preventDefault();
        if(!newCategory.trim()) return;
        
        axios.post('http://localhost:3001/api/admin/categories', {name: newCategory}, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        .then(() => {
            setNewCategory('');
            fetchCategories();
        })
        .catch(err => {
            console.error(err);
            setError('Failed to add category. It might already exist.');
        });
    };

    const deleteCategory = (id) => {
        if(window.confirm('Are you sure you want to delete this category? This cannot be undone.')){
            axios.delete(`http://localhost:3001/api/admin/categories/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            })
            .then(() => fetchCategories())
            .catch(err => {
                console.error(err);
                setError('Failed to delete category.');
            });
        }
    };

    const startEditing = (id, name) => {
        setEditingId(id);
        setEditingName(name);
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditingName('');
    }

    const saveEdit = (id) => {
        if(!editingName.trim()) return;
        axios.put(`http://localhost:3001/api/admin/categories/${id}`, {name: editingName}, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}`}
        })
        .then(() => {
            cancelEditing();
            fetchCategories();
        })
        .catch(err => {
            console.error(err);
            setError('Failed to update category.');
        });
    }

    return(
        <div className="manage-categories-container">
            <div className="page-header">
                <h1>Manage Categories</h1>
                <p>Add, edit, or delete product categories for the marketplace.</p>
            </div>

            <div className="add-category-form">
                <h3>Add New Category</h3>
                <form onSubmit={addCategory}>
                    <input
                        type="text"
                        placeholder="New category name..."
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                    />
                    <button type="submit" className="btn-add">Add Category</button>
                </form>
                {error && <p className="error-message">{error}</p>}
            </div>

            <div className="categories-table-container">
                <h3>Existing Categories</h3>
                {loading ? <p>Loading...</p> : (
                    <table className="categories-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Category Name</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map(cat => (
                                <tr key={cat.id}>
                                    <td>{cat.id}</td>
                                    <td>
                                        {editingId === cat.id ? (
                                            <input 
                                                type="text"
                                                className="edit-input"
                                                value={editingName}
                                                onChange={(e) => setEditingName(e.target.value)}
                                            />
                                        ) : (
                                            cat.name
                                        )}
                                    </td>
                                    <td className="action-buttons">
                                        {editingId === cat.id ? (
                                            <>
                                                <button className="btn-save" onClick={() => saveEdit(cat.id)}>Save</button>
                                                <button className="btn-cancel" onClick={cancelEditing}>Cancel</button>
                                            </>
                                        ) : (
                                            <>
                                                <button className="btn-edit" onClick={() => startEditing(cat.id, cat.name)}>Edit</button>
                                                <button className="btn-delete" onClick={() => deleteCategory(cat.id)}>Delete</button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default ManageCategories;
