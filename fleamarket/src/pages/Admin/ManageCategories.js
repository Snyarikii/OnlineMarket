import React, {useEffect, useState} from "react";
import {Link, useNavigate} from 'react-router';
import axios from "axios";
import styles from './ManageCategories.css'

const ManageCategories = () => {
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [editingName, setEditingName] = useState('');

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = () => {
        axios.get('http://localhost:3001/api/admin/categories', {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        })
        .then(res => setCategories(res.data))
        .catch(err => console.error(err));
    };

    const addCategory = () => {
        if(!newCategory.trim()) return;
        axios.post('http://localhost:3001/api/admin/categories', {name:newCategory}, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        })
        .then(() => {
            setNewCategory('');
            fetchCategories();
        })
        .catch(err => console.error(err));
    };

    const deleteCategory = (id) => {
        if(window.confirm('Are you sure you want to delete this category?')){
            axios.delete(`http://localhost:3001/api/admin/categories/${id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            })
            .then(() => fetchCategories())
            .catch(err => console.error(err));
        }
    };

    const startEditing = (id, name) => {
        setEditingId(id);
        setEditingName(name);
    };

    const saveEdit = (id) => {
        if(!editingName.trim()) return;
        axios.put(`http://localhost:3001/api/admin/categories/${id}`, {name: editingName}, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}`}
        })
        .then(() => {
            setEditingId(null);
            setEditingName('');
            fetchCategories();
        })
        .catch(err => console.error(err));
    }

    return(
        <div className="manage-categories">
            <h1>Manage Categories</h1>

            <table>
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
                                        value={editingName}
                                        onChange={(e) => setEditingName(e.target.value)}
                                    />
                                ) : (
                                    cat.name
                                )}
                            </td>
                            <td>
                                {editingId === cat.id ? (
                                    <button onClick={() => saveEdit(cat.id)}>Save</button>
                                ) : (
                                    <button onClick={() => startEditing(cat.id, cat.name)}>Edit</button>
                                )}
                                <button onClick={() => deleteCategory(cat.id)} style={{ marginLeft: '8px'}}>Delete</button>
                            </td>
                            {/* <td>{cat.name}</td>
                            <td><button onClick={() => deleteCategory(cat.id)}>Delete</button></td> */}
                        </tr>
                    ))}
                </tbody>
            </table>
            <h2> Add New Category</h2>
            <input
                type="text"
                placeholder="New Category name"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
            />
            <button onClick={addCategory}>Add Category</button>
        </div>
    );
};

export default ManageCategories;
