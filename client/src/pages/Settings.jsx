import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import {
    categoriesAPI,
    subcategoriesAPI,
    platformsAPI,
    modesAPI,
    statusesAPI,
} from '../services/api';

const MasterList = ({ title, items, onAdd, onEdit, onDelete, loading }) => {
    const [newName, setNewName] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');

    const handleAdd = () => {
        if (newName.trim()) {
            onAdd(newName.trim());
            setNewName('');
        }
    };

    const handleEdit = (item) => {
        setEditingId(item.id);
        setEditName(item.name);
    };

    const handleSaveEdit = () => {
        if (editName.trim()) {
            onEdit(editingId, editName.trim());
            setEditingId(null);
            setEditName('');
        }
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditName('');
    };

    return (
        <div className="glass rounded-2xl p-6 animate-fade-in">
            <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>

            {/* Add new item */}
            <div className="flex gap-2 mb-4">
                <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
                    placeholder={`Add new ${title.toLowerCase().slice(0, -1)}...`}
                    className="flex-1 px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <button
                    onClick={handleAdd}
                    className="px-4 py-2 btn-primary text-white rounded-xl"
                >
                    Add
                </button>
            </div>

            {/* Items list */}
            {loading ? (
                <div className="animate-pulse space-y-2">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-10 bg-slate-700/50 rounded-lg" />
                    ))}
                </div>
            ) : items.length === 0 ? (
                <p className="text-slate-500 text-center py-4">No items yet</p>
            ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                    {items.map((item) => (
                        <div
                            key={item.id}
                            className="flex items-center justify-between px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:border-slate-600 transition-colors"
                        >
                            {editingId === item.id ? (
                                <div className="flex items-center gap-2 flex-1">
                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
                                        className="flex-1 px-3 py-1 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                                        autoFocus
                                    />
                                    <button
                                        onClick={handleSaveEdit}
                                        className="p-1 text-green-400 hover:text-green-300"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={handleCancelEdit}
                                        className="p-1 text-slate-400 hover:text-white"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <span className="text-white">{item.name}</span>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => handleEdit(item)}
                                            className="p-1 text-slate-400 hover:text-white"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => onDelete(item.id)}
                                            className="p-1 text-slate-400 hover:text-red-400"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const Settings = () => {
    const [activeTab, setActiveTab] = useState('categories');
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [platforms, setPlatforms] = useState([]);
    const [modes, setModes] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAllMasters();
    }, []);

    const fetchAllMasters = async () => {
        setLoading(true);
        try {
            const [catRes, subRes, platRes, modeRes, statRes] = await Promise.all([
                categoriesAPI.getAll(),
                subcategoriesAPI.getAll(),
                platformsAPI.getAll(),
                modesAPI.getAll(),
                statusesAPI.getAll(),
            ]);
            setCategories(catRes.data);
            setSubcategories(subRes.data);
            setPlatforms(platRes.data);
            setModes(modeRes.data);
            setStatuses(statRes.data);
        } catch (error) {
            console.error('Failed to fetch masters:', error);
        } finally {
            setLoading(false);
        }
    };

    // Category handlers
    const handleAddCategory = async (name) => {
        try {
            await categoriesAPI.create({ name, type: 'Expense' });
            const res = await categoriesAPI.getAll();
            setCategories(res.data);
        } catch (error) {
            console.error('Failed to add category:', error);
        }
    };

    const handleEditCategory = async (id, name) => {
        try {
            await categoriesAPI.update(id, { name, type: 'Expense' });
            const res = await categoriesAPI.getAll();
            setCategories(res.data);
        } catch (error) {
            console.error('Failed to edit category:', error);
        }
    };

    const handleDeleteCategory = async (id) => {
        if (!window.confirm('Delete this category?')) return;
        try {
            await categoriesAPI.delete(id);
            const res = await categoriesAPI.getAll();
            setCategories(res.data);
        } catch (error) {
            console.error('Failed to delete category:', error);
        }
    };

    // Platform handlers
    const handleAddPlatform = async (name) => {
        try {
            await platformsAPI.create({ name });
            const res = await platformsAPI.getAll();
            setPlatforms(res.data);
        } catch (error) {
            console.error('Failed to add platform:', error);
        }
    };

    const handleEditPlatform = async (id, name) => {
        try {
            await platformsAPI.update(id, { name });
            const res = await platformsAPI.getAll();
            setPlatforms(res.data);
        } catch (error) {
            console.error('Failed to edit platform:', error);
        }
    };

    const handleDeletePlatform = async (id) => {
        if (!window.confirm('Delete this platform?')) return;
        try {
            await platformsAPI.delete(id);
            const res = await platformsAPI.getAll();
            setPlatforms(res.data);
        } catch (error) {
            console.error('Failed to delete platform:', error);
        }
    };

    // Mode handlers
    const handleAddMode = async (name) => {
        try {
            await modesAPI.create({ name });
            const res = await modesAPI.getAll();
            setModes(res.data);
        } catch (error) {
            console.error('Failed to add mode:', error);
        }
    };

    const handleEditMode = async (id, name) => {
        try {
            await modesAPI.update(id, { name });
            const res = await modesAPI.getAll();
            setModes(res.data);
        } catch (error) {
            console.error('Failed to edit mode:', error);
        }
    };

    const handleDeleteMode = async (id) => {
        if (!window.confirm('Delete this payment mode?')) return;
        try {
            await modesAPI.delete(id);
            const res = await modesAPI.getAll();
            setModes(res.data);
        } catch (error) {
            console.error('Failed to delete mode:', error);
        }
    };

    // Status handlers
    const handleAddStatus = async (name) => {
        try {
            await statusesAPI.create({ name });
            const res = await statusesAPI.getAll();
            setStatuses(res.data);
        } catch (error) {
            console.error('Failed to add status:', error);
        }
    };

    const handleEditStatus = async (id, name) => {
        try {
            await statusesAPI.update(id, { name });
            const res = await statusesAPI.getAll();
            setStatuses(res.data);
        } catch (error) {
            console.error('Failed to edit status:', error);
        }
    };

    const handleDeleteStatus = async (id) => {
        if (!window.confirm('Delete this status?')) return;
        try {
            await statusesAPI.delete(id);
            const res = await statusesAPI.getAll();
            setStatuses(res.data);
        } catch (error) {
            console.error('Failed to delete status:', error);
        }
    };

    const tabs = [
        { id: 'categories', label: 'Categories', icon: '📁' },
        { id: 'platforms', label: 'Platforms', icon: '🏪' },
        { id: 'modes', label: 'Payment Modes', icon: '💳' },
        { id: 'statuses', label: 'Statuses', icon: '📊' },
    ];

    return (
        <div className="min-h-screen">
            <Navbar />

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-2xl font-bold text-white mb-6">Settings</h1>

                {/* Tabs */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 rounded-xl font-medium transition-colors ${activeTab === tab.id
                                    ? 'bg-indigo-500 text-white'
                                    : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50 border border-slate-700'
                                }`}
                        >
                            <span className="mr-2">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                {activeTab === 'categories' && (
                    <MasterList
                        title="Categories"
                        items={categories}
                        onAdd={handleAddCategory}
                        onEdit={handleEditCategory}
                        onDelete={handleDeleteCategory}
                        loading={loading}
                    />
                )}

                {activeTab === 'platforms' && (
                    <MasterList
                        title="Platforms"
                        items={platforms}
                        onAdd={handleAddPlatform}
                        onEdit={handleEditPlatform}
                        onDelete={handleDeletePlatform}
                        loading={loading}
                    />
                )}

                {activeTab === 'modes' && (
                    <MasterList
                        title="Payment Modes"
                        items={modes}
                        onAdd={handleAddMode}
                        onEdit={handleEditMode}
                        onDelete={handleDeleteMode}
                        loading={loading}
                    />
                )}

                {activeTab === 'statuses' && (
                    <MasterList
                        title="Statuses"
                        items={statuses}
                        onAdd={handleAddStatus}
                        onEdit={handleEditStatus}
                        onDelete={handleDeleteStatus}
                        loading={loading}
                    />
                )}
            </main>
        </div>
    );
};

export default Settings;
