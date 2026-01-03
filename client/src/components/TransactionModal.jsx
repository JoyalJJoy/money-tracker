import { useState, useEffect } from 'react';
import { categoriesAPI, subcategoriesAPI, accountsAPI, statusesAPI, modesAPI, platformsAPI } from '../services/api';

const TransactionModal = ({ isOpen, onClose, onSubmit, transaction = null }) => {
    // Masters Data
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [modes, setModes] = useState([]);
    const [platforms, setPlatforms] = useState([]);

    const [form, setForm] = useState({
        date: new Date().toISOString().split('T')[0],
        type: 'Expense',
        categoryId: '',
        subcategoryId: '',
        description: '',
        quantity: '',
        unitPrice: '',
        manualAmount: '',
        accountId: '',
        statusId: '',
        modeId: '',
        platformId: '',
        notes: ''
    });

    const [amount, setAmount] = useState(0);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    // Fetch Masters
    useEffect(() => {
        const fetchMasters = async () => {
            try {
                const [cats, accs, stats, mds, plts] = await Promise.all([
                    categoriesAPI.getAll(),
                    accountsAPI.getAll(),
                    statusesAPI.getAll(),
                    modesAPI.getAll(),
                    platformsAPI.getAll()
                ]);
                setCategories(cats.data);
                setAccounts(accs.data);
                setStatuses(stats.data);
                setModes(mds.data);
                setPlatforms(plts.data);
            } catch (error) {
                console.error("Failed to load masters", error);
            }
        };
        if (isOpen) fetchMasters();
    }, [isOpen]);

    // Fetch Subcategories when Category changes
    useEffect(() => {
        if (form.categoryId) {
            const fetchSubs = async () => {
                const res = await subcategoriesAPI.getByCategory(form.categoryId);
                setSubcategories(res.data);
            };
            fetchSubs();
        } else {
            setSubcategories([]);
        }
    }, [form.categoryId]);

    // Initialize Form
    useEffect(() => {
        if (transaction) {
            setForm({
                date: transaction.date,
                type: transaction.type,
                categoryId: transaction.categoryId || '',
                subcategoryId: transaction.subcategoryId || '',
                description: transaction.description,
                quantity: transaction.quantity || '',
                unitPrice: transaction.unitPrice || '',
                manualAmount: transaction.manualAmount || '',
                accountId: transaction.accountId || '',
                statusId: transaction.statusId || '',
                modeId: transaction.modeId || '',
                platformId: transaction.platformId || '',
                notes: transaction.notes || ''
            });
        } else {
            // Reset form for new entry
            setForm({
                date: new Date().toISOString().split('T')[0],
                type: 'Expense',
                categoryId: '',
                subcategoryId: '',
                description: '',
                quantity: '',
                unitPrice: '',
                manualAmount: '',
                accountId: '',
                statusId: '',
                modeId: '',
                platformId: '',
                notes: ''
            });
        }
    }, [transaction, isOpen]);

    // Auto-calculate Amount
    useEffect(() => {
        const qty = parseFloat(form.quantity);
        const price = parseFloat(form.unitPrice);
        const manual = parseFloat(form.manualAmount);

        if (!isNaN(qty) && !isNaN(price)) {
            setAmount(qty * price);
        } else if (!isNaN(manual)) {
            setAmount(manual);
        } else {
            setAmount(0);
        }
    }, [form.quantity, form.unitPrice, form.manualAmount]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        // Validation
        const newErrors = {};
        if (!form.date) newErrors.date = "Date is required";
        if (!form.description) newErrors.description = "Description is required";
        if (amount <= 0) newErrors.amount = "Amount must be greater than 0";
        // if (!form.categoryId) newErrors.categoryId = "Category is required"; // Maybe optional?

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        const payload = {
            ...form,
            categoryId: form.categoryId ? parseInt(form.categoryId) : null,
            subcategoryId: form.subcategoryId ? parseInt(form.subcategoryId) : null,
            accountId: form.accountId ? parseInt(form.accountId) : null,
            statusId: form.statusId ? parseInt(form.statusId) : null,
            modeId: form.modeId ? parseInt(form.modeId) : null,
            platformId: form.platformId ? parseInt(form.platformId) : null,
            quantity: form.quantity ? parseFloat(form.quantity) : null,
            unitPrice: form.unitPrice ? parseFloat(form.unitPrice) : null,
            manualAmount: form.manualAmount ? parseFloat(form.manualAmount) : null,
        };

        setLoading(true);
        try {
            await onSubmit(payload);
            onClose();
        } catch (err) {
            console.error(err);
            setErrors({ submit: "Failed to save transaction" });
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-4xl glass rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">
                        {transaction ? 'Edit Transaction' : 'New Transaction'}
                    </h2>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {errors.submit && <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl">{errors.submit}</div>}

                    {/* Section 1: Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Date</label>
                            <input type="date" name="date" value={form.date} onChange={handleChange} className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:border-indigo-500 focus:outline-none" />
                            {errors.date && <p className="text-red-400 text-xs">{errors.date}</p>}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Type</label>
                            <select name="type" value={form.type} onChange={handleChange} className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:border-indigo-500 focus:outline-none">
                                <option value="Expense">Expense</option>
                                <option value="Income">Income</option>
                                <option value="Transfer">Transfer</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Account</label>
                            <select name="accountId" value={form.accountId} onChange={handleChange} className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:border-indigo-500 focus:outline-none">
                                <option value="">Select Account</option>
                                {accounts.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Section 2: Details */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Description</label>
                        <input type="text" name="description" value={form.description} onChange={handleChange} placeholder="What was this transaction for?" className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:border-indigo-500 focus:outline-none" />
                        {errors.description && <p className="text-red-400 text-xs">{errors.description}</p>}
                    </div>

                    {/* Section 3: Classification */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Category</label>
                            <select name="categoryId" value={form.categoryId} onChange={handleChange} className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:border-indigo-500 focus:outline-none">
                                <option value="">Select Category</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Sub-Category</label>
                            <select name="subcategoryId" value={form.subcategoryId} onChange={handleChange} disabled={!form.categoryId} className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:border-indigo-500 focus:outline-none disabled:opacity-50">
                                <option value="">Select Sub-Category</option>
                                {subcategories.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Section 4: Amount Logic */}
                    <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
                        <label className="block text-sm font-medium text-indigo-400 mb-4">Amount Calculation</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs text-slate-400">Quantity</label>
                                <input type="number" name="quantity" value={form.quantity} onChange={handleChange} placeholder="Qty" className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-slate-400">Unit Price</label>
                                <input type="number" name="unitPrice" value={form.unitPrice} onChange={handleChange} placeholder="Price" className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-slate-400">Manual Amount</label>
                                <input type="number" name="manualAmount" value={form.manualAmount} onChange={handleChange} placeholder="Total" className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm" />
                            </div>
                        </div>
                        <div className="mt-4 flex justify-end items-center gap-2">
                            <span className="text-slate-400 text-sm">Calculated Total:</span>
                            <span className="text-2xl font-bold text-green-400">₹{amount.toFixed(2)}</span>
                            {errors.amount && <p className="text-red-400 text-xs ml-2">{errors.amount}</p>}
                        </div>
                    </div>

                    {/* Section 5: Metadata */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Status</label>
                            <select name="statusId" value={form.statusId} onChange={handleChange} className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white text-sm focus:border-indigo-500 focus:outline-none">
                                <option value="">Select</option>
                                {statuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Mode</label>
                            <select name="modeId" value={form.modeId} onChange={handleChange} className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white text-sm focus:border-indigo-500 focus:outline-none">
                                <option value="">Select</option>
                                {modes.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Platform</label>
                            <select name="platformId" value={form.platformId} onChange={handleChange} className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white text-sm focus:border-indigo-500 focus:outline-none">
                                <option value="">Select</option>
                                {platforms.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Notes</label>
                        <textarea name="notes" value={form.notes} onChange={handleChange} rows="2" className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:border-indigo-500 focus:outline-none resize-none" placeholder="Any additional details..." />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 pt-4 border-t border-slate-700/50">
                        <button type="button" onClick={onClose} className="flex-1 px-6 py-3 bg-slate-800 text-slate-300 font-medium rounded-xl hover:bg-slate-700 transition-colors">Cancel</button>
                        <button type="submit" disabled={loading} className="flex-1 px-6 py-3 bg-indigo-500 text-white font-medium rounded-xl hover:bg-indigo-600 transition-colors disabled:opacity-50">
                            {loading ? 'Saving...' : 'Save Transaction'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TransactionModal;
